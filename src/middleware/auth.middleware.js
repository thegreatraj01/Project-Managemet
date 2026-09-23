import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
   const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "") ||
      req.get("Authorization")?.replace("Bearer ", "");

   if (!token) {
      throw new ApiError(401, "Access Denied");
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
      if (error) {
         throw new ApiError(401, error.message || "Invalid Access Token");
      }
   }
});
