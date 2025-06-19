import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from 'node:fs';
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const coverImageMimeType = files.coverImage[0].mimetype.split('/').pop();
        const fileName = files.coverImage[0].filename;
        const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);

        // Upload an image
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType
        });

        const bookFileMimeType = files.file[0].mimetype.split('/').pop();
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);

        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: bookFileMimeType
        });

        const _req = req as AuthRequest;

        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url
        });

        // Delete temp files after file uploads on cloudinary
        try {
            await fs.promises.unlink(filePath);
            await fs.promises.unlink(bookFilePath);
        } catch (error) {
            return next(createHttpError(500, "Error while deleting temp files."));
        }

        res.status(201).json({ id: newBook._id, message: "Book created!!" });
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error while uploading the files."));
    }
};

const updateBook = async(req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    const bookId = req.params.bookId;
    
    const book = await bookModel.findOne({ _id: bookId });
    
    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }
    
    // Check access whether author is updating his book only or not
    const _req = req as AuthRequest;
    
    if (book?.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You cannot update book of others"));
    }
};

export { createBook, updateBook };