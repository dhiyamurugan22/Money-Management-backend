
import { Request, Response } from "express";

import {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
} from "../services/transactionService";

// ADD TRANSACTION
export const addTransaction = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { type, amount, description } = req.body;

        if (type !== "income" && type !== "expense") {
            res.status(400).json({
                success: false,
                message: "Type must be income or expense",
            });
            return;
        }

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            res.status(400).json({
                success: false,
                message: "Amount must be a valid positive number",
            });
            return;
        }

        if (
            typeof description !== "string" ||
            description.trim().length === 0
        ) {
            res.status(400).json({
                success: false,
                message: "Description is required",
            });
            return;
        }

        if (!req.user || !req.supabase) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const transaction = await createTransaction(
            req.supabase,
            req.user.id,
            {
                type,
                amount,
                description: description.trim(),
            }
        );

        res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            data: transaction,
        });
    } catch (error) {
        console.error("Add transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to add transaction",
        });
    }
};

// GET ALL TRANSACTIONS
export const fetchAllTransactions = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || !req.supabase) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const transactions = await getAllTransactions(req.supabase);

        res.status(200).json({
            success: true,
            message: "Transactions fetched successfully",
            data: transactions,
        });
    } catch (error) {
        console.error("Fetch transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch transactions",
        });
    }
};

// GET SINGLE TRANSACTION
export const fetchTransactionById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || !req.supabase) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const id = req.params.id as string;

        const transaction = await getTransactionById(
            req.supabase,
            id
        );

        if (!transaction) {
            res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Transaction fetched successfully",
            data: transaction,
        });
    } catch (error) {
        console.error("Fetch transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch transaction",
        });
    }
};

// UPDATE TRANSACTION
export const updateTransactionDetails = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || !req.supabase) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const id = req.params.id as string;
        const { type, amount, description } = req.body;

        if (type !== "income" && type !== "expense") {
            res.status(400).json({
                success: false,
                message: "Type must be income or expense",
            });
            return;
        }

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            res.status(400).json({
                success: false,
                message: "Amount must be a valid positive number",
            });
            return;
        }

        if (
            typeof description !== "string" ||
            description.trim().length === 0
        ) {
            res.status(400).json({
                success: false,
                message: "Description is required",
            });
            return;
        }

        const transaction = await updateTransaction(
            req.supabase,
            id,
            {
                type,
                amount,
                description: description.trim(),
            }
        );

        if (!transaction) {
            res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: transaction,
        });
    } catch (error) {
        console.error("Update transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update transaction",
        });
    }
};

// DELETE TRANSACTION
export const deleteTransactionDetails = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || !req.supabase) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const id = req.params.id as string;

        const transaction = await deleteTransaction(
            req.supabase,
            id,
            req.user.id
        );

        if (!transaction) {
            res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            data: transaction,
        });
    } catch (error) {
        console.error("Delete transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to delete transaction",
        });
    }
};
