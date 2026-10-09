import express from "express";
import {
   createSubTask,
   createTask,
   deleteSubTask,
   deleteTask,
   getTaskById,
   getTasks,
   updateSubTask,
   updateTask,
} from "../controllers/task.controllers.js";
import { validate } from "../middleware/validator.middleware.js";
import {
   verifyJwt,
   validateProjectPermission,
} from "../middleware/auth.middleware.js";
import { AvailableUserRoles, UserRoleEnums } from "../utils/constant.js";
import {
   createSubtaskValidator,
   updateSubTaskValidator,
   updateTaskValidator,
} from "../validators/task.validator.js";

const router = express.Router();
router.use(verifyJwt);

router
   .route("/:projectId")
   .get(getTasks)
   .post(validateProjectPermission([UserRoleEnums.ADMIN, UserRoleEnums.PROJECT_ADMIN]), createTask);

router
   .route("/:projectId/t/:taskId")
   .all(validateProjectPermission([...AvailableUserRoles]))
   .get(getTaskById)
   .put(updateTaskValidator(), validate, updateTask)
   .delete(deleteTask);

router
   .route("/:projectId/t/:taskId/subtasks")
   .post(
      validateProjectPermission([UserRoleEnums.ADMIN, UserRoleEnums.PROJECT_ADMIN]),
      createSubtaskValidator(),
      validate,
      createSubTask,
   );

router
   .route("/:projectId/st/:subTaskId")
   .put(
      validateProjectPermission([...AvailableUserRoles]),
      updateSubTaskValidator(),
      validate,
      updateSubTask,
   )
   .delete(
      validateProjectPermission([UserRoleEnums.ADMIN, UserRoleEnums.PROJECT_ADMIN]),
      deleteSubTask,
   );

export default router;
