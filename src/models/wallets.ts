import client from "../lib/DB/DB";

export interface WalletSchema {
  id: number;
  balance: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export async function persistWalletTable() {
  if (await client.schema.hasTable("wallets")) return;

  return client.schema.createTable("wallets", (table) => {
    table.increments("id").primary();

    table.decimal("balance").defaultTo(0.0);

    table.integer("user_id").notNullable();
    table.foreign("user_id").references("users.id");

    table.timestamp("created_at", { precision: 6 }).defaultTo(client.fn.now(6));
    table.timestamp("updated_at", { precision: 6 }).defaultTo(client.fn.now(6));
  });
}

const WalletModel = () => client<WalletSchema>("wallets");

export { WalletModel };
