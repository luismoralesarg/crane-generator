export interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: any;
  isPrimaryKey: boolean;
}

export interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
}
