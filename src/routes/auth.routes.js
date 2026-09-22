import express from "express";
import { registerUser } from "../controllers/auth.controller.js";
const router = express.Router();
import { validate } from "../middleware/validator.middleware.js";
import { userRegisterValidator } from "../validators/index.js";

router.route("/register").post(userRegisterValidator(), validate, registerUser);

export default router;
