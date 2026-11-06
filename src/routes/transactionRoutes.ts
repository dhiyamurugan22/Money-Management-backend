
import { Router } from "express";

import {
    addTransaction,
    fetchAllTransactions,
    fetchTransactionById,
    updateTransactionDetails,
    deleteTransactionDetails,
} from "../controllers/transactionController";

import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Add a new income or expense
router.post("/", authenticateUser, addTransaction);

// Fetch all transactions
router.get("/", authenticateUser, fetchAllTransactions);

// Fetch a single transaction
router.get("/:id", authenticateUser, fetchTransactionById);

// Update a transaction
router.put("/:id", authenticateUser, updateTransactionDetails);

// Delete a transaction
router.delete("/:id", authenticateUser, deleteTransactionDetails);

export default router;
