import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import { sendVerificationEmail } from "../services/emailService.js";

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

   const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashToken}`;
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

// TODO:  write loginUser controller

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

   const { AccessToken, RefreshToken } = genrateAccessAndRefreshToken(user._id);

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

export { registerUser, genrateAccessAndRefreshToken, loginUser };
