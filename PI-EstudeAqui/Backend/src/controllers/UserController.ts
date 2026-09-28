import { Request, Response } from "express"
import { UserService } from "../services/UserService"
import { IdParamDTO } from "../dtos/IdParamDTO";
import { EmailParamDTO } from "../dtos/EmailParamDTO";
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { ForbiddenError } from "../errors";

export class UserController {

    private readonly service: UserService = new UserService()

    async findAllUser(req: Request, res: Response) {
        const users = await this.service.findAll()

        return res.status(200).json({
            success: true,
            message: 'Usuários retornados com sucesso',
            users: users
        })
    }

    async getUserById(req: Request, res: Response) {
        const { id } = IdParamDTO.parse(req.params)

        const user = await this.service.getByUserId(id)

        return res.status(200).json({
            success: true,
            message: 'Usuário encontrado com sucesso',
            user: user
        })
    }

    async getUserByEmail(req: Request, res: Response) {
        const { email } = EmailParamDTO.parse(req.params)

        const user = await this.service.getByEmail(email)

        return res.status(200).json({
            success: true,
            message: 'Usuário encontrado com sucesso',
            user: user
        })
    }

    async promove(req: Request, res: Response) {
        const { id } = IdParamDTO.parse(req.params)

        const user = await this.service.promoveUser(id)

        return res.status(200).json({
            success: true,
            message: 'Usuário promovido com sucesso',
            user: user
        })
    }

    async updateUser(req: Request, res: Response) {
        const { id } = IdParamDTO.parse(req.params)
        const data = UpdateUserDTO.parse(req.body)

        const loggedUser = req.user

        if (loggedUser.role !== 'admin' && loggedUser.id !== id) {
            throw new ForbiddenError('Acesso negado')
        }

        // só dispensa a senha atual se for admin editando OUTRA pessoa
        const requireCurrentPassword = loggedUser.id === id

        const user = await this.service.UpdateUser(id, data, requireCurrentPassword)

        return res.status(200).json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            user: user
        })
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = IdParamDTO.parse(req.params)

        const loggedUser = req.user

        if (loggedUser.role !== 'admin' && loggedUser.id !== id) {
            throw new ForbiddenError('Acesso negado')
        }

        const user = await this.service.deleteUser(id)

        return res.status(200).json({
            success: true,
            message: 'Usuário excluído com sucesso',
            user: user
        })
    }

}