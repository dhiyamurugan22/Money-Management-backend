
import { createClient } from "@supabase/supabase-js";

const createAuthClient = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabasePublishableKey =
        process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error("Supabase environment variables are missing");
    }

    return createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
};

export const signUpUser = async (
    email: string,
    password: string
) => {
    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
};

export const loginUser = async (
    email: string,
    password: string
) => {
    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
};
