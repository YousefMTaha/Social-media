import { Router } from "express";
import * as commentController from "./controller/comment.js";
import auth from "../../middleware/auth.js";
import { IdValidator, validation } from "../../middleware/validation.js";
import * as validator from "./comment.validation.js";
import { asyncHandler } from "../../utils/globalErrorHandling.js";
const router = Router();

router.get(
  "/add/:postId",
  auth,
  validation(validator.add),
  asyncHandler(commentController.add)
);
router.put(
  "/update/:commentId",
  auth,
  validation(validator.update),
  asyncHandler(commentController.update)
);
router.delete(
  "/remove/:id",
  auth,
  validation(IdValidator),
  asyncHandler(commentController.remove)
);
router.get(
  "/like/:id",
  auth,
  validation(IdValidator),
  asyncHandler(commentController.like)
);
router.get(
  "/unlike/:id",
  auth,
  validation(IdValidator),
  asyncHandler(commentController.unlike)
);

export default router;
