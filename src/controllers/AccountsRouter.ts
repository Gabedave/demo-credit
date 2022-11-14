import { Router, Request, Response } from "express";
import { verifyUserExists, verifyUserToken } from "../lib/Authentication";
import UserNamespace from "../lib/Users/UserNamespace";
import ResponseNamespace from "../utils/ResponseNamespace";
import ValidateNamespace from "../utils/ValidateNamespace";

class AccountsRouter {
  router: Router;

  constructor() {
    this.router = Router();

    this.init();
  }

  private async createTransaction(req: Request, res: Response) {
    const userId = req.body.user_id;
    const transactionType = req.body.transaction_type;
    const receiverId = req.body.receiver_id;
    const amount = req.body.amount;

    if (
      !ValidateNamespace.validateRequiredFieldsNotUndefined([
        userId,
        transactionType,
        amount,
      ])
    ) {
      return ResponseNamespace.sendRequiredParameterMissingError(res);
    }

    try {
      const data = await UserNamespace.makeTransaction({
        transactionType: transactionType,
        userId: userId,
        receiverId: receiverId,
        amount: amount,
      });

      return ResponseNamespace.sendSuccess(
        res,
        200,
        data,
        "Transaction successful"
      );
    } catch (err) {
      console.log("Error creating transaction. ", err);

      return ResponseNamespace.sendError(
        res,
        500,
        `Error creating transaction. ${err?.message || ""}`
      );
    }
  }

  private init() {
    this.router.post(
      "/transactions",
      verifyUserToken,
      verifyUserExists,
      this.createTransaction
    );
  }
}

const accountsRouter = new AccountsRouter().router;

export default accountsRouter;
