import express from "express";
import { runConversationAssistant } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/conversations/:id", protectRoute, runConversationAssistant);

export default router;
