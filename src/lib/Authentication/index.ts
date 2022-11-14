import { Response, Request } from "express";
import ResponseNamespace from "../../utils/ResponseNamespace";
import UserNamespace from "../Users/UserNamespace";

// faux authentication
export function verifyUserToken(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization.split(" ")[1];

  if (token !== "faux_token") {
    return ResponseNamespace.sendError(res, 401, "Unauthorized. Invalid token");
  }
  next();
}

export function verifyUserExists(req: Request, res: Response, next: Function) {
  const userId = req.body.user_id;
  const user = UserNamespace.findUserById(userId);
  if (!user) {
    return ResponseNamespace.sendError(
      res,
      401,
      "Unauthorized. User does not exist"
    );
  }
  next();
}
