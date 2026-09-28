import { Repository } from "typeorm";
import { User } from "../models/User";
import { AppDataSource } from "../config/dataSource";
import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors";
import { comparePassword, hashPassword } from "../utils/passwordUtil";
import { LoginDTO } from "../dtos/LoginDTO";
import { generateToken } from "../utils/jwtUtil";
import { UserMapper } from "../mappers/UserMapper";

export class AuthService {

    private readonly repo: Repository<User> = AppDataSource.getRepository(User)

    async register(data: CreateUserDTO): Promise<Partial<User>> {
        const emailInvalido = await this.repo.findOneBy({ email: data.email })

        if (emailInvalido) {
            throw new ConflictError('Este email já está registrado')
        }

        const user = await this.repo.create(data)
        user.password = await hashPassword(data.password)
        await this.repo.save(user)

        return UserMapper.toResponse(user)
    }

    async login(data: LoginDTO): Promise<{ token: string, user: Partial<User> }> {
        const user = await this.repo.findOneBy({ email: data.email })

        if (!user) {
            throw new UnauthorizedError('Credenciais inválidas')
        }

        const senhaValida = await comparePassword(data.password, user.password)

        if (!senhaValida) {
            throw new UnauthorizedError('Credenciais inválidas')
        }

        const token = generateToken({ id: user.id, role: user.role })

        return {
            token: token,
            user: UserMapper.toResponse(user)
        }
    }

    async me(id: number): Promise<Partial<User>> {
        const user = await this.repo.findOneBy({ id })

        if (!user) {
            throw new NotFoundError('Usuário não encontrado!')
        }

        return UserMapper.toResponse(user)
    }
}