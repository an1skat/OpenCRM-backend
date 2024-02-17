import { body } from "express-validator";

export const registerValidation = [
    body("email", "Incorrect email").isEmail(),
    body("firstName", "Incorrect name").isLength({ min: 3, max: 20 }),
    body("lastName", "Incorrect name").isLength({ min: 3, max: 20 }),
    body("surname", "Incorrect name").isLength({ min: 3, max: 20 }),
    body("password", "Incorrect password").isLength({ min: 5, max: 15 }),
]

export const loginValidation = [
    body("email", "Incorrect email").isEmail(),
    body("password", "Incorrect password").isLength({ min: 5, max: 15 }),
]