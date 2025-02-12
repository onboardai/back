import express from "express";
import {
  add_bo_friend,
  bo_message_add,
} from "../../controllers/bo/boChatController.js";

const boChatRoutes = express.Router();

boChatRoutes.post("/chat/bo/add-bo-friend", add_bo_friend);
boChatRoutes.post("/chat/bo/send-message-to-seller", bo_message_add);

export default boChatRoutes;
