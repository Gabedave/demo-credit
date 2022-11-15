import { v4 } from "uuid";
import client from "../lib/DB/DB";

export interface TransactionSchema {
  id: number;
  status: "created" | "successful" | "failed";
  source_wallet: number;
  receiver_wallet: number;
  amount: number;
  initiated_by: number;
  created_at: string;
  updated_at: string;
}

export async function persistTransactionTable() {
  if (await client.schema.hasTable("transactions")) return;

  return client.schema.createTable("transactions", (table) => {
    table.increments("id").primary();

    table
      .enum("status", ["created", "successful", "failed"])
      .defaultTo("created");

    table.integer("source_wallet").unsigned().defaultTo(null);
    table.foreign("source_wallet").references("wallets.id");

    table.integer("receiver_wallet").unsigned().defaultTo(null);
    table.foreign("receiver_wallet").references("wallets.id");

    table.integer("initiated_by").unsigned().notNullable();
    table.foreign("initiated_by").references("users.id");

    table.decimal("amount").defaultTo(null);

    table.timestamp("created_at", { precision: 6 }).defaultTo(client.fn.now(6));
    table.timestamp("updated_at", { precision: 6 }).defaultTo(client.fn.now(6));
  });
}

const TransactionModel = () => client<TransactionSchema>("transactions");

export { TransactionModel };
