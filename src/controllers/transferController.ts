import { Request, Response } from "express";
import { uuidv7 } from "uuidv7";
import { getClient } from "../config/db";

const handleTransfer = async (req: Request, res: Response) => {
  const { senderId, receiverId, amount, note } = req.body;

  if (!senderId || !receiverId || !amount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (amount <= 0 || typeof amount !== "number") {
    return res
      .status(400)
      .json({ message: "Amount must be greater than zero" });
  }

  if (senderId === receiverId) {
    return res
      .status(400)
      .json({ message: "Sender and receiver cannot be the same" });
  }

  const client = await getClient();
  try {
    await client.query("BEGIN");
    const arr = [senderId, receiverId].sort((a, b) => a.localeCompare(b));
    const firstLockId = arr[0];
    const secondLockId = arr[1];

    await client.query("SELECT id FROM accounts WHERE id = $1 FOR UPDATE", [
      firstLockId,
    ]);

    await client.query("SELECT id FROM accounts WHERE id = $1 FOR UPDATE", [
      secondLockId,
    ]);

    const balanceResult = await client.query(
      "SELECT COALESCE(SUM(debit) - SUM(credit), 0) AS balance FROM journal_entries WHERE account_id = $1",
      [senderId],
    );

    const balance = Number(balanceResult.rows[0].balance);
    if (balance < amount) {
      throw new Error("Insufficient funds");
    }

    const transferId = uuidv7();
    const transactionNote =
      note || `Transfer from ${senderId} to ${receiverId}`;
    const newTransaction = await client.query(
      "INSERT INTO transactions (id, note) VALUES ($1, $2) RETURNING id",
      [transferId, transactionNote],
    );

    const journalEntriesIdCredit = uuidv7();
    const journalEntriesIdDebit = uuidv7();
    const transactionId = newTransaction.rows[0].id;
    await client.query(
      "INSERT INTO journal_entries (id, transaction_id, account_id, debit, credit) VALUES ($1, $2, $3, $4, $5)",
      [journalEntriesIdCredit, transactionId, senderId, 0, amount],
    );

    await client.query(
      "INSERT INTO journal_entries (id, transaction_id, account_id, debit, credit) VALUES ($1, $2, $3, $4, $5)",
      [journalEntriesIdDebit, transactionId, receiverId, amount, 0],
    );

    await client.query("COMMIT");
    return res
      .status(200)
      .json({ message: "Transfer successful", transactionId });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error) {
      if (error.message === "Insufficient funds") {
        return res.status(400).json({ message: "Insufficient funds" });
      }
    }
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) client.release();
  }
};

export { handleTransfer };
