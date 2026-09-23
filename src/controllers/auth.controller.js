import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import { sendVerificationEmail } from "../services/emailService.js";
import crypto from "crypto";

/**
 * Auth controller for user signup, login, and logout flows.
 *
 * @module controllers/auth
 */

/**
 * Generates a new access token and refresh token for a user,
 * stores the refresh token in the database, and returns both tokens.
 *
 * @param {string} userId - MongoDB user id for which tokens should be generated.
 * @returns {Promise<{ AccessToken: string, RefreshToken: string }>} Object containing both tokens.
 * @throws {ApiError} If token generation or database update fails.
 */
const genrateAccessAndRefreshToken = async (userId) => {
   try {
      const user = await User.findById(userId);
      const AccessToken = user.createAccessToken();
      const RefreshToken = user.createRefreshToken();

      user.refreshToken = RefreshToken;
      await user.save({ validateBeforeSave: false });
      return { AccessToken, RefreshToken };
   } catch (error) {
      throw new ApiError("Something Went Wrong", 500);
   }
};

/**
 * Registers a new user, creates their account, stores a verification token,
 * sends a verification email, and returns the registered user payload.
 *
 * @param {object} req - Express request object containing the signup form data.
 * @param {object} res - Express response object used to send the result.
 * @returns {Promise<void>} Resolves after sending the user registration response.
 * @throws {ApiError} If the user already exists or registration fails.
 */
const registerUser = asyncHandler(async (req, res) => {
   const { username, email, password, fullname } = req.body;

   const existedUser = await User.findOne({
      $or: [{ username }, { email }],
   });

   if (existedUser) {
      throw new ApiError(409, "User with this email or username already exist");
   }

   // User.create Check for validation
   const user = await User.create({
      email,
      password,
      username,
      fullname,
      isEmailVerified: false,
   });

   const { AccessToken, RefreshToken } = genrateAccessAndRefreshToken(user._id);

   const { unhashToken, hashToken, expiry } = user.genrateTemporaryToken();

   user.emailVerificationToken = hashToken;
   user.emailVerificationTokenExpiry = expiry;

   await user.save({ validateBeforeSave: false });

   const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashToken}`;
   await sendVerificationEmail(user.email, user.username, verificationUrl);

   const registeredUser = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
   );

   if (!registeredUser) {
      throw new ApiError(
         "Something went wrong while registering the user",
         500,
      );
   }

   return res.status(201).json(
      new ApiResponse(
         201,
         {
            user: registeredUser,
         },
         "User registered successfully",
      ),
   );
});

/**
 * Logs in an existing user by validating credentials,
 * issuing tokens, and setting them as HTTP-only cookies.
 *
 * @param {object} req - Express request object containing the login payload.
 * @param {object} res - Express response object used to send the result.
 * @returns {Promise<void>} Resolves after the login response is sent.
 * @throws {ApiError} If the user does not exist or the password is invalid.
 */
const loginUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body;

   const user = await User.findOne({ email });

   if (!user) {
      throw new ApiError(401, "User not exist");
   }

   const isPasswordValid = user.isPasswordCorrect(password);

   if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
   }

   const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
   );

   const { AccessToken, RefreshToken } = await genrateAccessAndRefreshToken(
      user._id,
   );

   const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
   };

   res.status(200)
      .cookie("refreshToken", RefreshToken, cookieOptions)
      .cookie("accessToken", AccessToken, cookieOptions)
      .json(
         new ApiResponse(
            200,
            {
               user: loggedInUser,
               AccessToken,
               RefreshToken,
            },
            "User logged in successfully",
         ),
      );
});

/**
 * Logs out the authenticated user by clearing the refresh and access tokens.
 *
 * @param {object} req - Express request object containing the authenticated user.
 * @param {object} res - Express response object used to complete the logout.
 * @returns {Promise<void>} Resolves after clearing the auth cookies.
 */
const logoutUser = asyncHandler(async (req, res) => {
   const userId = req.user._id;

   await User.findByIdAndUpdate(userId, { refreshToken: "" }, { new: true });

   const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 0, // Set maxAge to 0 to expire the cookie immediately
   };

   res.status(200)
      .clearCookie("refreshToken", cookieOptions)
      .clearCookie("accessToken", cookieOptions)
      .json(new ApiResponse(200, null, "User logged out successfully"));
});

/**
 * Gets the currently authenticated user's details.
 *
 * @param {object} req - Express request object containing the authenticated user.
 * @param {object} res - Express response object used to return the user data.
 * @returns {Promise<void>} Resolves after sending the current user payload.
 * @throws {ApiError} If the user does not exist.
 */
const getCurrentUser = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const user = await User.findById(userId).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
   );
   if (!user) {
      throw new ApiError(404, "User not found");
   }
   res.status(200).json(
      new ApiResponse(200, { user }, "User data retrieved successfully"),
   );
});

/**
 * Verifies a user's email address using a verification token and returns a success page.
 *
 * @param {object} req - Express request object containing the verification token.
 * @param {object} res - Express response object used to send the verification result.
 * @returns {Promise<void>} Resolves after rendering the email verification page.
 * @throws {ApiError} If the token is invalid, expired, or the user does not exist.
 */
const verifyEmail = asyncHandler(async (req, res) => {
   const { verificationToken } = req.params;

   if (!verificationToken || !verificationToken.trim()) {
      throw new ApiError(400, "Invalid verification token");
   }

   const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

   const user = await User.findOne({
      emailVerificationToken: hashedToken,
   });

   if (!user) {
      throw new ApiError(400, "Invalid verification token");
   }

   if (user.emailVerificationTokenExpiry < Date.now()) {
      throw new ApiError(400, "Verification token has expired");
   }
   if (user.isEmailVerified) {
      throw new ApiError(400, "Email is already verified");
   }
   user.isEmailVerified = true;
   user.emailVerificationToken = undefined;
   user.emailVerificationTokenExpiry = undefined;
   await user.save({ validateBeforeSave: false });

   return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
         <meta charset="UTF-8" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <title>Email Verified</title>
         <style>
            body {
               margin: 0;
               min-height: 100vh;
               display: grid;
               place-items: center;
               font-family: Arial, sans-serif;
               background: linear-gradient(135deg, #eef6ff, #f6f7fb);
               color: #1f2937;
            }
            .card {
               background: #ffffff;
               border-radius: 16px;
               padding: 32px 40px;
               box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
               text-align: center;
               max-width: 420px;
            }
            h2 {
               margin: 0 0 12px;
               color: #166534;
            }
            p {
               margin: 0;
               font-size: 16px;
            }
         </style>
      </head>
      <body>
         <div class="card">
            <h2>Email Verified Successfully</h2>
            <p>You can now log in to your account.</p>
         </div>
      </body>
      </html>
   `);
});

export {
   registerUser,
   genrateAccessAndRefreshToken,
   loginUser,
   logoutUser,
   getCurrentUser,
   verifyEmail,
};
