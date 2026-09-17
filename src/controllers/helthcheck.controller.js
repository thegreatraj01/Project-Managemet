import { ApiResponse } from "../utils/api-response.js";

export const healthCheck = (req, res) => {
   try {
      res.status(200).json(
         new ApiResponse(200, "API is working fine", { status: "ok" }),
      );
   } catch (error) {
      res.status(500).json(new ApiResponse(500, "Internal server error", null));
   }
};
