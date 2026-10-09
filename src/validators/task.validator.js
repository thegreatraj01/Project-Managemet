import { body } from "express-validator";
import { AvailableTaskStatuses } from "../utils/constant.js";

export const updateTaskValidator = () => {
   return [
      body("title")
         .optional()
         .trim()
         .notEmpty()
         .withMessage("Title cannot be empty"),

      body("description")
         .optional()
         .trim()
         .notEmpty()
         .withMessage("Description cannot be empty"),

      body("status")
         .optional()
         .trim()
         .notEmpty()
         .withMessage("Status cannot be empty")
         .isIn(AvailableTaskStatuses)
         .withMessage(
            `Status must be one of: ${AvailableTaskStatuses.join(", ")}`,
         ),
   ];
};

export const createSubtaskValidator = () => {
   return [body("title").trim().notEmpty().withMessage("title is required")];
};

export const updateSubTaskValidator = () => {
   return [
      body("title")
         .optional()
         .trim()
         .notEmpty()
         .withMessage("title is required"),
      body("isCompleted")
         .optional()
         .isBoolean()
         .withMessage("isCompleted only can have true or false"),
   ];
};
