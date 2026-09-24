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

export const userLoginValidator = () => {
   return [
      body("email")
         .trim()
         .notEmpty()
         .withMessage("Email is required")
         .isEmail()
         .withMessage("Email is not valid"),
      // TODO: add captial letter spacial character and number validation for password
      body("password")
         .trim()
         .notEmpty()
         .withMessage("Password is required")
         .isLength({ min: 6 })
         .withMessage("Password must be at least 6 characters long"),
   ];
};

export const passwordResetRequestEmailValidator = () => {
   return [
      body("email")
         .trim()
         .notEmpty()
         .withMessage("Email is required")
         .isEmail()
         .withMessage("Email is not valid"),
   ];
};

// this will be used to validate the password on reset password route
export const forgotPasswordValidator = () => {
   return [
      body("newPassword")
         .trim()
         .notEmpty()
         .withMessage("New password is required")
         .isLength({ min: 6 })
         .withMessage("New password must be at least 6 characters long"),
   ];
};

// this will be used to validate the password on change password route, where user is already logged in and wants to change the password
export const changePasswordValidator = () => {
   return [
      body("oldPassword")
         .trim()
         .notEmpty()
         .withMessage("Old password is required")
         .isLength({ min: 6 })
         .withMessage("Old password must be at least 6 characters long"),
      body("newPassword")
         .trim()
         .notEmpty()
         .withMessage("New password is required")
         .isLength({ min: 6 })
         .withMessage("New password must be at least 6 characters long"),
   ];
};
