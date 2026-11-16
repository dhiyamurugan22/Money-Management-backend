
import { Router } from "express";

import {
    createLending,
    fetchAllLending,
    fetchLendingById,
    updateLending,
    deleteLending,
    createRepayment,
    fetchRepaymentHistory,
} from "../controllers/lendingController";

import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// All lending routes require authentication
router.use(authenticateUser);

// Create lending / borrowing record
router.post("/", createLending);

// Fetch all records
router.get("/", fetchAllLending);

// Add repayment / return
router.post("/:id/repayments", createRepayment);

// Fetch repayment history
router.get("/:id/repayments", fetchRepaymentHistory);

// Fetch single record
router.get("/:id", fetchLendingById);

// Update record
router.put("/:id", updateLending);

// Delete record
router.delete("/:id", deleteLending);

export default router;
