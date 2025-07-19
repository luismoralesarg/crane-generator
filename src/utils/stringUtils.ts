/**
 * Convierte un string snake_case a PascalCase
 */
export function toPascalCase(str: string): string {
  if (!str) return '';
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convierte un string snake_case a camelCase
 */
export function toCamelCase(str: string): string {
  if (!str) return '';
  const s = toPascalCase(str);
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Mapea tipos de base de datos a tipos TypeScript
 */
export function mapDbTypeToTsType(dbType: string): string {
  if (!dbType) return 'any';
  
  const typeMap: Record<string, string> = {
    // Números
    'int': 'number',
    'integer': 'number',
    'smallint': 'number',
    'mediumint': 'number',
    'bigint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'float': 'number',
    'double': 'number',
    'real': 'number',
    'bit': 'number',
    'boolean': 'boolean',
    'bool': 'boolean',
    
    // Fechas
    'date': 'Date',
    'datetime': 'Date',
    'timestamp': 'Date',
    'time': 'string',
    'year': 'number',
    
    // Strings
    'char': 'string',
    'varchar': 'string',
    'tinytext': 'string',
    'text': 'string',
    'mediumtext': 'string',
    'longtext': 'string',
    'binary': 'Buffer',
    'varbinary': 'Buffer',
    'tinyblob': 'Buffer',
    'blob': 'Buffer',
    'mediumblob': 'Buffer',
    'longblob': 'Buffer',
    'enum': 'string',
    'set': 'string',
    
    // JSON
    'json': 'any',
    'jsonb': 'any',
  };

  const lowerType = dbType.toLowerCase().split('(')[0]; // Elimina parámetros como en varchar(255)
  return typeMap[lowerType] || 'any';
}
