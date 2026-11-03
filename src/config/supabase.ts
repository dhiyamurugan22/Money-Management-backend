
import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient(accessToken: string) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabasePublishableKey =
        process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error("Supabase environment variables are missing");
    }

    return createClient(supabaseUrl, supabasePublishableKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
}
