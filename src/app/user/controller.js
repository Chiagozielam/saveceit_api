import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import { Receipt, Profile, User } from "../../database";
import _ from "lodash";
import { registerValidation, loginValidation } from "./validation";
import app from "../..";
import { rejects } from "assert";


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

  console.log(req.files)
  
  console.log(req.header);
  // so here's the long process I'm about starting here. The req.body when received, for
  // some weird reason. comes back as an object that wraps an inner object which is wrapped
  // in quotes, thus making it a string.
  // so I got the keys in the object (which is just one) with Object.keys, which would return an array
  // then I selected the first element from the array, which is my stringed object.
  // then I parsed my stringed object with JSON.parse() to remove the object from strings and
  // display it in a json format, so I could now interract with the main object.
  // I hope I can figure out the problem real soon on my frontend.

  // const keys = Object.keys(req.body);
  // const obj = keys[0];
  // const jsonObj = JSON.parse(obj);
  // const { receiptName, imgFilePaths } = jsonObj;

  // const { receiptName, receiptImg, } = req.body;
  // configure our cloudinary
  // cloudinary.config({
  //   cloud_name,
  //   api_key,
  //   api_secret
  // });
  //  let filePaths = imgFilePaths
  // console.log(filePaths);
  //  const multipleUpload = new Promise(async(resolve, reject) => {
  //    let upload_len = filePaths.length
  //    let upload_res = new Array()

  //    for(let i = 0; i <=upload_len + 1; i++ ){
  //      let filePath = filePaths[i];
  //      await cloudinary.v2.uploader.upload(filePath, (error, result) => {
  //        if(upload_res.length === upload_len){
  //         // resolve promise after upload is complete
  //         resolve(upload_res)
  //        }else if(result){
  //         // push public_ids in an array 
  //         upload_res.push(result.public_id);
  //        }else if(error){
  //          console.log(error);
  //          reject(error)
  //        }
  //      })
  //    }
  //  })
  //  .then( result => result)
  //  .catch(error => console.log(error))
  //  const upload = await multipleUpload;
  //  console.log(upload)

  // const userId = req.user._id;
  // const receiptData = {
  //   receiptName,
  //   receiptImg,
  //   owner: userId
  // };
  // const newItem = new Receipt(receiptData);
  // try {
  //   const saveItem = await newItem.save();
  //   console.log(saveItem);
  //   res.send(saveItem);
  // } catch (err) {
  //   console.log(err);
  // }
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
