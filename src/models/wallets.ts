import client from "../lib/DB/DB";

export interface WalletSchema {
  id: string;
  balance: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

async function persistTable() {
  client.schema.createTableIfNotExists("wallets", (table) => {
    table.uuid("id", { primaryKey: true, useBinaryUuid: true });
    table.decimal("balance");
    table.foreign("user_id").references("users.id");

    table.timestamp("created_at", { precision: 6 }).defaultTo(client.fn.now(6));
    table.timestamp("updated_at", { precision: 6 }).defaultTo(client.fn.now(6));
  });
}

persistTable();

const WalletModel = client<WalletSchema>("wallets");

export default WalletModel;
