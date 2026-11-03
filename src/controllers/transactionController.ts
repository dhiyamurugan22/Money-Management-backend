
import { Request, Response } from "express";
import { createTransaction } from "../services/transactionService";

export const addTransaction = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { type, amount, description } = req.body;

        // Validate transaction type
        if (type !== "income" && type !== "expense") {
            res.status(400).json({
                success: false,
                message: "Type must be income or expense",
            });
            return;
        }

        // Validate amount
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

        // Validate description
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
