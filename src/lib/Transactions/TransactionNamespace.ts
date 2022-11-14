import { Knex } from "knex";
import DepositIntoAccount from "./DepositIntoAccount";
import TransferBetweenAccounts from "./TransferBetweenAccounts";
import WithdrawFromAccount from "./WithdrawFromAccount";

// Wrapper for database transactions to retry transactions
async function retryTransaction(
  maxTries: number,
  client: Knex<any, unknown[]>,
  operationToPerform: (
    client: Knex<any, unknown[]>,
    transaction: Knex.Transaction<any, any[]>
  ) => Promise<any>
) {
  let start = 0;

  const transactionProvider = client.transactionProvider();

  const transaction = await transactionProvider();

  while (true) {
    if (start === maxTries) {
      throw new Error("Max retries reached.");
    }

    start++;

    try {
      const result = await operationToPerform(client, transaction);
      await transaction.commit();

      return result;
    } catch (err) {
      if (err.code !== "40001") {
        console.log(err.message);
        throw err;
      } else {
        console.log("Transaction failed. Retrying...");
        console.log(err.message);
        await transaction.rollback();

        // set exponential backoff
        await new Promise((r) => setTimeout(r, 2 ** start * 1000));
      }
    }
  }
}

const withdrawFromAccount = (opts: {
  sourceWallet: string;
  amount: number;
}) => {
  return new WithdrawFromAccount(opts).call();
};

const depositIntoAccount = (opts: {
  destinationWallet: string;
  amount: number;
}) => {
  return new DepositIntoAccount(opts).call();
};

const transferBetweenAccounts = (opts: {
  sourceWallet: string;
  destinationWallet: string;
  amount: number;
}) => {
  return new TransferBetweenAccounts(opts).call();
};

const TransactionNamespace = {
  retryTransaction,
  withdrawFromAccount,
  depositIntoAccount,
  transferBetweenAccounts,
};

export default TransactionNamespace;
