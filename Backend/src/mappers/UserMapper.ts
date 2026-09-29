import { email } from "zod";
import { User } from "../models/User";

export class UserMapper {
    static toResponse(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }
}