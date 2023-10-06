import { Router } from "express";
import { asyncHandler } from "../../utils/globalErrorHandling.js";
import * as postController from "./controller/post.js";
import auth from "../../middleware/auth.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { IdValidator, validation } from "../../middleware/validation.js";
import * as validator from "./post.validation.js";
const router = Router();

router.post(
  "/add",
  auth,
  fileUpload([...fileValidation.video, ...fileValidation.image]).fields([
    {
      name: "images",
      maxCount: 5,
    },
    { name: "video", maxCount: 1 },
  ]),

  validation(validator.add),
  asyncHandler(postController.add)
);

router.put(
  "/update/:id",
  auth,
  fileUpload([...fileValidation.video, ...fileValidation.image]).fields([
    {
      name: "images",
      maxCount: 5,
    },
    { name: "video", maxCount: 1 },
  ]),
  validation(validator.update),
  asyncHandler(postController.update)
);

router.delete(
  "/delete/:id",
  auth,
  validation(IdValidator),
  asyncHandler(postController.deletePost)
);

router.get(
  "/getPostById/:id",
  auth,
  validation(IdValidator),
  asyncHandler(postController.getPostById)
);

router.get(
  "/getPostWithComment",
  auth,
  asyncHandler(postController.getAllPosts)
);

router.patch(
  "/updatePostPrivacy/:postId",
  auth,
  validation(validator.updatePrivacy),
  asyncHandler(postController.postPrivacy)
);

router.get(
  "/getPostYesterday",
  auth,
  asyncHandler(postController.getPostsYesterday)
);

router.get("/getPostToday", auth, asyncHandler(postController.getPostsToday));

router.get(
  "/likePost/:id",
  auth,
  validation(IdValidator),
  asyncHandler(postController.likePost)
);

router.get(
  "/unlikePost/:id",
  auth,
  validation(IdValidator),
  asyncHandler(postController.unlikePost)
);

router.patch(
  "/soft-delete/:id",
  auth,
  validation(IdValidator),
  asyncHandler(postController.softDeletePost)
);

router.patch(
  "/addVideo/:id",
  auth,
  fileUpload(fileValidation.video).single("video"),
  validation(validator.addVideo),
  asyncHandler(postController.addVideo)
);

export default router;
