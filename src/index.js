import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'
const fileParser = require('express-multipart-file-parser')
import {userRoutes} from "./app"

const app = express()
app.use(cors());
dotenv.config()


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileParser)

mongoose
  .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
  .then(() => console.log("Db connection successful!"))
  .catch(err => console.log(err));


app.use('/api/v1/users', userRoutes)

export default app