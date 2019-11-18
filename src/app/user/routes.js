import express from "express";
import {
  userLogin,
  userRegister,
  addReceipts,
  viewUserReceipts,
  deleteReceipt,
  getProfile,
  updateProfileName,
  updateProfileImage,
} from "./controller";
import { verifyLogin } from "./middleware";

const userRoutes = express.Router();

// middleware that is specific to this router
userRoutes.use((req, res, next) => {
  console.log("Time: ", Date.now());
  next();
});

userRoutes.route("/login").post(userLogin);
userRoutes.route("/register").post(userRegister);
userRoutes.route("/addreceipt").post(verifyLogin, addReceipts);
userRoutes.route("/deletereceipt").post(verifyLogin, deleteReceipt);
userRoutes.route("/viewuserreceipts").get(verifyLogin, viewUserReceipts);
userRoutes.route("/getprofile").get(verifyLogin, getProfile);
userRoutes.route("/editprofile/name").patch(verifyLogin, updateProfileName);
userRoutes.route("/editprofile/image").patch(verifyLogin, updateProfileImage)

export default userRoutes;
