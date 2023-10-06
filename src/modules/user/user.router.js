import { Router } from "express";
import * as userController from "./controller/user.js"
import { asyncHandler } from "../../utils/globalErrorHandling.js";
import auth from "../../middleware/auth.js";
import { IdValidator, validation } from "../../middleware/validation.js";
import  * as validator from "./user.validation.js"
import { fileUpload, fileValidation } from "../../utils/multer.js";
const router = Router();

router.post("/signup",validation(validator.signup) ,asyncHandler(userController.signup));
router.get("/confirm-email",validation(validator.confirmEmail),asyncHandler(userController.confirmEmail))
router.post("/login",validation(validator.login),asyncHandler(userController.login));
router.get("/get-profile/:id",validation(IdValidator),asyncHandler(userController.getUserProfile))
router.put("/update",auth,validation(validator.update),asyncHandler(userController.update))
router.patch("/update-password",auth,validation(validator.updatePassword),asyncHandler(userController.updatePassword))
router.get("/forget-password-mail",validation(validator.forgetPasswordMail),asyncHandler(userController.forgetPasswordMail))
router.post("/forget-password",validation(validator.forgetPassword),asyncHandler(userController.forgetPassword))
router.get("/soft-delete",auth,asyncHandler(userController.softDelete))
router.get("/profile-photo",auth,fileUpload(fileValidation.image).single('image'),validation(validator.addProfilePhoto) ,asyncHandler(userController.addProfilePic))
router.get("/cover-photo",auth,fileUpload(fileValidation.image).array('coverImages',5),validation(validator.addCoverPhoto),asyncHandler(userController.addCoverPhoto))
router.get("/refreshToken",validation(validator.refreshToken),asyncHandler(userController.refreshToken))


export default router;
