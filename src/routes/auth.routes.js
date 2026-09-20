import express from "express";
import { rigisterUser } from "../controllers/auth.controller.js";
const router = express.Router();

router.route("/register").post(rigisterUser);

export default router;
