import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from 'node:fs';

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
        })

        console.log("BookFile Upload result", bookFileUploadResult);

        console.log("Uploaded result", uploadResult);

        const newBook = await bookModel.create({
            title,
            genre,
            author: "68507d8679b659755a1d2d00",
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

export { createBook };