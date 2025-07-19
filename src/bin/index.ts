#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { introspectDatabase } from "../db/introspect";
import { generateCrudModules } from "../generators/crudGenerator";
import path from "path";

// Configuración de la línea de comandos
const argv = yargs(hideBin(process.argv))
  .scriptName("crane")
  .usage("$0 [options]")
  .option("host", { 
    type: "string", 
    demandOption: true,
    description: "Database host"
  })
  .option("user", { 
    type: "string", 
    demandOption: true,
    description: "Database user"
  })
  .option("password", { 
    type: "string", 
    demandOption: true,
    description: "Database password"
  })
  .option("database", { 
    type: "string", 
    demandOption: true,
    description: "Database name"
  })
  .option("port", { 
    type: "number", 
    default: 3306,
    description: "Database port"
  })
  .option("output", { 
    type: "string", 
    default: path.join(process.cwd(), "src"),
    description: "Output directory for generated files"
  })
  .option("tables", {
    type: "string",
    description: "Comma-separated list of tables to generate (default: all tables)",
    coerce: (arg: string) => {
      if (!arg) return [];
      return arg.split(',').map(t => t.trim()).filter(Boolean);
    }
  })
  .option("verbose", {
    type: "boolean",
    default: false,
    description: "Show detailed logs"
  })
  .example([
    [
      "$0 --host localhost --user root --password pass --database mydb",
      "Generate CRUD modules for all tables in 'mydb' database"
    ],
    [
      "$0 -h localhost -u root -p pass -d mydb -o ./output",
      "Generate CRUD modules and save to ./output directory"
    ]
  ])
  .help()
  .version()
  .epilogue("For more information, visit https://github.com/your-repo/crane-generator")
  .argv;

// Función principal
async function main() {
  try {
    console.log("🚀 Iniciando generador CRUD...");
    
    // Mostrar configuración
    const config = await argv;
    if (config.verbose) {
      console.log("\n🔧 Configuración:");
      console.log(`- Base de datos: ${config.host}:${config.port}/${config.database}`);
      console.log(`- Usuario: ${config.user}`);
      console.log(`- Directorio de salida: ${path.resolve(config.output)}`);
    }

    // Paso 1: Obtener metadatos de la base de datos
    console.log("\n🔍 Conectando a la base de datos...");
    const startTime = Date.now();
    
    // Obtener todas las tablas
    let tables = await introspectDatabase(config);
    
    // Filtrar tablas si se especificó el parámetro
    if (config.tables && config.tables.length > 0) {
      const tablesToGenerate = new Set(config.tables.map((t: string) => t.toLowerCase()));
      const originalCount = tables.length;
      tables = tables.filter(table => tablesToGenerate.has(table.tableName.toLowerCase()));
      
      // Verificar si se encontraron todas las tablas solicitadas
      const notFoundTables = config.tables.filter(
        (t: string) => !tables.some(table => table.tableName.toLowerCase() === t.toLowerCase())
      );
      
      if (notFoundTables.length > 0) {
        console.warn(`⚠️  Las siguientes tablas no se encontraron: ${notFoundTables.join(', ')}`);
      }
      
      if (config.verbose) {
        console.log(`ℹ️  Se filtraron ${originalCount - tables.length} tablas de ${originalCount}`);
      }
    }
    
    if (tables.length === 0) {
      console.warn("⚠️  No hay tablas para generar después de aplicar los filtros");
      process.exit(0);
    }

    if (config.verbose) {
      console.log(`\n📊 Tablas encontradas (${tables.length}):`);
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.tableName} (${table.columns.length} columnas)`);
      });
    }

    // Paso 2: Generar módulos CRUD
    console.log("\n⚙️  Generando módulos CRUD...");
    await generateCrudModules(tables, config.output);

    // Mostrar resumen
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ ¡Generación completada en ${elapsedTime} segundos!`);
    console.log(`📂 Módulos guardados en: ${path.resolve(config.output)}`);
    console.log("\n🚀 ¡Listo! Ahora puedes importar los módulos generados en tu aplicación.");

  } catch (error: unknown) {
    console.error("\n❌ Error durante la generación:");
    
    // Verificar si es un error de MySQL
    if (error && typeof error === 'object' && 'code' in error) {
      const err = error as NodeJS.ErrnoException & { sqlMessage?: string };
      
      if (err.code === 'ECONNREFUSED') {
        console.error("No se pudo conectar a la base de datos. Verifica:");
        console.error("- Que el servidor de base de datos esté en ejecución");
        console.error("- Que los datos de conexión sean correctos");
        console.error("- Que el puerto sea el correcto y esté accesible");
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error("Error de autenticación. Verifica el usuario y contraseña.");
      } else if (err.code === 'ER_BAD_DB_ERROR') {
        console.error(`La base de datos no existe: ${err.sqlMessage || 'Base de datos no encontrada'}`);
      } else if (err.code) {
        console.error(`Error de base de datos (${err.code}): ${err.message}`);
      } else {
        console.error(err.message || 'Error desconocido');
      }
    } else if (error instanceof Error) {
      // Manejar otros errores de tipo Error
      console.error(error.message);
    } else {
      // Cualquier otro tipo de error
      console.error('Ocurrió un error inesperado');
    }
    
    // Mostrar detalles adicionales en modo DEBUG
    if (process.env.DEBUG && error instanceof Error) {
      console.error("\n🔍 Detalles técnicos:");
      console.error(error.stack || error);
    }
    
    process.exit(1);
  }
}

// Ejecutar la aplicación
main();
