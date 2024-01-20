import express from "express";
import cors from 'cors'
import api from "./routes/api.js"

const app = express()
const port = process.env.PORT || 3000
app.use(cors()) 
app.use(express.json())
app.use('/api', api)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})