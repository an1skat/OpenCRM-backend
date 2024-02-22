import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import UserModel from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const decoderToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    return decodedToken._id;
  } catch (err) {
    console.error("Ошибка при извлечении идентификатора пользователя:", error);
    return null;
  }
};

export const register = async (req, res) => {
  try {
    const exisitingUser = await UserModel.findOne({ email: req.body.email });

    if (exisitingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const pass = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    const doc = new UserModel({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      surname: req.body.surname,
      password: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "30d",
      }
    );

    const { password, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Can't register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.password
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: "Invalid password or email",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "30d",
      }
    );

    const { password, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Can't login",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (res.status === 403) {
      return res.status(403).json({
        message: "Haven't got access",
      });
    }
    const { password, ...userData } = user._doc;
    res.json({
      message: "Success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Haven't got access",
    });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const userId = decoderToken(token);
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving user" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    const fileName = uuidv4() + ".jpg";

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Файл не предоставлен" });
    }

    const file = req.files.file;

    const fileExtension = path.extname(file.name).toLowerCase();
    if (fileExtension !== ".jpg" && fileExtension !== ".png") {
      return res
        .status(400)
        .json({ message: "Разрешены только файлы с расширением .jpg и .png" });
    }

    const currentFilePath = fileURLToPath(import.meta.url);

    const controllersDir = path.dirname(currentFilePath);

    const projectDir = path.resolve(controllersDir, "..");

    const AVATAR_PATH = path.resolve(projectDir, "avatars");

    const filePath = path.resolve(AVATAR_PATH, fileName);

    file.mv(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Ошибка загрузки файла" });
      }

      user.avatar = fileName;
      user.save();

      return res.json({
        message: "Аватар загружен",
        filePath: filePath, 
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось загрузить аватар",
    });
  }
};
