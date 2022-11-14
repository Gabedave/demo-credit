import * as express from "express";
import helmet from "helmet";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as cors from "cors";
import UserRouter from "./controllers/UserRouter";
import AccountsRouter from "./controllers/AccountsRouter";

class App {
  app: any;

  constructor() {
    this.app = express();

    this.config();
    this.routes();
  }

  private config() {
    this.app.use(bodyParser.json());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
  }

  private routes() {
    this.app.use("/health", (req, res) => {
      res.send({ message: "healthy" });
    });

    this.app.use("/users/api/v1/", UserRouter);
    this.app.use("/accounts/api/v1", AccountsRouter);
  }
}

export default App;
