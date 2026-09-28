import { User } from "../models/User";
import { AppDataSource } from "../config/dataSource";
import { UserMapper } from "../mappers/UserMapper";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { hashPassword, comparePassword } from "../utils/passwordUtil";

export class UserService {

    private readonly repo = AppDataSource.getRepository(User)

    async findAll(): Promise<Array<Partial<User>>> {
        const users = await this.repo.find()
        return users.map((user) => UserMapper.toResponse(user))
    }

    async getByUserId(id: number): Promise<Partial<User>> {
        const user = await this.repo.findOneBy({ id })

        if (!user) {
            throw new NotFoundError('Usuário não encontrado')
        }

        return user
    }

    async getByEmail(email: string): Promise<Partial<User>> {
        const user = await this.repo.findOneBy({ email })

        if (!user) {
            throw new NotFoundError('Usuário não encontrado')
        }

        return user
    }

    async UpdateUser(id: number, data: UpdateUserDTO, requireCurrentPassword = true): Promise<Partial<User>> {
        const user = await this.repo.findOneBy({ id })

        if (!user) {
            throw new NotFoundError('Usuário não encontrado')
        }

        const { currentPassword, password, ...rest } = data

        if (rest.email && rest.email !== user.email) {
            const emailEmUso = await this.repo.findOneBy({ email: rest.email })

            if (emailEmUso) {
                throw new ConflictError('Este email já está registrado')
            }
        }

        if (password) {
            if (requireCurrentPassword) {
                const senhaCorreta = await comparePassword(currentPassword!, user.password)

                if (!senhaCorreta) {
                    throw new BadRequestError('Senha atual incorreta')
                }
            }

            user.password = await hashPassword(password)
        }

        Object.assign(user, rest)

        const usuarioAtualizado = await this.repo.save(user)

        return UserMapper.toResponse(usuarioAtualizado)
    }

    async deleteUser(id: number): Promise<Partial<User>> {
        const user = await this.repo.findOneBy({ id })

        if (!user) {
            throw new NotFoundError('Usuário não encontrado')
        }

        const usuarioExcluido = await this.repo.remove(user)
        return UserMapper.toResponse(usuarioExcluido)
    }

    async promoveUser(id: number): Promise<Partial<User>> {
        const user = await this.repo.findOneBy({ id })

        if (!user) {
            throw new NotFoundError('Usuário não encontrado')
        }

        if (user.role === 'admin') {
            throw new BadRequestError('Usuário já é administrador')
        }

        user.role = 'admin'

        const usuarioPromovido = await this.repo.save(user)
        return UserMapper.toResponse(usuarioPromovido)
    }

}