
import { Request, Response } from "express";

import {
    createLendingRecord,
    getAllLendingRecords,
    getLendingRecordById,
    updateLendingRecord,
    deleteLendingRecord,
    addRepayment,
    getRepaymentHistory,
    LendingServiceError,
    LendingType,
    UpdateLendingInput,
} from "../services/lendingService";

// DATE VALIDATION
const isValidDate = (value: unknown): value is string => {
    if (typeof value !== "string") return false;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

// AUTHENTICATION CHECK
const checkAuthentication = (req: Request, res: Response) => {
    if (!req.user || !req.supabase) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });

        return false;
    }

    return true;
};

// HANDLE ERRORS
const handleError = (
    error: unknown,
    res: Response,
    defaultMessage: string
) => {
    console.error(defaultMessage, error);

    if (error instanceof LendingServiceError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });

        return;
    }

    res.status(500).json({
        success: false,
        message: defaultMessage,
    });
};

// CREATE LENDING / BORROWING RECORD
export const createLending = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!checkAuthentication(req, res)) return;

        const {
            person_name,
            type,
            amount,
            description,
            transaction_date,
            due_date,
        } = req.body;

        if (
            typeof person_name !== "string" ||
            !person_name.trim()
        ) {
            res.status(400).json({
                success: false,
                message: "Person name is required",
            });
            return;
        }

        if (type !== "given" && type !== "borrowed") {
            res.status(400).json({
                success: false,
                message: "Type must be given or borrowed",
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

        if (!isValidDate(transaction_date)) {
            res.status(400).json({
                success: false,
                message: "A valid transaction date is required (YYYY-MM-DD)",
            });
            return;
        }

        if (
            due_date !== undefined &&
            due_date !== null &&
            due_date !== "" &&
            !isValidDate(due_date)
        ) {
            res.status(400).json({
                success: false,
                message: "Due date must be a valid date (YYYY-MM-DD)",
            });
            return;
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            res.status(400).json({
                success: false,
                message: "Description must be a string",
            });
            return;
        }

        const record = await createLendingRecord(
            req.supabase!,
            req.user!.id,
            {
                person_name,
                type: type as LendingType,
                amount,
                description,
                transaction_date,
                due_date: due_date || null,
            }
        );

        res.status(201).json({
            success: true,
            message: "Lending record created successfully",
            data: record,
        });
    } catch (error) {
        handleError(error, res, "Unable to create lending record");
    }
};

// GET ALL RECORDS
export const fetchAllLending = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!checkAuthentication(req, res)) return;

        const records = await getAllLendingRecords(
            req.supabase!,
            req.user!.id
        );

        res.status(200).json({
            success: true,
            message: "Lending records fetched successfully",
            data: records,
        });
    } catch (error) {
        handleError(error, res, "Unable to fetch lending records");
    }
};

// GET SINGLE RECORD
export const fetchLendingById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!checkAuthentication(req, res)) return;

        const record = await getLendingRecordById(
            req.supabase!,
            req.params.id as string,
            req.user!.id
        );

        if (!record) {
            res.status(404).json({
                success: false,
                message: "Lending record not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Lending record fetched successfully",
            data: record,
        });
    } catch (error) {
        handleError(error, res, "Unable to fetch lending record");
    }
};

// UPDATE RECORD
export const updateLending = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!checkAuthentication(req, res)) return;

        const {
            person_name,
            type,
            amount,
            description,
            transaction_date,
            due_date,
        } = req.body;

        const updates: UpdateLendingInput = {};

        if (person_name !== undefined) {
            if (
                typeof person_name !== "string" ||
                !person_name.trim()
            ) {
                res.status(400).json({
                    success: false,
                    message: "Person name must be a non-empty string",
                });
                return;
            }

            updates.person_name = person_name;
        }

        if (type !== undefined) {
            if (type !== "given" && type !== "borrowed") {
                res.status(400).json({
                    success: false,
                    message: "Type must be given or borrowed",
                });
                return;
            }

            updates.type = type;
        }

        if (amount !== undefined) {
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

            updates.amount = amount;
        }

        if (description !== undefined) {
            if (
                description !== null &&
                typeof description !== "string"
            ) {
                res.status(400).json({
                    success: false,
                    message: "Description must be a string or null",
                });
                return;
            }

            updates.description = description;
        }

        if (transaction_date !== undefined) {
            if (!isValidDate(transaction_date)) {
                res.status(400).json({
                    success: false,
                    message: "Transaction date must be valid",
                });
                return;
            }

            updates.transaction_date = transaction_date;
        }

        if (due_date !== undefined) {
            if (
                due_date !== null &&
                due_date !== "" &&
                !isValidDate(due_date)
            ) {
                res.status(400).json({
                    success: false,
                    message: "Due date must be valid",
                });
                return;
            }

            updates.due_date = due_date || null;
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({
                success: false,
                message: "At least one field must be provided for update",
            });
            return;
        }

        const record = await updateLendingRecord(
            req.supabase!,
            req.params.id as string,
            req.user!.id,
            updates
        );

        if (!record) {
            res.status(404).json({
                success: false,
                message: "Lending record not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Lending record updated successfully",
            data: record,
        });
    } catch (error) {
        handleError(error, res, "Unable to update lending record");
    }
};

// DELETE RECORD
export const deleteLending = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!checkAuthentication(req, res)) return;

        const record = await deleteLendingRecord(
            req.supabase!,
            req.params.id as string,
            req.user!.id
        );

        if (!record) {
            res.status(404).json({
                success: false,
                message: "Lending record not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Lending record deleted successfully",
            data: record,
        });
    } catch (error) {
        handleError(error, res, "Unable to delete lending record");
    }
};

// ADD REPAYMENT / RETURN
export const createRepayment = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!checkAuthentication(req, res)) return;

        const { amount, transaction_date, description } = req.body;

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            res.status(400).json({
                success: false,
                message: "Repayment amount must be a valid positive number",
            });
            return;
        }

        if (!isValidDate(transaction_date)) {
            res.status(400).json({
                success: false,
                message: "A valid repayment date is required (YYYY-MM-DD)",
            });
            return;
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            res.status(400).json({
                success: false,
                message: "Description must be a string",
            });
            return;
        }

        const repayment = await addRepayment(
            req.supabase!,
            req.params.id as string,
            req.user!.id,
            {
                amount,
                transaction_date,
                description,
            }
        );

        res.status(201).json({
            success: true,
            message: "Repayment added successfully",
            data: repayment,
        });
    } catch (error) {
        handleError(error, res, "Unable to add repayment");
    }
};

// GET REPAYMENT HISTORY
export const fetchRepaymentHistory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!checkAuthentication(req, res)) return;

        const history = await getRepaymentHistory(
            req.supabase!,
            req.params.id as string,
            req.user!.id
        );

        if (!history) {
            res.status(404).json({
                success: false,
                message: "Lending record not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Repayment history fetched successfully",
            data: history,
        });
    } catch (error) {
        handleError(error, res, "Unable to fetch repayment history");
    }
};
