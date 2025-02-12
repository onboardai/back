import {
  boRegister,
  createBOProfile,
  getBO,
  boLogin,
  updateBOImage,
  updateBO,
  changePasswordBO,
  getBOProfile
} from "../controllers/boAuthController.js";
import {
  authMiddleware,
  boAuthMiddleware,
} from "../middlewares/authMiddlewares.js";
import {
  adminLogin,
  changePassword,
  createSellerProfile,
  getUser,
  sellerLogin,
  sellerRegister,
  updateSeller,
  updateUserImage,
  getSellerProfile,
  getSellerProfileFromId
} from "./../controllers/authControllers.js";
import express from "express";

const authRoutes = express.Router();

authRoutes.post("/admin-login", adminLogin);
authRoutes.get("/get-user", authMiddleware, getUser);
authRoutes.post("/seller-register", sellerRegister);
authRoutes.post("/seller-login", sellerLogin);
authRoutes.post("/profile-info-add", authMiddleware, createSellerProfile);
authRoutes.post("/user-image-update", authMiddleware, updateUserImage);
authRoutes.post("/user-update", authMiddleware, updateSeller);
authRoutes.post("/change-password", authMiddleware, changePassword);
authRoutes.get("/seller-get/:username", getSellerProfile);
authRoutes.get("/seller-get-from-id/:sellerId", getSellerProfileFromId);
authRoutes.post("/bo/bo-register", boRegister);
authRoutes.post("/bo/bo-profile-add", boAuthMiddleware, createBOProfile);
authRoutes.get("/bo/get-bo", boAuthMiddleware, getBO);
authRoutes.post("/bo/bo-login", boLogin);
authRoutes.post("/bo/bo-image-update", boAuthMiddleware, updateBOImage);
authRoutes.post("/bo/bo-update", boAuthMiddleware, updateBO);
authRoutes.post("/bo/change-password-bo", boAuthMiddleware, changePasswordBO);
authRoutes.get("/bo-get/:username", getBOProfile);

export default authRoutes;
