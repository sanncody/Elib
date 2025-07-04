import mongoose from "mongoose";
import { User } from "./userTypes";

const userSchema = new mongoose.Schema<User>(
    {
        name: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            unique: true, required: true 
        },
        password: { 
            type: String, 
            required: true 
        },
    },
    {
        timestamps: true
    }
);

// Users collection
const userModel = mongoose.model<User>("User", userSchema);

export default userModel;