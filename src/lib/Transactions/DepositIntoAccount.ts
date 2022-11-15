import { Knex } from "knex";
import { TransactionModel } from "../../models/transactions";
import { WalletModel } from "../../models/wallets";
import client from "../DB/DB";
import TransactionNamespace from "./TransactionNamespace";

export default class DepositIntoAccount {
  receiver: number;
  amount: number;
  activeTransactionId: number;
  initiatedBy: number;

  constructor(opts: {
    destinationWallet: number;
    amount: number;
    initiatedBy: number;
  }) {
    this.receiver = opts.destinationWallet;
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
        this.depositFunds,
        { receiver: this.receiver, amount: this.amount }
      );
      await this.updateTransactionOnSuccess();
      return result;
    } catch (err) {
      console.log("[TransferBetweenAccounts#depositFunds] An error occured.");
      await this.updateTransactionAsFailedOnError();
    }
  }

  private async createTransactionReference() {
    const transactions = await TransactionModel().insert({
      status: "created",
      receiver_wallet: this.receiver || null,
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

  private async depositFunds(
    client: Knex<any, unknown[]>,
    transaction: Knex.Transaction<any, any[]>,
    opts?: { source?: number; receiver?: number; amount: number }
  ) {
    await WalletModel()
      .transacting(transaction)
      .update({
        balance: client.raw(`balance + ${opts.amount}`),
        updated_at: client.fn.now(6),
      })
      .where({
        id: opts.receiver,
      });

    const newRow = (
      await WalletModel().transacting(transaction).select("*").where({
        id: opts.receiver,
      })
    )[0];

    return newRow;
  }
}
