import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from 'bcrypt';
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    /** As soon as request comes there are some steps to follow:
     * 1. Validation (Properly)
     * 2. Process (Logic)
     * 3. Response
    */ 
    
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
        // Create error here
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    // After registering, we need to check whether email already exists in database or not

    // Database Call
    const user = await userModel.findOne({ email });

    if (user) {
        const error = createHttpError(400, "User Email already exists.");
        return next(error);
    }

    // Store user info in DB if not exists
    
    // Also password we can't store plain in Db we need to hash it using bcrypt.

    // Password -> Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Storing it to DB
    const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
    });


    // Token Generation (JWT token)
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, { expiresIn: '7d' });

    // Response
    res.json({ accessToken: token, message: "User registered successfully" });
};

export { createUser };