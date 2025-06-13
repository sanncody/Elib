import express from "express";

const app = express();

// Routes

// HTTP Methods: GET, POST, PUT, PATCH, DELETE

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Elib API's" });
});

export default app;