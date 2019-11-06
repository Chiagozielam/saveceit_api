import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Receipt, Profile, User } from "../../database";
import _ from "lodash";
import { registerValidation, loginValidation } from "./validation";
import app from "../..";

// REGISTER A NEW USER
const userRegister = async (req, res) => {
  console.log(req.body.firstname);
  // VALIDATE THE DATA BEFORE CREATING A NEW USER
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if user already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");

  //Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // Create new User
  const { firstname, lastname, email, phoneNumber, password } = req.body;
  const newUser = new User({
    firstname,
    lastname,
    email,
    phoneNumber,
    password: hashPassword
  });
  try {
    const saveUser = await newUser.save();
    if (saveUser) {
      //Create and assign a token
      const token = jwt.sign(
        { _id: saveUser._id, email: saveUser.email },
        process.env.USER_TOKEN_SECRET
      );
      res.send(token);
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

// LOGIN A USER
const userLogin = async (req, res) => {
  // VALIDATE THE DATA BEFORE LOGIN
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Check if user already exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("The Email does not match any current user");
  }
  // Check if pasword is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    return res.status(400).send("The Password is incorrect");
  }

  //Create and assign a token
  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.USER_TOKEN_SECRET
  );
  res.header("user-token", token).send(token);
};

// HERE WE ADD RECEIPTS TO THE RECEIPTS TABLE
const addReceipts = async (req, res) => {
  console.log(req.header)
  const { receiptName, receiptImg } = req.body;
  const userId = req.user._id;
  const receiptData = {
    receiptName,
    receiptImg,
    owner: userId
  };
  const newItem = new Receipt(receiptData);
  try {
    const saveItem = await newItem.save();
    console.log(req.user._id);
    res.send(saveItem);
  } catch (err) {
    console.log(err);
  }
};

// -----------THIS SECTION IS FOR VIEWNIG ALL PRODUCTS ADDED BY A USER-----------------

const viewUserReceipts = async (req, res) => {
  const userId = req.user._id;
  try {
    const userReceipts = await Receipt.find({ owner: userId });
    res.send(userReceipts);
    console.log(userReceipts);
  } catch (err) {
    console.log(`could not fetch receipts ${err}`);
  }
};

// -----------HERE WE ENABLE A USER DELETE A RECEIPT-----------------
const deleteReceipt = async (req, res) => {
  const receiptId = req.body.id;
  const ownerId = req.user._id
  try {
    const deleted = await Receipt.find({ _id: receiptId }).deleteOne();
    if (deleted) {
      console.log(`deletion of receipt with id ${receiptId} is successful`);
      const userReceipts = await Receipt.find({owner: ownerId})
      res.send(userReceipts)
    }
  } catch (err) {
    console.log(`error deleting receipt ${err}`);
  }
};

export {
  userLogin,
  userRegister,
  addReceipts,
  viewUserReceipts,
  deleteReceipt
};
