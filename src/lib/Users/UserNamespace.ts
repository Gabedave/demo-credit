import UserModel from "../../models/users";
import client from "../DB/DB";
import TransactionNamespace from "../Transactions/TransactionNamespace";

const validTransactionTypes = ["withdrawal", "deposit", "transfer"];

const withdrawFromAccount = async (opts: {
  userId: string;
  amount: number;
}) => {
  const sourceWallet = (await findUserById(opts.userId)).wallet_id;
  return TransactionNamespace.withdrawFromAccount({
    sourceWallet: sourceWallet,
    amount: opts.amount,
  });
};

const depositIntoAccount = async (opts: { userId: string; amount: number }) => {
  const receiverWallet = (await findUserById(opts.userId)).wallet_id;
  return TransactionNamespace.depositIntoAccount({
    destinationWallet: receiverWallet,
    amount: opts.amount,
  });
};

const transferToAnotherUser = async (opts: {
  userId: string;
  amount: number;
  receiverId: string;
}) => {
  if (!opts.receiverId) {
    throw new Error("Receiver missing");
  }
  const receiverWallet = (await findUserById(opts.receiverId)).wallet_id;
  const sourceWallet = (await findUserById(opts.userId)).wallet_id;
  return TransactionNamespace.transferBetweenAccounts({
    sourceWallet: sourceWallet,
    destinationWallet: receiverWallet,
    amount: opts.amount,
  });
};

const makeTransaction = async (opts: {
  transactionType: string;
  userId: string;
  receiverId?: string;
  amount: number;
}) => {
  if (!validTransactionTypes.includes(opts.transactionType)) {
    throw new Error("Invalid Transaction Type");
  }
  switch (opts.transactionType) {
    case "withdrawal":
      return withdrawFromAccount({ userId: opts.userId, amount: opts.amount });
    case "deposit":
      return depositIntoAccount({ userId: opts.userId, amount: opts.amount });
    case "transaction":
      return transferToAnotherUser({
        userId: opts.userId,
        amount: opts.amount,
        receiverId: opts.receiverId,
      });
    default:
      throw new Error("Invalid Transaction Type");
  }
};

const findUserById = async (id: string) => {
  const users = await UserModel.select("*").where("id", id);
  return users[0];
};

const createUser = async (opts: {
  firstName: string;
  lastName: string;
  email: string;
}) => {
  const users = await UserModel.insert(
    {
      first_name: opts.firstName,
      last_name: opts.lastName,
      email: opts.email,
    },
    []
  );
  return users[0];
};

const UserNamespace = {
  findUserById,
  withdrawFromAccount,
  depositIntoAccount,
  transferToAnotherUser,
  createUser,
  makeTransaction,
};

export default UserNamespace;
