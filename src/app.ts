import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

// Routes

// HTTP Methods: GET, POST, PUT, PATCH, DELETE

app.get("/", (req, res, next) => {
    // Generated an error for testing to test global error handler
    /*const error = createHttpError(400, "Something went wrong");
    throw error;*/
    res.json({ message: "Welcome to Elib API's" });
    next();
});

app.use('/api/users', userRouter);

app.use(globalErrorHandler);

export default app;