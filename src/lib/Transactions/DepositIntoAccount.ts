import { Knex } from "knex";
import TransactionModel from "../../models/transactions";
import client from "../DB/DB";
import TransactionNamespace from "./TransactionNamespace";

export default class DepositIntoAccount {
  receiver: string;
  amount: number;
  activeTransactionId: string;
  initiatedBy: string;

  constructor(opts: { destinationWallet: string; amount: number }) {
    this.receiver = opts.destinationWallet;
    this.amount = opts.amount;
    this.initiatedBy = opts.destinationWallet;
  }

  public async call() {
    await this.createTransactionReference();
    let result;
    try {
      result = await TransactionNamespace.retryTransaction(
        3,
        client,
        this.depositFunds
      );
    } catch (err) {
      console.log("[TransferBetweenAccounts#depositFunds] An error occured.");
      await this.updateTransactionAsFailedOnError();
    } finally {
      if (result) {
        await this.updateTransactionOnSuccess();
        return result;
      }
    }
  }

  private async createTransactionReference() {
    const transactions = await TransactionModel.insert(
      {
        status: "created",
        receiver_wallet: this.receiver || null,
        amount: this.amount || null,
        initiated_by: this.initiatedBy,
      },
      ["id"]
    );

    this.activeTransactionId = transactions[0].id;
  }

  private async updateTransactionAsFailedOnError() {
    await TransactionModel.update({
      status: "failed",
      updated_at: client.fn.now(6),
    }).where({
      id: this.activeTransactionId,
    });
  }

  private async updateTransactionOnSuccess() {
    await TransactionModel.update({
      status: "successful",
      updated_at: client.fn.now(6),
    }).where({
      id: this.activeTransactionId,
    });
  }

  private async depositFunds(
    client: Knex<any, unknown[]>,
    transaction: Knex.Transaction<any, any[]>
  ) {
    await client("wallets")
      .transacting(transaction)
      .update({
        balance: client.raw(`balance + ${this.amount}`),
        updated_at: client.fn.now(6),
      })
      .where({
        id: this.receiver,
      });

    const newRow = (
      await client("accounts")
        .transacting(transaction)
        .select(["balance"])
        .where({
          id: this.receiver,
        })
    )[0];

    return newRow;
  }
}
