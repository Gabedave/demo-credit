import { Knex } from "knex";
import { TransactionModel } from "../../models/transactions";
import client from "../DB/DB";
import TransactionNamespace from "./TransactionNamespace";

export default class WithdrawFromAccount {
  source: number;
  amount: number;
  activeTransactionId: number;
  initiatedBy: number;

  constructor(opts: { sourceWallet: number; amount: number }) {
    this.source = opts.sourceWallet;
    this.amount = opts.amount;
    this.initiatedBy = opts.sourceWallet;
  }

  public async call() {
    await this.createTransactionReference();
    let result;
    try {
      result = await TransactionNamespace.retryTransaction(
        3,
        client,
        this.withdrawFunds
      );
    } catch (err) {
      console.log("[TransferBetweenAccounts#withdrawFunds] An error occured.");
      await this.updateTransactionAsFailedOnError();
    } finally {
      if (result) {
        await this.updateTransactionOnSuccess();
        return result;
      }
    }
  }

  private async createTransactionReference() {
    const transactions = await TransactionModel().insert({
      status: "created",
      source_wallet: this.source || null,
      amount: this.amount || null,
      initiated_by: this.initiatedBy,
    });

    this.activeTransactionId = transactions[0];
  }

  private async updateTransactionAsFailedOnError() {
    await TransactionModel()
      .update({
        status: "failed",
        updated_at: client.fn.now(6),
      })
      .where({
        id: this.activeTransactionId,
      });
  }

  private async updateTransactionOnSuccess() {
    await TransactionModel()
      .update({
        status: "successful",
        updated_at: client.fn.now(6),
      })
      .where({
        id: this.activeTransactionId,
      });
  }

  private async withdrawFunds(
    client: Knex<any, unknown[]>,
    transaction: Knex.Transaction<any, any[]>
  ) {
    const rows = await client("wallets")
      .transacting(transaction)
      .select("balance")
      .where({
        id: this.source,
      });

    const currentBalance = rows[0].balance;
    if (currentBalance < this.amount) {
      console.error(`Insufficient funds; Account: ${this.source}`);
    }

    await client("wallets")
      .transacting(transaction)
      .update({
        balance: client.raw(`balance - ${this.amount}`),
        updated_at: client.fn.now(6),
      })
      .where({
        id: this.source,
      });

    const newRow = (
      await client("transactions")
        .transacting(transaction)
        .select(["balance"])
        .where({
          id: this.source,
        })
    )[0];

    return newRow;
  }
}
