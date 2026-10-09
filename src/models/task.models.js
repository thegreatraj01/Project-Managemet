import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatuses, TaskStatusEnums } from "../utils/constant.js";

const taskSchema = new Schema(
   {
      title: {
         type: String,
         required: true,
         trim: true,
      },
      description: String,
      project: {
         type: Schema.Types.ObjectId,
         ref: "Project",
         required: true,
      },
      assignedTo: {
         type: Schema.Types.ObjectId,
         ref: "User",
      },
      assignedBy: {
         type: Schema.Types.ObjectId,
         ref: "User",
      },
      status: {
         type: String,
         enum: AvailableTaskStatuses,
         default: TaskStatusEnums.TODO,
      },
      attachments: {
         type: [
            {
               url: {
                  type: String,
                  required: true,
               },
               mimetype: String,
               size: Number,
            },
         ],
         default: [],
      },
   },
   {
      timestamps: true,
   },
);

export const Task = mongoose.model("Task", taskSchema);
