import { Knex } from "knex";
import { TransactionModel } from "../../models/transactions";
import { WalletModel } from "../../models/wallets";
import client from "../DB/DB";
import TransactionNamespace from "./TransactionNamespace";

export default class WithdrawFromAccount {
  source: number;
  amount: number;
  activeTransactionId: number;
  initiatedBy: number;

  constructor(opts: {
    sourceWallet: number;
    amount: number;
    initiatedBy: number;
  }) {
    this.source = opts.sourceWallet;
    this.amount = opts.amount;
    this.initiatedBy = opts.initiatedBy;
  }

  public async call() {
    await this.createTransactionReference();
    let result;
    try {
      result = await TransactionNamespace.retryTransaction(
        3,
        client,
        this.withdrawFunds,
        { source: this.source, amount: this.amount }
      );
      await this.updateTransactionOnSuccess();
      return result;
    } catch (err) {
      console.log("[TransferBetweenAccounts#withdrawFunds] An error occured.");
      await this.updateTransactionAsFailedOnError();
      throw err;
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
    transaction: Knex.Transaction<any, any[]>,
    opts?: { source?: number; receiver?: number; amount: number }
  ) {
    const rows = await WalletModel()
      .transacting(transaction)
      .select("balance")
      .where({
        id: opts.source,
      });

    const currentBalance = rows[0].balance;
    if (currentBalance < opts.amount) {
      console.error(`Insufficient funds; Account: ${opts.source}`);
      throw new Error(`Insufficient funds; Account: ${opts.source}`);
    }

    await WalletModel()
      .transacting(transaction)
      .update({
        balance: client.raw(`balance - ${opts.amount}`),
        updated_at: client.fn.now(6),
      })
      .where({
        id: opts.source,
      });

    const newRow = (
      await WalletModel().transacting(transaction).select("*").where({
        id: opts.source,
      })
    )[0];

    return newRow;
  }
}
