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

    await fs.writeFile(files.model, getModelTemplate(table));
    await fs.writeFile(files.service, getServiceTemplate(table));
    await fs.writeFile(files.controller, getControllerTemplate(table));
    await fs.writeFile(files.routes, getRoutesTemplate(table));
  }
}

function getModelTemplate(table: string): string {
  const className = capitalize(table);
  return `// Modelo para ${table}\nexport class ${className} {\n  id: number;\n  // TODO: Agrega los campos de la tabla ${table}\n\n  constructor(init?: Partial<${className}>) {\n    Object.assign(this, init);\n  }\n}`;
}

function getServiceTemplate(table: string): string {
  const className = capitalize(table);
  return `// Servicio para ${table}\nimport { ${className} } from './${table}.model';\n\nexport class ${className}Service {\n  async findAll(): Promise<${className}[]> {\n    // TODO: Implementar lógica para obtener todos los registros\n    return [];\n  }\n\n  async findById(id: number): Promise<${className} | null> {\n    // TODO: Implementar lógica para obtener un registro por id\n    return null;\n  }\n\n  async create(data: Partial<${className}>): Promise<${className}> {\n    // TODO: Implementar lógica para crear un registro\n    return new ${className}(data);\n  }\n\n  async update(id: number, data: Partial<${className}>): Promise<${className} | null> {\n    // TODO: Implementar lógica para actualizar un registro\n    return null;\n  }\n\n  async delete(id: number): Promise<boolean> {\n    // TODO: Implementar lógica para eliminar un registro\n    return false;\n  }\n}`;
}

function getControllerTemplate(table: string): string {
  const className = capitalize(table);
  const serviceName = `${className}Service`;
  return `// Controlador para ${table}\nimport { ${serviceName} } from './${table}.service';\nimport { ${className} } from './${table}.model';\n\nexport class ${className}Controller {\n  private service = new ${serviceName}();\n\n  async getAll(req: any, res: any) {\n    const items = await this.service.findAll();\n    res.json(items);\n  }\n\n  async getById(req: any, res: any) {\n    const item = await this.service.findById(Number(req.params.id));\n    if (item) res.json(item);\n    else res.status(404).json({ message: '${className} not found' });\n  }\n\n  async create(req: any, res: any) {\n    const created = await this.service.create(req.body);\n    res.status(201).json(created);\n  }\n\n  async update(req: any, res: any) {\n    const updated = await this.service.update(Number(req.params.id), req.body);\n    if (updated) res.json(updated);\n    else res.status(404).json({ message: '${className} not found' });\n  }\n\n  async delete(req: any, res: any) {\n    const ok = await this.service.delete(Number(req.params.id));\n    if (ok) res.status(204).end();\n    else res.status(404).json({ message: '${className} not found' });\n  }\n}`;
}

function getRoutesTemplate(table: string): string {
  const className = capitalize(table);
  const controllerName = `${className}Controller`;
  return `// Rutas para ${table}\nimport { Router } from 'express';\nimport { ${controllerName} } from './${table}.controller';\n\nconst router = Router();\nconst controller = new ${controllerName}();\n\nrouter.get('/', (req, res) => controller.getAll(req, res));\nrouter.get('/:id', (req, res) => controller.getById(req, res));\nrouter.post('/', (req, res) => controller.create(req, res));\nrouter.put('/:id', (req, res) => controller.update(req, res));\nrouter.delete('/:id', (req, res) => controller.delete(req, res));\n\nexport default router;`;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
