
import { Request, Response, NextFunction } from "express";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "../config/supabase";

declare global {
    namespace Express {
        interface Request {
            user?: User;
            supabase?: SupabaseClient;
        }
    }
}

export const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // 1. Get the authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
            return;
        }

        // 2. Extract the access token
        const accessToken = authHeader.split(" ")[1];

        if (!accessToken) {
            res.status(401).json({
                success: false,
                message: "Invalid authorization header",
            });
            return;
        }

        // 3. Create a Supabase client for this user
        const supabase = createSupabaseClient(accessToken);

        // 4. Verify the token with Supabase Auth
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(accessToken);

        if (error || !user) {
            res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token",
            });
            return;
        }

        // 5. Attach authenticated user and client to request
        req.user = user;
        req.supabase = supabase;

        // 6. Continue to the requested route
        next();
    } catch (error) {
        console.error("Authentication error:", error);

        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};


