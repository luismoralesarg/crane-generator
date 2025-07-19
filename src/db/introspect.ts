import mysql from "mysql2/promise";
import { TableInfo } from "../types/database";

export async function introspectDatabase(config: any): Promise<TableInfo[]> {
  const conn = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
  });

  try {
    // Obtener tablas
    const [tables] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_TYPE = 'BASE TABLE'`,
      [config.database]
    );

    // Para cada tabla, obtener sus columnas
    const tablesInfo: TableInfo[] = [];
    
    for (const { TABLE_NAME } of tables) {
      const [columns] = await conn.execute<mysql.RowDataPacket[]>(`
        SELECT 
          COLUMN_NAME as columnName,
          DATA_TYPE as dataType,
          IS_NULLABLE = 'YES' as isNullable,
          COLUMN_DEFAULT as columnDefault,
          COLUMN_KEY = 'PRI' as isPrimaryKey
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [config.database, TABLE_NAME]);

      tablesInfo.push({
        tableName: TABLE_NAME,
        columns: columns.map(col => ({
          columnName: col.columnName,
          dataType: col.dataType,
          isNullable: Boolean(col.isNullable),
          columnDefault: col.columnDefault,
          isPrimaryKey: Boolean(col.isPrimaryKey)
        }))
      });
    }

    return tablesInfo;
  } finally {
    await conn.end();
  }
}
