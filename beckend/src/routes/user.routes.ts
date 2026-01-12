import { Router } from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.js"
const router = Router();

router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,  changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, updateUserCoverImage)

export default router;
