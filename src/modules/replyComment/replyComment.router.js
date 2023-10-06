import { Router } from "express";
import * as replyCommentController from "./controller/replyComment.js";
import auth from "../../middleware/auth.js";
import { IdValidator, validation } from "../../middleware/validation.js";
import * as validator from "./replyComment.validation.js";
import { asyncHandler } from "../../utils/globalErrorHandling.js";
const router = Router();

router.get(
  "/add/:commentId",
  auth,
  validation(validator.add),
  asyncHandler(replyCommentController.add)
);

router.put(
  "/update/:replyCommentId",
  auth,
  validation(validator.update),
  asyncHandler(replyCommentController.update)
);

router.delete(
  "/delete/:id",
  auth,
  validation(IdValidator),
  asyncHandler(replyCommentController.remove)
);

router.get(
  "/like/:id",
  auth,
  validation(IdValidator),
  asyncHandler(replyCommentController.like)
);

router.get(
  "/unlike/:id",
  auth,
  validation(IdValidator),
  asyncHandler(replyCommentController.unlike)
);

export default router;
