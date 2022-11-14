import { UserModel } from "../../models/users";
import { WalletModel } from "../../models/wallets";
import TransactionNamespace from "../Transactions/TransactionNamespace";

const validTransactionTypes = ["withdrawal", "deposit", "transfer"];

const withdrawFromAccount = async (opts: {
  userId: string;
  amount: number;
}) => {
  const sourceWallet = (await findUserById(opts.userId)).wallet_id;
  console.log({ sourceWallet });
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
  const users = await UserModel().select("*").where("id", id);
  return users[0];
};

const createUser = async (opts: {
  firstName: string;
  lastName: string;
  email: string;
}) => {
  const users = await UserModel().insert({
    first_name: opts.firstName,
    last_name: opts.lastName,
    email: opts.email,
  });
  console.log({ users });
  const wallet = await WalletModel().insert({
    user_id: users[0],
  });
  console.log({ wallet });
  return (
    await UserModel().update({
      wallet_id: wallet[0],
    })
  )[0];
};

const checkBalance = async (opts: { userId: string }) => {
  const balance = await WalletModel().select("*").where("user_id", opts.userId);

  return balance[0];
};

const UserNamespace = {
  findUserById,
  withdrawFromAccount,
  depositIntoAccount,
  transferToAnotherUser,
  createUser,
  makeTransaction,
  checkBalance,
};

export default UserNamespace;
