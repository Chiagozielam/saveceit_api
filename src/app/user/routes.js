import express from "express";
import {
  userLogin,
  userRegister,
  addReceipts,
  viewUserReceipts,
  deleteReceipt
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

export default userRoutes;
