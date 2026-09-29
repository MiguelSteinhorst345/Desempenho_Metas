import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { LoginDTO } from "../dtos/LoginDTO";

export class AuthController {

    private readonly service: AuthService = new AuthService()

    async register(req: Request, res: Response): Promise<Response> {
        const data = CreateUserDTO.parse(req.body)

        const user = await this.service.register(data)

        return res.status(201).json({
            success: true,
            message: 'Cadastro realizado com sucesso',
            user: user
        })
    }

    async login(req: Request, res: Response): Promise<Response> {
        const data = LoginDTO.parse(req.body)

        const result = await this.service.login(data)

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60
        })

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            user: result.user
        })
    }

    async logoff(req: Request, res: Response): Promise<Response> {
        res.clearCookie('token')
        return res.status(200).json({
            success: true,
            message: 'Logoff realizado com sucesso'
        })
    }

    async me(req: Request, res: Response): Promise<Response> {
        const user = await this.service.me(req.user.id)

        return res.status(200).json({
            success: true,
            user
        })
    }

}