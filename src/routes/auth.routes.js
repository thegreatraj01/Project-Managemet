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
   resetForgottenPassword,
   changeCurrentPassword,
} from "../controllers/auth.controller.js";

import { validate } from "../middleware/validator.middleware.js";
import {
   forgotPasswordValidator,
   passwordResetRequestEmailValidator,
   changePasswordValidator,
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
router
   .route("/reset-password/:resetToken")
   .post(forgotPasswordValidator(), validate, resetForgottenPassword);

// secure route
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router
   .route("/resend-verification-email")
   .post(verifyJwt, resendVerificationEmail);

router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router
   .route("/change-password")
   .post(verifyJwt, changePasswordValidator(), validate, changeCurrentPassword);

// export router
export default router;
