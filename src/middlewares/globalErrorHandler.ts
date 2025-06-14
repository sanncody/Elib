import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

// Global error handler is a middleware in Express ("It must be at last so that it can work properly")
const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message,
        errorStack: config.env === "development" ? err.stack : ''
    });
};

export default globalErrorHandler;