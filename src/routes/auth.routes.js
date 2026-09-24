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
// unsecure routes
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

// Refresh flow must not depend on an unexpired access token.
// It should validate the refresh token from the cookie/body instead.
router.route("/refresh-token").post(refreshAccessToken);

// secure routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router
   .route("/resend-verification-email")
   .post(verifyJwt, resendVerificationEmail);
router
   .route("/change-password")
   .post(verifyJwt, changePasswordValidator(), validate, changeCurrentPassword);

// export router
export default router;
