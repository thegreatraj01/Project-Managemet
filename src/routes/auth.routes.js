import express from "express";
import {
   registerUser,
   loginUser,
   logoutUser,
   getCurrentUser,
   verifyEmail,
   resendVerificationEmail,
   refreshAccessToken,
   forgotPasswordEmailRequest,
} from "../controllers/auth.controller.js";

import { validate } from "../middleware/validator.middleware.js";
import {
   passwordResetRequestEmailValidator,
   userLoginValidator,
   userRegisterValidator,
} from "../validators/index.js";

import { verifyJwt } from "../middleware/auth.middleware.js";

const router = express.Router();
// routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
   .route("/forgot-password")
   .post(
      passwordResetRequestEmailValidator(),
      validate,
      forgotPasswordEmailRequest,
   );

// secure route
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router
   .route("/resend-verification-email")
   .post(verifyJwt, resendVerificationEmail);

router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
// export router
export default router;
