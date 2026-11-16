
import { SupabaseClient } from "@supabase/supabase-js";

export type LendingType = "given" | "borrowed";

export interface CreateLendingInput {
    person_name: string;
    type: LendingType;
    amount: number;
    description?: string | null;
    transaction_date: string;
    due_date?: string | null;
}

export interface UpdateLendingInput {
    person_name?: string;
    type?: LendingType;
    amount?: number;
    description?: string | null;
    transaction_date?: string;
    due_date?: string | null;
}

export interface CreateRepaymentInput {
    amount: number;
    transaction_date: string;
    description?: string | null;
}

export class LendingServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = "LendingServiceError";
        this.statusCode = statusCode;
    }
}

// CALCULATE BALANCE AND PAYMENT STATUS
const calculateBalance = (record: any) => {
    const repayments = record.lending_repayments || [];

    const totalRepaid = repayments.reduce(
        (total: number, repayment: any) =>
            total + Number(repayment.amount),
        0
    );

    const originalAmount = Number(record.amount);

    const remainingBalance = Math.max(
        0,
        originalAmount - totalRepaid
    );

    let status: "Pending" | "Partially Paid" | "Completed";

    if (remainingBalance === 0) {
        status = "Completed";
    } else if (totalRepaid > 0) {
        status = "Partially Paid";
    } else {
        status = "Pending";
    }

    return {
        ...record,
        amount: originalAmount,
        total_repaid: totalRepaid,
        remaining_balance: remainingBalance,
        status,
    };
};

// CREATE LENDING / BORROWING RECORD
export const createLendingRecord = async (
    supabase: SupabaseClient,
    userId: string,
    record: CreateLendingInput
) => {
    const { data, error } = await supabase
        .from("lending_records")
        .insert({
            user_id: userId,
            person_name: record.person_name.trim(),
            type: record.type,
            amount: record.amount,
            description: record.description?.trim() || null,
            transaction_date: record.transaction_date,
            due_date: record.due_date || null,
        })
        .select()
        .single();

    if (error) throw error;

    return calculateBalance({
        ...data,
        lending_repayments: [],
    });
};

// GET ALL LENDING / BORROWING RECORDS
export const getAllLendingRecords = async (
    supabase: SupabaseClient,
    userId: string
) => {
    const { data, error } = await supabase
        .from("lending_records")
        .select(`
            *,
            lending_repayments (*)
        `)
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false });

    if (error) throw error;

    return (data || []).map(calculateBalance);
};

// GET SINGLE LENDING / BORROWING RECORD
export const getLendingRecordById = async (
    supabase: SupabaseClient,
    recordId: string,
    userId: string
) => {
    const { data, error } = await supabase
        .from("lending_records")
        .select(`
            *,
            lending_repayments (*)
        `)
        .eq("id", recordId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return calculateBalance(data);
};

// UPDATE LENDING / BORROWING RECORD
export const updateLendingRecord = async (
    supabase: SupabaseClient,
    recordId: string,
    userId: string,
    updates: UpdateLendingInput
) => {
    const existingRecord = await getLendingRecordById(
        supabase,
        recordId,
        userId
    );

    if (!existingRecord) return null;

    if (
        updates.amount !== undefined &&
        updates.amount < existingRecord.total_repaid
    ) {
        throw new LendingServiceError(
            "Amount cannot be less than the total amount already repaid",
            400
        );
    }

    const updateData: Record<string, any> = {};

    if (updates.person_name !== undefined) {
        updateData.person_name = updates.person_name.trim();
    }

    if (updates.type !== undefined) {
        updateData.type = updates.type;
    }

    if (updates.amount !== undefined) {
        updateData.amount = updates.amount;
    }

    if (updates.description !== undefined) {
        updateData.description =
            updates.description?.trim() || null;
    }

    if (updates.transaction_date !== undefined) {
        updateData.transaction_date = updates.transaction_date;
    }

    if (updates.due_date !== undefined) {
        updateData.due_date = updates.due_date || null;
    }

    const { data, error } = await supabase
        .from("lending_records")
        .update(updateData)
        .eq("id", recordId)
        .eq("user_id", userId)
        .select(`
            *,
            lending_repayments (*)
        `)
        .maybeSingle();

    if (error) throw error;

    return data ? calculateBalance(data) : null;
};

// DELETE LENDING / BORROWING RECORD
export const deleteLendingRecord = async (
    supabase: SupabaseClient,
    recordId: string,
    userId: string
) => {
    const { data, error } = await supabase
        .from("lending_records")
        .delete()
        .eq("id", recordId)
        .eq("user_id", userId)
        .select()
        .maybeSingle();

    if (error) throw error;

    return data;
};

// ADD REPAYMENT / RETURN
export const addRepayment = async (
    supabase: SupabaseClient,
    recordId: string,
    userId: string,
    repayment: CreateRepaymentInput
) => {
    const { data, error } = await supabase.rpc(
        "add_lending_repayment",
        {
            p_record_id: recordId,
            p_user_id: userId,
            p_amount: repayment.amount,
            p_repayment_date: repayment.transaction_date,
            p_description: repayment.description?.trim() || null,
        }
    );

    if (error) {
        if (error.message.includes("LENDING_RECORD_NOT_FOUND")) {
            throw new LendingServiceError(
                "Lending record not found",
                404
            );
        }

        if (error.message.includes("EXCEEDS_REMAINING_BALANCE")) {
            throw new LendingServiceError(
                "Repayment cannot exceed the remaining balance",
                400
            );
        }

        if (error.message.includes("INVALID_REPAYMENT_AMOUNT")) {
            throw new LendingServiceError(
                "Repayment amount must be positive",
                400
            );
        }

        throw error;
    }

    return data;
};

// GET REPAYMENT HISTORY
export const getRepaymentHistory = async (
    supabase: SupabaseClient,
    recordId: string,
    userId: string
) => {
    const record = await supabase
        .from("lending_records")
        .select("id")
        .eq("id", recordId)
        .eq("user_id", userId)
        .maybeSingle();

    if (record.error) throw record.error;

    if (!record.data) return null;

    const { data, error } = await supabase
        .from("lending_repayments")
        .select("*")
        .eq("record_id", recordId)
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false });

    if (error) throw error;

    return data;
};
