import express from "express";
import {
  getBOs,
  getBOSellerMessage,
  sendMessageToBO,
} from "./../../controllers/seller/sellerChatControllers.js";
import { authMiddleware } from "./../../middlewares/authMiddlewares.js";

const sellerChatRoutes = express.Router();

sellerChatRoutes.get("/chat/seller/get-bos/:sellerId", getBOs);
sellerChatRoutes.get(
  "/chat/seller/get-bo-message/:boId",
  authMiddleware,
  getBOSellerMessage
);

sellerChatRoutes.post("/chat/seller/send-message-to-bo", sendMessageToBO);

export default sellerChatRoutes;
