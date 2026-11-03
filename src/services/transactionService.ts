
import { SupabaseClient } from "@supabase/supabase-js";

interface CreateTransactionInput {
    type: "income" | "expense";
    amount: number;
    description: string;
}

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
