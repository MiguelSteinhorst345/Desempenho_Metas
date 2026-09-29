export interface JwtPayload {
    id: number
    role: 'admin' | 'user'
}

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload
        }
    }
}