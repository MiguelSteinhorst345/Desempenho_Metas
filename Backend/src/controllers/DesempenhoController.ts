import { Request, Response, NextFunction } from 'express'
import { DesempenhoService } from '../services/DesempenhoService'
export const desempenhoService = new DesempenhoService()
export class DesempenhoController {
    async resumo(req: Request,res: Response,next: NextFunction){try{res.status(200).json(await desempenhoService.resumo(req.user.id))}catch(e){next(e)}}
    async registrar(req: Request,res: Response,next: NextFunction){try{res.status(201).json(await desempenhoService.registrar(req.user.id,req.body))}catch(e){next(e)}}
}
