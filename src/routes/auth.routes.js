import express from "express";
import {
   registerUser,
   loginUser,
   logoutUser,
} from "../controllers/auth.controller.js";
const router = express.Router();
import { validate } from "../middleware/validator.middleware.js";
import {
   userLoginValidator,
   userRegisterValidator,
} from "../validators/index.js";

import { verifyJwt } from "../middleware/auth.middleware.js";

// routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

// secure route
router.route("/logout").post(verifyJwt, logoutUser);

// export router
export default router;
