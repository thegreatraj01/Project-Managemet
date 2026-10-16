import { Project } from "../models/project.models.js";
import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRoleEnums } from "../utils/constant.js";
import { ProjectNote } from "../models/note.models.js";

/**
 * Lists notes belonging to the project in the request URL.
 *
 * @param {import("express").Request} req - Express request with `projectId`.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after returning the project notes.
 * @throws {ApiError} If the project ID is missing.
 */
export const getAllNotes = asyncHandler(async (req, res) => {
   const { projectId } = req.params;

   if (!projectId) {
      throw new ApiError(404, "ProjectId is required");
   }

   const notes = await ProjectNote.find({
      project: mongoose.Types.ObjectId(projectId),
   });

   return res
      .status(200)
      .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

/**
 * Creates a note for a project.
 *
 * @param {import("express").Request} req - Express request with `projectId` and note content.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after creating the note.
 * @throws {ApiError} If the content is empty.
 */
export const createNote = asyncHandler(async (req, res) => {
   const { content } = req.body;
   const { projectId } = req.params;

   if (typeof content !== "string" || !content.trim()) {
      throw new ApiError(400, "Content is required");
   }

   const newNote = await ProjectNote.create({
      content: content.trim(),
      project: mongoose.Types.ObjectId(projectId),
      createdBy: mongoose.Types.ObjectId(req.user._id),
   });

   return res
      .status(201)
      .json(new ApiResponse(201, newNote, "Note created successfully"));
});

/**
 * Fetches a note by ID.
 *
 * @param {import("express").Request} req - Express request with `projectId` and `noteId`.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after returning the note.
 * @throws {ApiError} If the note does not exist.
 */
export const getNoteById = asyncHandler(async (req, res) => {
   const { noteId, projectId } = req.params;

   const note = await ProjectNote.findOne({
      _id: mongoose.Types.ObjectId(noteId),
      project: mongoose.Types.ObjectId(projectId),
   });

   if (!note) {
      throw new ApiError(404, "Note not found");
   }
   return res
      .status(200)
      .json(new ApiResponse(200, note, "Note fetched successfully"));
});

/**
 * Updates a note's content.
 *
 * @param {import("express").Request} req - Express request with `noteId` and new content.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after updating the note.
 * @throws {ApiError} If the note does not exist.
 */
export const updateNote = asyncHandler(async (req, res) => {
   const { noteId, projectId } = req.params;
   const { content } = req.body;

   if (typeof content !== "string" || !content.trim()) {
      throw new ApiError(400, "Content is required");
   }

   const note = await ProjectNote.findOneAndUpdate(
      {
         _id: mongoose.Types.ObjectId(noteId),
         project: mongoose.Types.ObjectId(projectId),
      },
      {
         content: content.trim(),
      },
      {
         new: true,
      },
   );

   if (!note) {
      throw new ApiError(404, "Note not found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, note, "Note updated successfully"));
});

/**
 * Deletes a note.
 *
 * @param {import("express").Request} req - Express request with `projectId` and `noteId`.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Resolves after deleting the note.
 * @throws {ApiError} If the note does not exist.
 */
export const deleteNote = asyncHandler(async (req, res) => {
   const { noteId, projectId } = req.params;

   const note = await ProjectNote.findOneAndDelete({
      _id: mongoose.Types.ObjectId(noteId),
      project: mongoose.Types.ObjectId(projectId),
   });

   if (!note) {
      throw new ApiError(404, "Note not found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, null, "Note deleted successfully"));
});
