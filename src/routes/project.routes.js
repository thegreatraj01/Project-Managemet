import express from "express";
import {
   addMembersToProject,
   createProject,
   deleteMember,
   deleteProject,
   getProjects,
   getProjectById,
   getProjectMembers,
   updateMemberRole,
   updateProject,
} from "../controllers/project.controller.js";

import {
   createProjectValidator,
   addMemberToProjectValidator,
} from "../validators/index.js";

import { verifyJwt, validate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyJwt);

router
   .route("/")
   .get(getProjects)
   .post(createProjectValidator(), validate, createProject);
router
   .route("/:projectId")
   .get(getProjectById)
   .put(updateProject)
   .delete(deleteProject);
router
   .route("/:projectId/members")
   .get(getProjectMembers)
   .post(addMemberToProjectValidator(), validate, addMembersToProject);
router
   .route("/:projectId/members/:userId")
   .put(updateMemberRole)
   .delete(deleteMember);

export default router;
