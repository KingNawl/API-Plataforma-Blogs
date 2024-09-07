import mysql from 'mysql2/promise';
import {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
} from './config.js';

const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT
});

const connectDB = async () => {
    try {
        const conn = await connection;
        console.log('Conexión exitosa a la base de datos');
        return conn;
    } catch (error) {
        console.log('Error al conectar a la base de datos', error);
        throw error;
    }
}

export default connectDB;