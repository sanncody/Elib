import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";

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

    res.json({ message: "User created" });
};

export { createUser };