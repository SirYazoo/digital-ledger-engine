import express from "express";
import { handleTransfer } from "../controllers/transferController";
import requireIdempotency from "../middleware/idempotency";

const router = express.Router();

router.post("/transfer", requireIdempotency, handleTransfer);

export default router;
