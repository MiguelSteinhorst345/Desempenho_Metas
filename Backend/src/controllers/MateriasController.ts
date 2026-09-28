import { Request, Response, NextFunction } from 'express'
import { MateriaService } from '../services/MateriaService'

const materiaService = new MateriaService()

export class MateriaController {
    async listar(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user.id
            const materias = await materiaService.listar(usuarioId)
            res.status(200).json(materias)
        } catch (err) {
            next(err)
        }
    }

    async buscarPorId(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const usuarioId = req.user.id
            const materia = await materiaService.buscarPorId(id, usuarioId)
            res.status(200).json(materia)
        } catch (err) {
            next(err)
        }
    }

    async criar(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user.id
            const materia = await materiaService.criar(usuarioId, req.body)
            res.status(201).json(materia)
        } catch (err) {
            next(err)
        }
    }

    async atualizar(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const usuarioId = req.user.id
            const materia = await materiaService.atualizar(id, usuarioId, req.body)
            res.status(200).json(materia)
        } catch (err) {
            next(err)
        }
    }

    async excluir(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const usuarioId = req.user.id
            await materiaService.excluir(id, usuarioId)
            res.status(204).send()
        } catch (err) {
            next(err)
        }
    }
}