import { NextFunction, Request, Response } from 'express'
import { CreateMetaDTO } from '../dtos/CreateMetaDTO'
import { UpdateMetaDTO } from '../dtos/UpdateMetaDTO'
import { MetaService } from '../services/MetaService'

const metaService = new MetaService()

export class MetaController {
    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const metas = await metaService.listar(req.user.id)
            res.status(200).json(metas)
        } catch (err) {
            next(err)
        }
    }

    resumo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resumo = await metaService.resumo(req.user.id)
            res.status(200).json(resumo)
        } catch (err) {
            next(err)
        }
    }

    buscarPorId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const meta = await metaService.buscarPorId(Number(req.params.id), req.user.id)
            res.status(200).json(meta)
        } catch (err) {
            next(err)
        }
    }

    criar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body as CreateMetaDTO
            const meta = await metaService.criar(req.user.id, data)
            res.status(201).json(meta)
        } catch (err) {
            next(err)
        }
    }

    atualizar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body as UpdateMetaDTO
            const meta = await metaService.atualizar(Number(req.params.id), req.user.id, data)
            res.status(200).json(meta)
        } catch (err) {
            next(err)
        }
    }

    excluir = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await metaService.excluir(Number(req.params.id), req.user.id)
            res.status(204).send()
        } catch (err) {
            next(err)
        }
    }
}
