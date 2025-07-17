import fs from "fs-extra";
import path from "path";

export async function generateCrudModules(tables: string[], output: string) {
  for (const table of tables) {
    const dir = path.join(output, "modules", table);
    await fs.ensureDir(dir);

    const files = {
      controller: `${dir}/${table}.controller.ts`,
      service: `${dir}/${table}.service.ts`,
      routes: `${dir}/${table}.routes.ts`,
      model: `${dir}/${table}.model.ts`,
    };

    await fs.writeFile(
      files.model,
      `// Modelo para ${table}\nexport class ${capitalize(table)} {}`
    );
    await fs.writeFile(files.service, `// Servicio para ${table}`);
    await fs.writeFile(files.controller, `// Controlador para ${table}`);
    await fs.writeFile(files.routes, `// Rutas para ${table}`);
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
