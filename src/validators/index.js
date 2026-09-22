import { body } from "express-validator";

export const userRegisterValidator = () => {
   return [
      body("email")
         .trim()
         .notEmpty()
         .withMessage("Email is required")
         .isEmail()
         .withMessage("Email is not valid"),
      body("username")
         .trim()
         .notEmpty()
         .withMessage("Username is required")
         .isLength({ min: 3, max: 20 })
         .withMessage("Username must be between 3 and 20 characters long")
         .isLowercase()
         .withMessage("Username must be in lowercase"),
      body("fullname").trim().notEmpty().withMessage("Fullname is required"),
      body("password")
         .trim()
         .notEmpty()
         .withMessage("Password is required")
         .isLength({ min: 6 })
         .withMessage("Password must be at least 6 characters long"),
   ];
};
