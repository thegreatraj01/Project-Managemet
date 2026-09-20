import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
// pre-save hook to hash the password before saving the user document
userSchema.pre("save", async function () {
   if (!this.isModified("password")) return;

   this.password = await bcrypt.hash(this.password, 10);
});

// method to compare the provided password with the hashed password in the database
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password);
};

// method to create a new access token for the user
userSchema.methods.createAccessToken = function () {
   return jwt.sign(
      { _id: this._id, email: this.email, username: this.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
   );
};

// method to create a new refresh token for the user
userSchema.methods.createRefreshToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
         username: this.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
   );
};

// method to create hashToken unhash token and expiery for token using crypto module
userSchema.methods.genrateTemporaryToken = function () {
   const unhashToken = crypto.randomBytes(20).toString("hex");
   const hashToken = crypto
      .createHash("sha256")
      .update(unhashToken)
      .digest("hex");
   const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

   return { unhashToken, hashToken, expiry };
};

export const User = mongoose.model("User", userSchema);
