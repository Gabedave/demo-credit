import { Knex, knex } from "knex";

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

export default client;
