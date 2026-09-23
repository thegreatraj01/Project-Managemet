import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
const router = express.Router();
import { validate } from "../middleware/validator.middleware.js";
import {
   userLoginValidator,
   userRegisterValidator,
} from "../validators/index.js";

// routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

// export router
export default router;
