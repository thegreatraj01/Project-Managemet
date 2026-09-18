import mongoose, { Schema } from "mongoose";

const avatarSchema = new Schema(
   {
      url: {
         type: String,
         default: "https://placehold.co/200x200",
      },
      localpath: {
         type: String,
         default: "",
      },
   },
   { _id: false },
);

const userSchema = new Schema(
   {
      avatar: {
         type: avatarSchema,

         // Creates an avatar object when none is provided,
         // allowing avatarSchema's field defaults to be applied.
         default: () => ({}),
      },
      username: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         index: true,
         trim: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
      },
      fullname: {
         type: String,
         required: true,
      },
      password: {
         type: String,
         required: [true, "Password is required"], // pass custom error message
      },
      isEmailVerified: {
         type: Boolean,
         default: false,
      },
      refreshToken: {
         type: String,
         default: null,
      },
      forgotPasswordToken: {
         type: String,
         default: null,
      },
      forgotPasswordTokenExpiry: {
         type: Date,
         default: null,
      },
      emailVerificationToken: {
         type: String,
         default: null,
      },
      emailVerificationTokenExpiry: {
         type: Date,
         default: null,
      },
   },
   {
      timestamps: true,
   },
);

export const User = mongoose.model("User", userSchema);
