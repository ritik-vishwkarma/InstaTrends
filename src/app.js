import express from "express"
import cors from "cors"
import connectDB from "./db/index.js";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json())

let dbConnection;

connectDB()
.then((db) => {
    dbConnection = db;
    console.log("Connected to the database");
})
.catch((err) => {
    console.error( "Error connecting to the database",err);
    process.exit(1);
})

app.use((req, _, next) => {
    req.db = dbConnection;
    next();
})

import apifyRouter from "./routers/apify.routes.js"
import llmRouter from "./routers/apify.routes.js"

app.use("/apify", apifyRouter) // http://localhost:3000/apify/run-actor
app.use("/llm", llmRouter) // http://localhost:3000/llm/query

export { app };