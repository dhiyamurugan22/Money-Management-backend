
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

app.use(cors());
app.use(express.json());

interface AuthenticatedRequest extends Request {
    userId?: string;
}

async function authenticateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Missing authentication token",
        });
    }

    const token = authHeader.slice(7);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }

    req.userId = data.user.id;
    next();
}

app.get("/", (_req: Request, res: Response) => {
    res.json({
        message: "Money Tracker Backend is running!",
    });
});

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        message: "Backend is healthy",
    });
});

app.get(
    "/me",
    authenticateUser,
    (req: AuthenticatedRequest, res: Response) => {
        res.json({
            message: "Authenticated successfully",
            userId: req.userId,
        });
    }
);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
