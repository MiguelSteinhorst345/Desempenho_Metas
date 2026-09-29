import 'reflect-metadata'
import dotenv from 'dotenv'
import { DataSource } from 'typeorm';

dotenv.config()

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env

export const AppDataSource = new DataSource({

    type: 'mysql',
    host: DB_HOST,
    port: Number(DB_PORT),
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    entities: [__dirname + '/../models/*.{js,ts}'],
    synchronize: true,
    logging: true,
    ssl: {
        rejectUnauthorized: false
    }
})

AppDataSource.initialize()
    .then(() => {
        console.log('Banco de dados conectado com sucesso')
    }).catch((error) => {
        console.error('Falha ao conectar com o banco de dados' + error)
    })