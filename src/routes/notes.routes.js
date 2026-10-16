import express from "express";
import {
   createNote,
   deleteNote,
   getAllNotes,
   getNoteById,
   updateNote,
} from "../controllers/notes.controller.js";
import {
   verifyJwt,
   validateProjectPermission,
} from "../middleware/auth.middleware.js";
import { AvailableUserRoles, UserRoleEnums } from "../utils/constant.js";

const router = express.Router();

router.use(verifyJwt);

router
   .route("/:projectId")
   .get(validateProjectPermission(AvailableUserRoles), getAllNotes)
   .post(
      validateProjectPermission([
         UserRoleEnums.ADMIN,
         UserRoleEnums.PROJECT_ADMIN,
      ]),
      createNote,
   );

router
   .route("/:projectId/:noteId")
   .get(validateProjectPermission(AvailableUserRoles), getNoteById)
   .put(
      validateProjectPermission([
         UserRoleEnums.ADMIN,
         UserRoleEnums.PROJECT_ADMIN,
      ]),
      updateNote,
   )
   .delete(
      validateProjectPermission([
         UserRoleEnums.ADMIN,
         UserRoleEnums.PROJECT_ADMIN,
      ]),
      deleteNote,
   );

export default router;
