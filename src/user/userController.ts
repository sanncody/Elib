import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from 'bcrypt';
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { IUser } from "./userTypes";
import { Require_id } from "mongoose";

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
    try {
        const user = await userModel.findOne({ email });

        if (user) {
            const error = createHttpError(400, "User Email already exists.");
            return next(error);
        }

    } catch (error) {
        return next(createHttpError(500, "Error while getting user from Database"));
    }

    // Store user info in DB if not exists
    
    // Also password we can't store plain in Db we need to hash it using bcrypt.

    // Password -> Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser: IUser;
    try {
        // Storing it to DB
        newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
        });

    } catch (error) {
        return next(createHttpError(500, "Error while creating user in Database"));
    }


    try {
        // Token Generation (JWT token)
        const token = sign(
            { 
                sub: newUser._id 
            }, 
            config.jwtSecret as string, 
            { 
                expiresIn: '7d', 
                algorithm: "HS256" 
            }
        );

        // Response
        res.status(201).json({ accessToken: token, message: "User registered successfully" });
    } catch (error) {
        return next(createHttpError(500, "Error while signing the JWT token."));
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
        // Create error here
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    // Check whether user exists in Database or not
    let user;
    try {
        user = await userModel.findOne({ email });

        if (!user) {
            const error = createHttpError(404, "User not found.");
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, "Error while getting user from database"));
    }

    // We have to match login's email and password with database email and password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(createHttpError(400, "Incorrect email or password!"));
    }

    // If user matches then we have to generate new access token for login
    try {
        // Token Generation (JWT token)
        const token = sign(
            {
                sub: user._id
            },
            config.jwtSecret as string,
            {
                expiresIn: '7d',
                algorithm: "HS256"
            }
        );

        // Response
        res.status(201).json({ accessToken: token, message: "User logged in successfully!" });
    } catch (error) {
        return next(createHttpError(500, "Error while logging the JWT token."));
    }
};

export { createUser, loginUser };