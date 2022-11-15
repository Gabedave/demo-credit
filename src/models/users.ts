import client from "../lib/DB/DB";

export interface UserSchema {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  wallet_id: number;
  created_at: string;
  updated_at: string;
}

export async function persistUserTable() {
  if (await client.schema.hasTable("users")) return;

  return client.schema.createTable("users", (table) => {
    table.increments("id").primary();

    table.string("first_name");
    table.string("last_name");
    table.string("email").unique();

    table.integer("wallet_id").unsigned().unique();
    table.foreign("wallet_id").references("wallets.id");

    table.timestamp("created_at", { precision: 6 }).defaultTo(client.fn.now(6));
    table.timestamp("updated_at", { precision: 6 }).defaultTo(client.fn.now(6));
  });
}

const UserModel = () => client<UserSchema>("users");

export { UserModel };
