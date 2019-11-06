import express from "express"
import app from "./src"
import cors from "cors"

app.use(cors())


const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`the server has been started on port ${5000}`)
});