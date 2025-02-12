import { addCategory, getCategory } from "../../controllers/admin/categoryControllers.js";
import { authMiddleware } from "../../middlewares/authMiddlewares.js";
import express from "express";

const categoryRoutes = express.Router();

categoryRoutes.post("/category-add", authMiddleware, addCategory);
categoryRoutes.get("/category-get", authMiddleware, getCategory);

export default categoryRoutes;
