import express, {Express} from "express"
import path from "path"
import router from "./src/routes/user"
import morgan from "morgan"
import mongoose, { Connection } from 'mongoose'
import dotenv from "dotenv"
import cors, {CorsOptions} from 'cors'

dotenv.config()

const port = 3000 
const app: Express = express()
const mongoDB: string = "mongodb://localhost:27017/testdb"

mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error"))

const corsOptions: CorsOptions = {
    origin: ['http://localhost:3001'],
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(morgan("dev"))
app.use(express.json())

app.use(express.static(path.join(__dirname, "../public")))
app.get("/", (reg,res) => {
    res.sendFile(path.join(__dirname, "../public/register.html"));
})

app.use("/api", router)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    
})