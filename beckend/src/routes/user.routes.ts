import { Router } from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage, loginViaAccessToken, getProfile } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.js"
const router = Router();

router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/get-profile/:id").get(verifyJWT,  getProfile)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,  changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/login-via-access-token").post(loginViaAccessToken)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, updateUserCoverImage)

export default router;
