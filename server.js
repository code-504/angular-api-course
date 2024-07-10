import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import CustomError from "./utils/customError.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

try {
  await mongoose.connect(String(process.env.MONGODB_URI));
  console.log("You successfully connected to MongoDB!");
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
}

const accountSchema = new mongoose.Schema({
  name: String,
  balance: Number,
  address: String,
});

const transactionSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: Number,
  date: Date,
});

const Account = mongoose.model("Account", accountSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

app.get("/api/accounts", async (req, res, next) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (error) {
    next(new CustomError(500, "Error retrieving accounts"));
  }
});

app.post("/api/accounts", async (req, res, next) => {
  try {
    const newAccount = new Account(req.body);
    await newAccount.save();
    res.json(newAccount);
  } catch (error) {
    next(new CustomError(500, "Error creating account"));
  }
});

app.put("/api/accounts/:id", async (req, res, next) => {
  try {
    console.log("NEw data", req.params.id, req.body);

    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAccount) throw new CustomError(404, "Account not found");
    res.json(updatedAccount);
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Error updating account")
    );
  }
});

app.delete("/api/accounts/:id", async (req, res, next) => {
  try {
    const deletedAccount = await Account.findByIdAndDelete(req.params.id);
    if (!deletedAccount) throw new CustomError(404, "Account not found");
    res.json({ message: "Account deleted" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Error deleting account")
    );
  }
});

app.get("/api/accounts/totalBalance", async (req, res, next) => {
  try {
    const accounts = await Account.find();
    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance,
      0
    );
    res.json(totalBalance);
  } catch (error) {
    next(new CustomError(500, "Error calculating total balance"));
  }
});

app.get("/api/transactions", async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    next(new CustomError(500, "Error retrieving transactions"));
  }
});

app.post("/api/transactions", async (req, res, next) => {
  try {
    console.log(req.body);
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.json(newTransaction);
  } catch (error) {
    next(new CustomError(500, "Error creating transaction"));
  }
});

app.put("/api/transactions/:id", async (req, res, next) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTransaction)
      throw new CustomError(404, "Transaction not found");
    res.json(updatedTransaction);
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Error updating transaction")
    );
  }
});

app.delete("/api/transactions/:id", async (req, res, next) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTransaction)
      throw new CustomError(404, "Transaction not found");
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Error deleting transaction")
    );
  }
});

app.get("/api/transactions/totalBalance", async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    const totalBalance = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    res.json(totalBalance);
  } catch (error) {
    next(new CustomError(500, "Error calculating total balance"));
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
