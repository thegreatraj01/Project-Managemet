import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import jwt from "jsonwebtoken";

/**
 * Verifies the JWT access token sent either in cookies or the Authorization header.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} Resolves after attaching the authenticated user to the request.
 * @throws {ApiError} If the token is missing, invalid, expired, or the user does not exist.
 */
export const verifyJwt = asyncHandler(async (req, res, next) => {
   let token = req.cookies?.accessToken;

   //    console.log("Token from cookies:", token);

   if (!token) {
      const authHeader = req.headers?.authorization || req.get("Authorization");
      token = authHeader?.startsWith("Bearer ")
         ? authHeader.replace("Bearer ", "")
         : undefined;
   }

   if (
      !token ||
      typeof token !== "string" ||
      token.trim() === "" ||
      token === "undefined"
   ) {
      console.log("No token provided or token is invalid:", token);
      throw new ApiError(401, "Invalid Access Token");
   }

   try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded?._id).select(
         "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry",
      );

      if (!user) {
         throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;
      next();
   } catch (error) {
      throw new ApiError(401, error.message || "Invalid Access Token");
   }
});
