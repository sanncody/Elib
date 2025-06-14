import { config as conf } from 'dotenv';

conf();


// Use '_' to give private file names
const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
};

export const config = Object.freeze(_config); // TO make config file read only