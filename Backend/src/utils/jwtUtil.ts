import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/jwtTypes'
import { UnauthorizedError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado')
}

export function generateToken(payload: JwtPayload) {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: '1h' })
}

export function verifyToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, JWT_SECRET!) as JwtPayload
    } catch {
        throw new UnauthorizedError('Token inválido ou expirado')
    }
}