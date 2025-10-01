import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.js';

// `process` it's a special JavaScript object that holds all the env
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

// Validate required environment variables
if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) {
    throw new Error('Missing database environment variables');
}

// TypeORM is the core connection manager with the database
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: Number(DB_PORT),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    // synchronize: true should be false in production
    synchronize: true, // Automatically creates database schema on every application launch
    logging: false, // Set to true to see SQL queries in the console
    entities: [User], // List of all your entity classes
    migrations: [],
    subscribers: [],
});