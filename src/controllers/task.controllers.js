import { Project } from "../models/project.models.js";
import { SubTask } from "../models/subtask.models.js";
import { Task } from "../models/task.models.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import mongoose from "mongoose";

const getTasks = asyncHandler(async (req, res) => {
   const { projectId } = req.params;
   const project = await Project.findById(projectId);
   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   const tasks = await Task.find({
      project: new mongoose.Types.ObjectId(projectId),
   }).populate("assignedTo", "avatar username fullName");

   return res
      .status(200)
      .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
   const { title, description, assignedTo, status } = req.body;
   const { projectId } = req.params;
   const project = await Project.findById(projectId);

   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   const files = req.files || [];
   const attachments = files.map((file) => ({
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
   }));

   const task = await Task.create({
      title,
      description,
      project: new mongoose.Types.ObjectId(projectId),
      assignedTo: assignedTo
         ? new mongoose.Types.ObjectId(assignedTo)
         : undefined,
      status,
      assignedBy: new mongoose.Types.ObjectId(req.user._id),
      attachments,
   });

   return res
      .status(201)
      .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
   const { taskId } = req.params;

   const task = await Task.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(taskId),
         },
      },
      {
         $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedTo",
            pipeline: [
               {
                  $project: {
                     _id: 1,
                     username: 1,
                     fullName: 1,
                     avatar: 1,
                  },
               },
            ],
         },
      },
      {
         $lookup: {
            from: "subtasks",
            localField: "_id",
            foreignField: "task",
            as: "subtasks",
            pipeline: [
               {
                  $lookup: {
                     from: "users",
                     localField: "createdBy",
                     foreignField: "_id",
                     as: "createdBy",
                     pipeline: [
                        {
                           $project: {
                              _id: 1,
                              username: 1,
                              fullName: 1,
                              avatar: 1,
                           },
                        },
                     ],
                  },
               },
               {
                  $addFields: {
                     createdBy: {
                        $arrayElemAt: ["$createdBy", 0],
                     },
                  },
               },
            ],
         },
      },
      {
         $addFields: {
            assignedTo: {
               $arrayElemAt: ["$assignedTo", 0],
            },
         },
      },
   ]);

   if (!task || task.length === 0) {
      throw new ApiError(404, "Task not found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
   const { title, description, status } = req.body;
   const { taskId } = req.params;

   const task = await Task.findById(taskId);
   if (!task) {
      throw new ApiError(404, "Task not available");
   }

   if (title !== undefined) task.title = title;
   if (description !== undefined) task.description = description;
   if (status !== undefined) task.status = status;

   const updatedTask = await task.save();

   return res
      .status(200)
      .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
   const { taskId } = req.params;

   const task = await Task.findById(taskId);
   if (!task) {
      throw new ApiError(404, "Task not available");
   }

   await task.deleteOne();

   return res
      .status(200)
      .json(new ApiResponse(200, null, "Task deleted successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
   const { title } = req.body;
   const { taskId } = req.params;

   const subTask = await SubTask.create({
      title,
      createdBy: new mongoose.Types.ObjectId(req.user._id),
      task: new mongoose.Types.ObjectId(taskId),
   });

   return res
      .status(201)
      .json(new ApiResponse(201, subTask, "Subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
   const { title, isCompleted } = req.body;
   const { subTaskId } = req.params;

   const subTask = await SubTask.findById(subTaskId);
   if (!subTask) {
      throw new ApiError(404, "Subtask not found");
   }

   if (title !== undefined) subTask.title = title;
   if (isCompleted !== undefined) subTask.isCompleted = isCompleted;

   const updatedSubTask = await subTask.save();

   return res
      .status(200)
      .json(
         new ApiResponse(200, updatedSubTask, "Subtask updated successfully"),
      );
});

const deleteSubTask = asyncHandler(async (req, res) => {
   const { subTaskId } = req.params;

   const deletedSubTask = await SubTask.findByIdAndDelete(subTaskId);
   if (!deletedSubTask) {
      throw new ApiError(404, "Subtask not found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, null, "Subtask deleted successfully"));
});

export {
   createSubTask,
   createTask,
   deleteTask,
   deleteSubTask,
   getTaskById,
   getTasks,
   updateSubTask,
   updateTask,
};
