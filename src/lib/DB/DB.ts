import knex, { Knex } from "knex";
import { persistAllTables } from "./persistAllTables";

const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, DB_NAME } =
  process.env;

const config: Knex.Config = {
  client: "mysql",
  connection: {
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: DB_NAME,
  },
};

const client = knex(config);

// test database connection
client
  .raw("select 1+1 as result")
  .then(async () => {
    console.log("Database connected successfully");
    await persistAllTables();
  })
  .catch((err) => {
    console.log("Database failed to connect", err);
    throw err;
  });

export default client;
