import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
const router = express.Router();
import { validate } from "../middleware/validator.middleware.js";
import { userRegisterValidator } from "../validators/index.js";

// routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginUser);

// export router
export default router;
