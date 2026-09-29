import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import mongoose from "mongoose";
import { UserRoleEnums } from "../utils/constant.js";

/**
 * Lists projects created by or shared with the authenticated user, with member counts.
 * @route GET /api/v1/projects
 * @access Authenticated
 */
export const getProjects = asyncHandler(async (req, res) => {
   // Aggregation comparisons need the same BSON type as the stored ObjectId.
   const userId = new mongoose.Types.ObjectId(req.user._id);
   const projectMemberCollection = ProjectMember.collection.name;

   const projects = await Project.aggregate([
      // Find whether this user has a membership record for each project.
      {
         $lookup: {
            from: projectMemberCollection,
            let: { projectId: "$_id" },
            pipeline: [
               {
                  $match: {
                     $expr: {
                        $and: [
                           { $eq: ["$project", "$$projectId"] },
                           { $eq: ["$user", userId] },
                        ],
                     },
                  },
               },
               { $limit: 1 },
               { $project: { _id: 1 } },
            ],
            as: "currentUserMembership",
         },
      },
      // Keep projects created by the user or joined through a membership.
      {
         $match: {
            $or: [
               { createdBy: userId },
               { "currentUserMembership.0": { $exists: true } },
            ],
         },
      },
      // Count all membership records belonging to each visible project.
      {
         $lookup: {
            from: projectMemberCollection,
            let: { projectId: "$_id" },
            pipeline: [
               {
                  $match: {
                     $expr: { $eq: ["$project", "$$projectId"] },
                  },
               },
               { $count: "total" },
            ],
            as: "memberCountResult",
         },
      },
      // A lookup with no matches returns an empty array, so default its count to 0.
      {
         $addFields: {
            memberCount: {
               $ifNull: [{ $arrayElemAt: ["$memberCountResult.total", 0] }, 0],
            },
         },
      },
      // Remove temporary lookup results and show recently created projects first.
      {
         $project: {
            currentUserMembership: 0,
            memberCountResult: 0,
         },
      },
      { $sort: { createdAt: -1 } },
   ]);

   return res
      .status(200)
      .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

/**
 * Returns one project by ID.
 * @route GET /api/v1/projects/:projectId
 * @access Authenticated project member
 * @todo Implement project lookup and membership authorization.
 */
export const getProjectById = asyncHandler(async (req, res) => {
   // test
});

/**
 * Creates a project and assigns its creator the admin role.
 * @route POST /api/v1/projects
 * @access Authenticated
 *
 */
export const createProject = asyncHandler(async (req, res) => {
   // test
   const { name, description } = req.body;

   const project = await Project.create({
      name,
      description,
      createdBy: new mongoose.Types.ObjectId(req.user?._id),
   });

   await ProjectMember.create({
      user: new mongoose.Types.ObjectId(req.user?._id),
      project: new mongoose.Types.ObjectId(project._id),
      role: UserRoleEnums.ADMIN,
   });

   return res
      .status(201)
      .json(new ApiResponse(201, project, "Project Created successfully"));
});

/**
 * Updates a project owned by the authenticated user.
 * @route PUT /api/v1/projects/:projectId
 * @access Project admin
 */
export const updateProject = asyncHandler(async (req, res) => {
   const { projectId } = req.params;
   const { name, description } = req.body;

   const project = await Project.findById(projectId);
   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   if (String(project.createdBy) !== String(req.user._id)) {
      throw new ApiError(403, "You don't have permission to do this");
   }

   if (name !== undefined) project.name = name;
   if (description !== undefined) project.description = description;
   await project.save();

   return res
      .status(200)
      .json(new ApiResponse(200, project, "Project updated successfully"));
});

/**
 * Deletes a project owned by the authenticated user and its memberships.
 * @route DELETE /api/v1/projects/:projectId
 * @access Project admin
 */
export const deleteProject = asyncHandler(async (req, res) => {
   const { projectId } = req.params;

   const project = await Project.findById(projectId);
   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   if (String(project.createdBy) !== String(req.user._id)) {
      throw new ApiError(403, "You don't have permission to do this");
   }

   await project.deleteOne();
   await ProjectMember.deleteMany({ project: project._id });

   return res
      .status(200)
      .json(new ApiResponse(200, project, "Project deleted successfully"));
});

/**
 * Adds a member to a project.
 * @route POST /api/v1/projects/:projectId/members
 * @access Project admin
 * @todo Implement member addition and authorization.
 */
export const addMembersToProject = asyncHandler(async (req, res) => {
   // test
});

/**
 * Lists members of a project.
 * @route GET /api/v1/projects/:projectId/members
 * @access Authenticated project member
 * @todo Implement member listing and membership authorization.
 */
export const getProjectMembers = asyncHandler(async (req, res) => {
   // test
});

/**
 * Changes a project member's role.
 * @route PUT /api/v1/projects/:projectId/members/:userId
 * @access Project admin
 * @todo Implement role updates and authorization.
 */
export const updateMemberRole = asyncHandler(async (req, res) => {
   // test
});

/**
 * Removes a member from a project.
 * @route DELETE /api/v1/projects/:projectId/members/:userId
 * @access Project admin
 * @todo Implement member removal and authorization.
 */
export const deleteMember = asyncHandler(async (req, res) => {
   // test
});
