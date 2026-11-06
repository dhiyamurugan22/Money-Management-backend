
import { SupabaseClient } from "@supabase/supabase-js";

interface CreateTransactionInput {
    type: "income" | "expense";
    amount: number;
    description: string;
}

interface UpdateTransactionInput {
    type: "income" | "expense";
    amount: number;
    description: string;
}

// CREATE TRANSACTION
export const createTransaction = async (
    supabase: SupabaseClient,
    userId: string,
    transaction: CreateTransactionInput
) => {
    const { data, error } = await supabase
        .from("transactions")
        .insert({
            user_id: userId,
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

// GET ALL TRANSACTIONS
export const getAllTransactions = async (
    supabase: SupabaseClient
) => {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
};

// GET SINGLE TRANSACTION
export const getTransactionById = async (
    supabase: SupabaseClient,
    transactionId: string
) => {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

// UPDATE TRANSACTION
export const updateTransaction = async (
    supabase: SupabaseClient,
    transactionId: string,
    transaction: UpdateTransactionInput
) => {
    const { data, error } = await supabase
        .from("transactions")
        .update({
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
        })
        .eq("id", transactionId)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

// DELETE TRANSACTION
export const deleteTransaction = async (
    supabase: SupabaseClient,
    transactionId: string,
    userId: string
) => {
    const { data, error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", userId)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};
