import express from 'express'
import cors from 'cors';
import app from './src';


app.use(cors({ origin: '*' }));


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`the server has been started on port ${5000}`);
});
