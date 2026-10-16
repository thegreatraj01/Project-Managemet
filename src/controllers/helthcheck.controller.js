import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyns-handler.js";

/**
 * Returns the API health status.
 *
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after sending the health status.
 */
export const healthCheck = asyncHandler(async (req, res) => {
   // BUG: ApiResponse expects (statusCode, data, message), but these arguments are reversed.
   res.status(200).json(
      new ApiResponse(200, "API is working fine", { status: "ok" }),
   );
});
