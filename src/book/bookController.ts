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

    try {
        const bookId = req.params.bookId;

        // We'll search whether book is present in database or not
        const book = await bookModel.findOne({ _id: bookId });

        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        // Check access whether author is updating his book only or not
        const _req = req as AuthRequest;

        if (book?.author.toString() !== _req.userId) {
            return next(createHttpError(403, "You cannot update book of others"));
        }

        // Check whether image field exists or not
        const files = req.files as { [fieldName: string]: Express.Multer.File[] };

        let completeCoverImage = "";
        if (files.coverImage) {
            const fileName = files.coverImage[0].filename;
            const coverMimeType = files.coverImage[0].mimetype.split('/').pop();

            // Send files to cloudinary
            const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);

            completeCoverImage = fileName;

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                filename_override: fileName,
                folder: "book-covers",
                format: coverMimeType
            });

            completeCoverImage = uploadResult.secure_url;
            await fs.promises.unlink(filePath);
        }

        // Check whether file field exists or not
        let completeFileName = "";
        if (files.file) {
            const bookFileName = files.file[0].filename;
            const bookFileMimeType = files.file[0].mimetype.split('/').pop();

            const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);
            completeFileName = bookFileName;

            const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: bookFileMimeType
            });

            completeFileName = uploadResultPdf.secure_url;

            await fs.promises.unlink(bookFilePath);
        }

        // Now update in Database
        const updatedBook = await bookModel.findOneAndUpdate(
            {
                _id: bookId
            },
            {
                title,
                genre,
                coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
                file: completeFileName ? completeFileName : book.file
            },
            {
                new: true
            }
        );

        res.status(200).json(updatedBook);
    } catch (error) {
        return next(createHttpError(500, "Failed to update the book"));
    }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Todo: Add pagination
        const book = await bookModel.find();

        res.status(200).json(book);
    } catch (error) {
        return next(createHttpError(500, "Failed to fetch the list of books"));
    }
};

const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;

    try {
        const book = await bookModel.findOne({ _id: bookId });
        
        if (!book) {
            return next(createHttpError(404, "Book not found by provided id"));
        }

        res.status(200).json(book);
    } catch (error) {
        return next(createHttpError(500, "Failed to fetch the single book by provided id"));
    }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;
    
    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
        return next(createHttpError(404, "Book not found by a particular Id"));
    }

    // Check access whether author is deleting his own book or not
    const _req = req as AuthRequest;

    if (book?.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You cannot delete some other person book."));
    }

    // After checking access we have to delete the files uploaded on cloudinary
    const coverImagePublicId = `${book.coverImage.split('/')[7]}/${book.coverImage.split('/')[8].split('.')[0]}`;
    
    const bookFilePublicId = `${book.file.split('/')[7]}/${book.file.split('/')[8]}`;

    try {
        
        try {
            await cloudinary.uploader.destroy(coverImagePublicId);

            await cloudinary.uploader.destroy(bookFilePublicId, { resource_type: "raw" });
        } catch (error) {
            return next(createHttpError(500, "Error while deleting files and images uploaded at cloudinary"));
        }

        await bookModel.deleteOne({ _id: bookId });

        res.sendStatus(204).json({ message: "Book deleted Successfully!" });
    } catch (error) {
        return next(createHttpError(500, "Failed to delete a book"));
    }
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };