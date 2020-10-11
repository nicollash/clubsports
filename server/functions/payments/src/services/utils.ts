export const buildInsertQuery = (row: any, tableName: string) => {
  let sql = '';
  let values = '';
  let params = [];
  for (let fieldName in row) {
    sql += fieldName + ',';
    values += '?,';
    params.push(row[fieldName]);
  }
  sql = `INSERT INTO ${tableName}\n   (${sql.slice(
    0,
    -1
  )}) \nVALUES (${values.slice(0, -1)})`;
  return { sql, params };
};
