import express from 'express';
import { createBook } from './bookController';
import multer from 'multer';
import path from 'node:path';

const bookRouter = express.Router();

// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. 

// Working: Locally file store karta hai multer file system mein and then fir baad mein cloudinary pe upload krta hai yahan se utha kar and finally iss local system se delete kar deta hai
const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: {
        fileSize: 3e7
    },
});

bookRouter.post('/create', upload.fields([
    {
        name: "coverImage",
        maxCount: 1
    },
    {
        name: "file",
        maxCount: 1
    }
]), createBook);

export default bookRouter;