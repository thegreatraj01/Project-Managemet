import mongoose, { Schema } from "mongoose";
import { AvailableUserRoles, UserRoleEnums } from "../utils/constant.js";

const projectMemberSchema = new Schema(
   {
      user: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      project: {
         type: Schema.Types.ObjectId,
         ref: "Project",
         required: ture,
      },
      role: {
         type: String,
         enum: AvailableUserRoles,
         default: UserRoleEnums.MEMBER,
      },
   },
   { timestamps: true },
);

const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);
