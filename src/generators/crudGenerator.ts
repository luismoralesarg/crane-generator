import fs from 'fs-extra';
import path from 'path';
import { TableInfo } from '../types/database';
import { toPascalCase, toCamelCase, mapDbTypeToTsType } from '../utils/stringUtils';

type FileTemplates = {
  model: string;
  service: string;
  controller: string;
  routes: string;
};

export async function generateCrudModules(tables: TableInfo[], output: string): Promise<void> {
  if (!tables || tables.length === 0) {
    console.warn('⚠️ No se proporcionaron tablas para generar');
    return;
  }

  // Crear directorio base si no existe
  await fs.ensureDir(output);
  console.log(`📂 Directorio de salida: ${path.resolve(output)}`);

  for (const tableInfo of tables) {
    try {
      await generateModule(tableInfo, output);
      console.log(`✅ Módulo generado: ${tableInfo.tableName}`);
    } catch (error) {
      console.error(`❌ Error generando módulo ${tableInfo.tableName}:`, error);
    }
  }
}

async function generateModule(tableInfo: TableInfo, output: string): Promise<void> {
  const { tableName, columns } = tableInfo;
  const className = toPascalCase(tableName);
  const dir = path.join(output, 'modules', tableName);
  
  // Asegurarse de que exista el directorio
  await fs.ensureDir(dir);

  // Generar los templates
  const templates = await generateTemplates(className, columns);
  
  // Escribir los archivos
  const files = {
    model: path.join(dir, `${tableName}.model.ts`),
    service: path.join(dir, `${tableName}.service.ts`),
    controller: path.join(dir, `${tableName}.controller.ts`),
    routes: path.join(dir, `${tableName}.routes.ts`),
  };

  await Promise.all([
    fs.writeFile(files.model, templates.model),
    fs.writeFile(files.service, templates.service),
    fs.writeFile(files.controller, templates.controller),
    fs.writeFile(files.routes, templates.routes),
  ]);
}

async function generateTemplates(className: string, columns: any[]): Promise<FileTemplates> {
  const modelContent = generateModel(className, columns);
  const serviceContent = generateService(className);
  const controllerContent = generateController(className);
  const routesContent = generateRoutes(className);

  return {
    model: modelContent,
    service: serviceContent,
    controller: controllerContent,
    routes: routesContent,
  };
}

function generateModel(className: string, columns: any[]): string {
  const properties = columns
    .filter(col => col.columnName !== 'id')
    .map(col => {
      const type = mapDbTypeToTsType(col.dataType);
      const nullable = col.isNullable ? ' | null' : '';
      const defaultValue = col.columnDefault !== null ? ` = ${getDefaultValue(col)}` : '';
      return `  ${col.columnName}: ${type}${nullable}${defaultValue};`;
    })
    .join('\n');

  return `export interface I${className} {
  id: number${columns.length > 0 ? ';' : ''}
${properties}
}

export class ${className} implements I${className} {
  id: number = 0;
${properties.split('\n').map(p => `  ${p}`).join('\n')}

  constructor(data: Partial<I${className}> = {}) {
    Object.assign(this, data);
  }
}
`;
}

function generateService(className: string): string {
  const lowerClassName = toCamelCase(className);

  return `import { I${className}, ${className} } from './${lowerClassName}.model';

export class ${className}Service {
  constructor() {}

  async findAll(): Promise<${className}[]> {
    return [];
  }

  async findById(id: number): Promise<${className} | null> {
    return null;
  }

  async create(data: Omit<I${className}, 'id'>): Promise<${className}> {
    return new ${className}({ id: 1, ...data });
  }

  async update(id: number, data: Partial<I${className}>): Promise<${className} | null> {
    return null;
  }

  async delete(id: number): Promise<boolean> {
    return true;
  }
}
`;
}

function generateController(className: string): string {
  const lowerClassName = toCamelCase(className);
  const serviceName = `${className}Service`;

  return `import { Request, Response } from 'express';
import { ${serviceName} } from './${lowerClassName}.service';
import { ${className} } from './${lowerClassName}.model';

export class ${className}Controller {
  private service = new ${serviceName}();

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.service.findAll();
      res.json(items);
    } catch (error) {
      console.error('Error en ${className}Controller.getAll:', error);
      res.status(500).json({ message: 'Error al obtener los registros' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }

      const item = await this.service.findById(id);
      if (!item) {
        return res.status(404).json({ message: '${className} no encontrado' });
      }
      
      res.json(item);
    } catch (error) {
      console.error('Error en ${className}Controller.getById:', error);
      res.status(500).json({ message: 'Error al obtener el registro' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error en ${className}Controller.create:', error);
      res.status(400).json({ message: 'Error al crear el registro' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }

      const updated = await this.service.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: '${className} no encontrado' });
      }
      
      res.json(updated);
    } catch (error) {
      console.error('Error en ${className}Controller.update:', error);
      res.status(400).json({ message: 'Error al actualizar el registro' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }

      const success = await this.service.delete(id);
      if (!success) {
        return res.status(404).json({ message: '${className} no encontrado' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error en ${className}Controller.delete:', error);
      res.status(500).json({ message: 'Error al eliminar el registro' });
    }
  }
}
`;
}

function generateRoutes(className: string): string {
  const lowerClassName = toCamelCase(className);
  const controllerName = `${className}Controller`;

  return `import { Router } from 'express';
import { ${controllerName} } from './${lowerClassName}.controller';

const router = Router();
const controller = new ${controllerName}();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
`;
}

function getDefaultValue(column: any): string {
  if (column.columnDefault === null) return '';
  
  const type = column.dataType.toLowerCase();
  
  // Manejar valores por defecto comunes
  if (type.includes('int') || type.includes('float') || type.includes('double') || type.includes('decimal')) {
    return column.columnDefault;
  }
  
  if (type.includes('bool')) {
    return column.columnDefault === '1' ? 'true' : 'false';
  }
  
  // Para strings, añadir comillas
  return `'${column.columnDefault}'`;
}
