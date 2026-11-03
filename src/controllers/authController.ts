
import { Request, Response } from "express";
import { signUpUser, loginUser } from "../services/authService";

export const signup = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
            return;
        }

        const data = await signUpUser(email.trim(), password);

        res.status(201).json({
            success: true,
            message: data.session
                ? "Account created successfully"
                : "Account created. Please verify your email before logging in.",
            user: data.user,
            session: data.session,
        });
    } catch (error) {
        console.error("Signup error:", error);

        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to create account",
        });
    }
};

export const login = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
            return;
        }

        const data = await loginUser(email.trim(), password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: data.user,
            session: data.session,
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }
};
