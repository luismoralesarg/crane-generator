import mysql from "mysql2/promise";

export async function introspectDatabase(config: any) {
  const conn = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
  });

  const [rows] = await conn.execute(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
    [config.database]
  );

  const tables = (rows as any[]).map((row) => row.TABLE_NAME);
  await conn.end();
  return tables;
}
