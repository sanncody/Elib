import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

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

    res.json({ message: "User created" });
};

export { createUser };