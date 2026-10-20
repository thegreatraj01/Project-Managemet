import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * Returns the API health status.
 *
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after sending the health status.
 */
export const healthCheck = asyncHandler(async (req, res) => {
   res.status(200).json(
      new ApiResponse(200, { status: "ok" }, "API is working fine"),
   );
});
