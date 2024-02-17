import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path, { dirname } from "path";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import * as userControllers from "./controllers/userControllers.js";
import { registerValidation, loginValidation } from "./validations.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const avatarsPath = path.join(__dirname, "avatars");
app.use("/avatars", express.static(avatarsPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
    console.log("MongoDB Not Connected");
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
app.get("/", (req, res) => {
  console.log("Hello World!");
  res.send("Hello World!");
});

app.post(
    "/register",
    registerValidation,
    handleValidationErrors,
    userControllers.register
)
app.post(
    "/login",
    loginValidation,
    handleValidationErrors,
    userControllers.login
)