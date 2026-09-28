import { Request, Response, NextFunction } from 'express'
import { CronogramaService } from '../services/CronogramaService'
import { desempenhoService } from './DesempenhoController'

const cronogramaService = new CronogramaService()

export class CronogramaController {
    async listar(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user.id
            const cronogramas = await cronogramaService.listar(usuarioId)
            res.status(200).json(cronogramas)
        } catch (err) {
            next(err)
        }
    }

    async buscarPorId(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const usuarioId = req.user.id
            const cronograma = await cronogramaService.buscarPorId(id, usuarioId)
            res.status(200).json(cronograma)
        } catch (err) {
            next(err)
        }
    }

    async criar(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user.id
            const cronograma = await cronogramaService.criar(usuarioId, req.body)
            res.status(201).json(cronograma)
        } catch (err) {
            next(err)
        }
    }

    async atualizar(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const usuarioId = req.user.id
            const cronograma = await cronogramaService.atualizar(id, usuarioId, req.body)
            if (req.body.concluido === true && req.body.registrarDesempenho) {
                await desempenhoService.registrar(usuarioId, { cronograma_id:id, materia:cronograma.materia, acertos:req.body.acertos, erros:req.body.erros, minutos_estudados:req.body.minutos_estudados })
            }
            res.status(200).json(cronograma)
        } catch (err) {
            next(err)
        }
    }

    async excluir(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const usuarioId = req.user.id
            await cronogramaService.excluir(id, usuarioId)
            res.status(204).send()
        } catch (err) {
            next(err)
        }
    }
}