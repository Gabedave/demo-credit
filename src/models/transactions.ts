import client from "../lib/DB/DB";

export interface TransactionSchema {
  id: string;
  status: "created" | "successful" | "failed";
  source_wallet: string;
  receiver_wallet: string;
  amount: number;
  initiated_by: string;
  created_at: string;
  updated_at: string;
}

async function persistTable() {
  client.schema.createTableIfNotExists("transactions", (table) => {
    table.uuid("id", { primaryKey: true, useBinaryUuid: true });
    table
      .enum("status", ["created", "successful", "failed"])
      .defaultTo("created");
    table.foreign("source_wallet").references("wallets.id").nullable();
    table.foreign("receiver_wallet").references("wallets.id").nullable();
    table.foreign("initiated_by").references("users.id");

    table.timestamp("created_at", { precision: 6 }).defaultTo(client.fn.now(6));
    table.timestamp("updated_at", { precision: 6 }).defaultTo(client.fn.now(6));
  });
}

persistTable();

const TransactionModel = client<TransactionSchema>("transactions");

export default TransactionModel;
