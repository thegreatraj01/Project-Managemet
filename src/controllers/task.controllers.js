import { Project } from "../models/project.models.js";
import { SubTask } from "../models/subtask.models.js";
import { Task } from "../models/task.models.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import mongoose from "mongoose";

/**
 * Lists tasks in a project.
 *
 * @param {import("express").Request} req - Express request with `projectId`.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after returning the task list.
 * @throws {ApiError} If the project does not exist.
 */
const getTasks = asyncHandler(async (req, res) => {
   const { projectId } = req.params;
   // BUG: This checks only that the project exists; the route does not authorize project membership for task listing.
   const project = await Project.findById(projectId);
   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   // BUG: The populate projection below uses `fullName`, but the schema stores `fullname`.
   const tasks = await Task.find({
      project: new mongoose.Types.ObjectId(projectId),
   }).populate("assignedTo", "avatar username fullName");

   return res
      .status(200)
      .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

/**
 * Creates a task in a project.
 *
 * @param {import("express").Request} req - Authenticated request with `projectId` and task fields.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after creating the task.
 * @throws {ApiError} If the project does not exist.
 */
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

/**
 * Fetches a task with its assignee and subtasks.
 *
 * @param {import("express").Request} req - Request with `projectId` and `taskId`.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after returning the task.
 * @throws {ApiError} If the task does not exist.
 */
const getTaskById = asyncHandler(async (req, res) => {
   const { taskId } = req.params;

   // BUG: Matching only taskId allows an authorized project member to fetch a task from another project.
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
                     // BUG: The User schema field is `fullname`, not `fullName`.
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
                              // BUG: The User schema field is `fullname`, not `fullName`.
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

/**
 * Updates a task's editable fields.
 *
 * @param {import("express").Request} req - Request with `taskId` and task fields.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after updating the task.
 * @throws {ApiError} If the task does not exist.
 */
const updateTask = asyncHandler(async (req, res) => {
   const { title, description, status } = req.body;
   const { taskId } = req.params;

   // BUG: The task is not constrained to req.params.projectId, so another project's task can be modified.
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

/**
 * Deletes a task.
 *
 * @param {import("express").Request} req - Request with `taskId`.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after deleting the task.
 * @throws {ApiError} If the task does not exist.
 */
const deleteTask = asyncHandler(async (req, res) => {
   const { taskId } = req.params;

   // BUG: The task is not constrained to req.params.projectId, so another project's task can be deleted.
   const task = await Task.findById(taskId);
   if (!task) {
      throw new ApiError(404, "Task not available");
   }

   await task.deleteOne();

   return res
      .status(200)
      .json(new ApiResponse(200, null, "Task deleted successfully"));
});

/**
 * Creates a subtask under a task.
 *
 * @param {import("express").Request} req - Authenticated request with `taskId` and a title.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after creating the subtask.
 */
const createSubTask = asyncHandler(async (req, res) => {
   const { title } = req.body;
   const { taskId } = req.params;

   // BUG: The referenced task is not checked against the authorized project (or for existence).
   const subTask = await SubTask.create({
      title,
      createdBy: new mongoose.Types.ObjectId(req.user._id),
      task: new mongoose.Types.ObjectId(taskId),
   });

   return res
      .status(201)
      .json(new ApiResponse(201, subTask, "Subtask created successfully"));
});

/**
 * Updates a subtask's title or completion status.
 *
 * @param {import("express").Request} req - Request with `subTaskId` and subtask fields.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after updating the subtask.
 * @throws {ApiError} If the subtask does not exist.
 */
const updateSubTask = asyncHandler(async (req, res) => {
   const { title, isCompleted } = req.body;
   const { subTaskId } = req.params;

   // BUG: The subtask is not constrained to a task in req.params.projectId.
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

/**
 * Deletes a subtask.
 *
 * @param {import("express").Request} req - Request with `subTaskId`.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after deleting the subtask.
 * @throws {ApiError} If the subtask does not exist.
 */
const deleteSubTask = asyncHandler(async (req, res) => {
   const { subTaskId } = req.params;

   // BUG: The subtask is not constrained to a task in req.params.projectId.
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
