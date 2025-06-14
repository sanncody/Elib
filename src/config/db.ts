import mongoose from 'mongoose';
import { config } from './config';

const connectDB = async () => {
    try {
        // When mongoose connects to DB, then it emits some events (Like this event got triggered once mongodb connection got established)
        mongoose.connection.on('connected', () => {
            console.log("Connected to Database successfully✅");
        });

        mongoose.connection.on('error', (err) => {
            console.log("Error connecting to Database❌", err);
        });
        
        await mongoose.connect(config.databaseUrl as string);

    } catch (error) {
        console.error("Failed to connect to Database", error);
        process.exit(1);
    }
};

export default connectDB;