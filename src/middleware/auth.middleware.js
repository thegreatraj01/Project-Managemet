import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";

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

export const validateProjectPermission = (roles = []) => {
   return asyncHandler(async (req, res, next) => {
      const { projectId } = req.params;

      if (!projectId) {
         throw new ApiError(400, "project id is missing");
      }

      const projectMember = await ProjectMember.findOne({
         project: new mongoose.Types.ObjectId(projectId),
         user: new mongoose.Types.ObjectId(req.user._id),
      });

      if (!projectMember) {
         throw new ApiError(403, "You are not a member of this project");
      }

      const givenRole = projectMember.role;
      req.user.role = givenRole;

      if (!roles.includes(givenRole)) {
         throw new ApiError(
            403,
            "You do not have permission to perform this action",
         );
      }

      next();
   });
};
