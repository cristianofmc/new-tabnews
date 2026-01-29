import database from "@/infra/database.js"

async function database_status(){
  const data = {}
  const status_query="select " +
  "current_setting('server_version') as server_version," +
  "current_setting('max_connections') as max_connections," + 
  "count(*) as current_connections from pg_stat_activity;";
  
  const result = await database.query(status_query);
  return result.rows[0];
}

export default { database_status };