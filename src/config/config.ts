import { config as conf } from 'dotenv';

conf();


// Use '_' to give private file names
const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloud: process.env.CLOUDINARY_CLOUD,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
    frontendDomain: process.env.CLIENT_DOMAIN,
};

export const config = Object.freeze(_config); // TO make config file read only