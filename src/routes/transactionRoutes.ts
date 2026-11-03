
import { Router } from "express";
import { addTransaction } from "../controllers/transactionController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Add a new income or expense
router.post("/", authenticateUser, addTransaction);

export default router;
