import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { userRoutes } from './app';

const fileUpload = require('express-fileupload');

const app = express();
app.use(fileUpload());

app.use(cors());
dotenv.config();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose
  .connect(process.env.DB_CONNECT_PROD, { useNewUrlParser: true })
  .then(() => console.log('Db connection successful!'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello! welcome to saveceit api');
});
app.use('/api/v1/users', userRoutes);

export default app;
