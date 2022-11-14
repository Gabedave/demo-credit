import { Router, Request, Response } from "express";
import UserNamespace from "../lib/Users/UserNamespace";
import ResponseNamespace from "../utils/ResponseNamespace";
import ValidateNamespace from "../utils/ValidateNamespace";

class UserRouter {
  router: Router;

  constructor() {
    this.router = Router();

    this.init();
  }

  private async registerNewUser(req: Request, res: Response) {
    const email = req.body.email;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;

    if (
      !ValidateNamespace.validateRequiredFieldsNotUndefined([
        email,
        firstName,
        lastName,
      ])
    ) {
      return ResponseNamespace.sendRequiredParameterMissingError(res);
    }

    try {
      const data = await UserNamespace.createUser({
        firstName,
        lastName,
        email,
      });

      return ResponseNamespace.sendSuccess(
        res,
        201,
        data,
        "User created successfully"
      );
    } catch (err) {
      console.log("Error creating user", err);

      return ResponseNamespace.sendError(
        res,
        500,
        `Error creating user. ${err?.message || ""}`
      );
    }
  }

  private init() {
    this.router.post("/users", this.registerNewUser);
  }
}

const userRouter = new UserRouter().router;

export default userRouter;
