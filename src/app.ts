
import "dotenv/config";
import express from "express";
import cors from "cors";

import { authenticateUser } from "./middleware/authMiddleware";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import lendingRoutes from "./routes/lendingRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (_req, res) => {
    res.json({
        message: "Gurl Math Backend is running!",
    });
});

// Health check
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Backend is healthy",
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected test route
app.get("/protected", authenticateUser, (req, res) => {
    res.json({
        success: true,
        message: "Authentication successful!",
        userId: req.user?.id,
    });
});

// Transaction routes
app.use("/api/transactions", transactionRoutes);

// Lending and borrowing routes
app.use("/api/lending", lendingRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
