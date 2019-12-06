import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import _ from "lodash";
import { Receipt, Profile, User } from "../../database";
import { registerValidation, loginValidation } from "./validation";
import app from "../..";
import { rejects } from "assert";
import fs from "fs";

// REGISTER A NEW USER
const userRegister = async (req, res) => {
  console.log(req.body.firstname);
  // VALIDATE THE DATA BEFORE CREATING A NEW USER
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if user already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send('Email already exists');

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // Create new User
  const { firstname, lastname, email, phoneNumber } = req.body;
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
      // Create and assign a token
      const token = jwt.sign(
        { _id: saveUser._id, email: saveUser.email },
        process.env.USER_TOKEN_SECRET
      );
      res.send(token);
      // Create user profile
      const fullname = firstname + " " + lastname;
      const newUserProfile = new Profile({
        profileName: fullname,
        owner: saveUser._id
      });
      try {
        const saveProfile = await newUserProfile.save();
        if (saveProfile) {
          // res.send(saveProfile)
        }
      } catch (err) {
        console.log(`here is the error creating the profile: ${err}`);
      }
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

//----------- HERE WE ENABLE USERS ADD RECEIPTS AS COLLECTIONS

const addReceipts = async (req, res) => {
  const cloud_name = "dcft8yhab";
  const api_key = "952961694399734";
  const api_secret = "iRlt9ZFuucvVBAIrqZYpitijsDY";

  const saveceitUserId = req.user._id;
  const receiptName = req.body.receiptName;
  console.log(receiptName);
  let imgArray = [];

  const { ...rest } = req.files;
  const files = Object.values(rest);
  const keys = Object.keys(rest);
  let keyLength = keys.length;
  // configure our cloudinary
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret
  });
  console.log(files);
  // let filePaths = imgFilePaths;
  const multiUpload = async () => {
    for (let i = 0; i <= keyLength - 1; i++) {
      let file = files[i];
      console.log(file);
      const path = `${__dirname}/../../temp/${file.name}`;

      //temporary store file on the server
      file.mv(path, err => {
        if (err) {
          console.log(`error moving file: ${err}`);
          return;
        }
      });
      // upload files to cloudinary

      const res = cloudinary.v2.uploader.upload(path, {
        folder: `/receipts/`,
        use_filename: true
      });
      await res
        .then(data => {
          console.log(`success uploading files to cloudinary`);
          // remove stored file and return upload result
          fs.unlink(path, err => {
            if (err) return reject(err);
          });
          const imgUrl = data.secure_url;
          imgArray = [...imgArray, imgUrl];
        })
        .catch(err => console.log(err));
    }
    const receiptFile = {
      receiptName,
      recieptImg: imgArray,
      owner: saveceitUserId
    };
    console.log(receiptFile);
    const newReceipt = new Receipt(receiptFile);
    console.log(newReceipt);
    try {
      const saveReceipt = await newReceipt.save();
      if (saveReceipt) {
        console.log("New Receipt has successfully been saved");
        res.send("New Receipt has successfully been saved");
      }
    } catch (err) {
      console.log("Unsuccessful saving receipt to database");
    }
  };
  multiUpload();
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
  const keys = Object.keys(req.body);
  const obj = keys[0];
  const jsonObj = JSON.parse(obj);
  const { id } = jsonObj;
  const receiptId = id;
  console.log(receiptId);
  const ownerId = req.user._id;
  try {
    const deleted = await Receipt.find({ _id: receiptId }).deleteOne();
    if (deleted) {
      console.log(`deletion of receipt with id ${receiptId} is successful`);
      const userReceipts = await Receipt.find({ owner: ownerId });
      res.send(userReceipts);
    }
  } catch (err) {
    console.log(`error deleting receipt ${err}`);
  }
};

// ------------------ HERE WE ENABLE A USER GET PROFILE-----------------
const getProfile = async (req, res) => {
  const userId = req.user._id;
  try {
    let userProfile = await Profile.find({ owner: userId });
    userProfile = userProfile[0];
    res.send(userProfile);
    console.log(userProfile);
  } catch (err) {
    console.log(`profile was not found! ${err}`);
  }
};

// ------------------ HERE WE ENABLE A USER EDIT PROFILE-----------------
const updateProfileName = async (req, res) => {
  const keys = Object.keys(req.body);
  console.log(keys);
  const obj = keys[0];
  const jsonObj = JSON.parse(obj);
  const { profileName } = jsonObj;
  // const profileName = req.body.profileName
  console.log(profileName);
  const ownerId = req.user._id;
  try {
    const updateName = await Profile.update(
      { owner: ownerId },
      { $set: { profileName: profileName } }
    );
    if (updateName) {
      const profile = await Profile.find({ owner: ownerId });
      return res.send(profile);
    }
    return res.status(400);
  } catch (err) {
    console.log(`error updating profile ${err}`);
  }
};
// Update profile image
const updateProfileImage = async (req, res) => {
  const keys = Object.keys(req.body);
  const obj = keys[0];
  const jsonObj = JSON.parse(obj);
  const { picture } = jsonObj;
  // const profileImg = req.body.profileImg
  const ownerId = req.user._id;
  try {
    const updateName = await Profile.update(
      { owner: ownerId },
      { $set: { profileImg: picture } }
    );
    if (updateName) {
      const profile = await Profile.find({ owner: ownerId });
      return res.send(profile);
    }
    return res.status(400);
  } catch (err) {
    console.log(`error updating profile ${err}`);
  }
};

export {
  userLogin,
  userRegister,
  addReceipts,
  viewUserReceipts,
  deleteReceipt,
  getProfile,
  updateProfileName,
  updateProfileImage
};
