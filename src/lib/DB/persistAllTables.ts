import { persistTransactionTable } from "../../models/transactions";
import { persistUserTable } from "../../models/users";
import { persistWalletTable } from "../../models/wallets";

export async function persistAllTables() {
  return Promise.all([
    persistWalletTable(),
    persistUserTable(),
    persistTransactionTable(),
  ]);
}
