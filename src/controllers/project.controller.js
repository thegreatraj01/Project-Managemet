import { Project } from "../models/project.models.js";
import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyns-handler.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRoleEnums } from "../utils/constant.js";

const ensureProjectAdminAccess = async (userId, projectId) => {
   const project = await Project.findById(projectId);

   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   const isProjectCreator = String(project.createdBy) === String(userId);

   if (isProjectCreator) {
      return project;
   }

   const membership = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
   });

   if (
      !membership ||
      ![
         UserRoleEnums.ADMIN,
         UserRoleEnums.PROJECT_ADMIN,
      ].includes(membership.role)
   ) {
      throw new ApiError(403, "You don't have permission to do this");
   }

   return project;
};

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
   const { projectId } = req.params;

   const project = await Project.findById(projectId);

   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   const isProjectCreator = String(project.createdBy) === String(req.user._id);
   const isProjectMember = await ProjectMember.exists({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
   });

   if (!isProjectCreator && !isProjectMember) {
      throw new ApiError(403, "You don't have permission to do this");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, project, "Project fetched successfully"));
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

   const project = await ensureProjectAdminAccess(req.user._id, projectId);

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

   const project = await ensureProjectAdminAccess(req.user._id, projectId);

   await project.deleteOne();
   await ProjectMember.deleteMany({ project: project._id });

   return res
      .status(200)
      .json(new ApiResponse(200, project, "Project deleted successfully"));
});

/**
 * Adds a member to a project.
 * Only project admin can add a new member
 * @route POST /api/v1/projects/:projectId/members
 * @access Project admin
 *
 */
export const addMembersToProject = asyncHandler(async (req, res) => {
   const { email, role } = req.body;
   const { projectId } = req.params;

   await ensureProjectAdminAccess(req.user._id, projectId);

   if (!email || !role) {
      throw new ApiError(400, "Email and role are required");
   }

   if (!AvailableUserRoles.includes(role)) {
      throw new ApiError(400, "User role doesn't exist");
   }

   const user = await User.findOne({ email: email.trim() });
   if (!user) {
      throw new ApiError(404, "User does not exist");
   }

   const member = await ProjectMember.findOneAndUpdate(
      {
         user: new mongoose.Types.ObjectId(user._id),
         project: new mongoose.Types.ObjectId(projectId),
      },
      {
         user: new mongoose.Types.ObjectId(user._id),
         project: new mongoose.Types.ObjectId(projectId),
         role,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
   );

   return res
      .status(201)
      .json(new ApiResponse(201, member, "User added successfully"));
});

/**
 * Lists members of a project.
 * @route GET /api/v1/projects/:projectId/members
 * @access Authenticated project member
 * @todo Implement member listing and membership authorization.
 */
export const getProjectMembers = asyncHandler(async (req, res) => {
   const { projectId } = req.params;

   const project = await Project.findById(projectId);

   if (!project) {
      throw new ApiError(404, "Project not found");
   }

   const isProjectCreator = String(project.createdBy) === String(req.user._id);
   const isProjectMember = await ProjectMember.exists({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
   });

   if (!isProjectCreator && !isProjectMember) {
      throw new ApiError(403, "You don't have permission to do this");
   }

   const projectMembers = await ProjectMember.aggregate([
      { $match: { project: mongoose.Types.ObjectId(projectId) } },
      {
         $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [
               {
                  $project: {
                     _id: 1,
                     username: 1,
                     fullname: 1,
                     avatar: 1,
                  },
               },
            ],
         },
      },
      {
         $addFields: {
            user: {
               $arrayElemAt: ["$user", 0],
            },
         },
      },
      {
         $project: {
            project: 1,
            user: 1,
            role: 1,
            createdAt: 1,
            updatedAt: 1,
            _id: 0,
         },
      },
   ]);
   return res
      .status(200)
      .json(new ApiResponse(200, projectMembers, "Project members fetched"));
});

/**
 * Changes a project member's role.
 * @route PUT /api/v1/projects/:projectId/members/:userId
 * @access Project admin
 * @todo Implement role updates and authorization.
 */
export const updateMemberRole = asyncHandler(async (req, res) => {
   const { userId, projectId } = req.params;
   const { newRole } = req.body;

   await ensureProjectAdminAccess(req.user._id, projectId);

   if (!AvailableUserRoles.includes(newRole)) {
      throw new ApiError(400, "User role doesn't exist");
   }

   let projectMember = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
   });

   if (!projectMember) {
      throw new ApiError(404, "Project member does not exist");
   }

   projectMember = await ProjectMember.findByIdAndUpdate(
      projectMember._id,
      {
         role: newRole,
      },
      { new: true },
   );

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            projectMember,
            "Project member role updated successfully",
         ),
      );
});

/**
 * Removes a member from a project.
 * @route DELETE /api/v1/projects/:projectId/members/:userId
 * @access Project admin
 * @todo Implement member removal and authorization.
 */
export const deleteMember = asyncHandler(async (req, res) => {
   const { userId, projectId } = req.params;

   await ensureProjectAdminAccess(req.user._id, projectId);

   let projectMember = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
   });

   if (!projectMember) {
      throw new ApiError(404, "Project member does not exist");
   }

   projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            projectMember,
            "Project member deleted successfully",
         ),
      );
});
