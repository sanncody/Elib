import mongoose from "mongoose";
import { IUser } from "./userTypes";

const userSchema = new mongoose.Schema<IUser>(
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
const userModel = mongoose.model<IUser>("User", userSchema);

export default userModel;