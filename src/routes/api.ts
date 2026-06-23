import express from "express";
import { handleTransfer } from "../controllers/transferController";

const router = express.Router();

router.post("/transfer", handleTransfer);

export default router;
