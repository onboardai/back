import {
  addAgent,
  getAgent,
  getAgents,
  updateAgent,
  updateAgentImage,
  getAgentProfile,
  deleteAgent,
  getAgentProfileSeller
} from "../../controllers/dashboard/agentController.js";
import {
  authMiddleware,
  boAuthMiddleware,
} from "../../middlewares/authMiddlewares.js";
import express from "express";

const agentRoutes = express.Router();

agentRoutes.post("/agent-add", authMiddleware, addAgent);
agentRoutes.get("/agents-get", authMiddleware, getAgents);
agentRoutes.get("/agent-get/:agentId", authMiddleware, getAgent);
agentRoutes.get(
  "/agent-get-profile/:agentId",
  boAuthMiddleware,
  getAgentProfile
);
agentRoutes.post("/agent-update", authMiddleware, updateAgent);
agentRoutes.post("/agent-image-update", authMiddleware, updateAgentImage);
agentRoutes.post("/agent-delete", deleteAgent);
agentRoutes.get(
  "/agent-get-profile-seller/:agentId",
  authMiddleware,
  getAgentProfileSeller
);

export default agentRoutes;
