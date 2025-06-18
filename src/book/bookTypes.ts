import { User } from "../user/userTypes";

export interface Book {
    _id: string;
    title: string;
    author: User;
    genre: string;
    coverImage: string;  // File uploads (We have to add cloudinary URL over here for image)
    file: string; // Book File URL from cloudinary
    createdAt?: Date;
    updatedAt?: Date;
}