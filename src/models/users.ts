import client from "../lib/DB/DB";

export interface UserSchema {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  wallet_id: string;
  created_at: string;
  updated_at: string;
}

async function persistTable() {
  client.schema.createTableIfNotExists("users", (table) => {
    table.uuid("id", { primaryKey: true, useBinaryUuid: true });
    table.string("first_name");
    table.string("last_name");
    table.string("email");
    table.foreign("wallet_id").references("wallets.id");

    table.timestamp("created_at", { precision: 6 }).defaultTo(client.fn.now(6));
    table.timestamp("updated_at", { precision: 6 }).defaultTo(client.fn.now(6));
  });
}

persistTable();

const UserModel = client<UserSchema>("users");

export default UserModel;
