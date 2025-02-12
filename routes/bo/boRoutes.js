import express from 'express';
import { query_Agents } from '../../controllers/bo/boControllers.js';

const boRoutes = express.Router();

boRoutes.get("/bo/query-agents", query_Agents);

export default boRoutes
