import express, { Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import materiaRoutes from './routes/materiaRoutes'
import { errorHandler } from './middlewares/errorHandler'
import cronogramaRoutes from './routes/cronogramaRoutes'
import desempenhoRoutes from './routes/desempenhoRoutes'
import metaRoutes from './routes/metaRoutes'
import { desempenhoService } from './controllers/DesempenhoController'

const app: Application = express()
const PORT = Number(process.env.PORT || '3000')

// Configuração do CORS
app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rotas
app.use(authRoutes)
app.use('/users', userRoutes)
app.use(materiaRoutes)
app.use(cronogramaRoutes)
app.use(desempenhoRoutes)
app.use(metaRoutes)

// Tratamento de erros (sempre por último)
app.use(errorHandler)

async function iniciarServidor() {
    try {
        await desempenhoService.garantirTabela()
        app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`))
    } catch (error) {
        console.error('Falha ao preparar o desempenho:', error)
        process.exit(1)
    }
}
iniciarServidor()