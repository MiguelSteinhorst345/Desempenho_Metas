import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../config/dataBase'
import { Cronograma } from '../models/Cronograma'
import { CreateCronogramaDTO } from '../dtos/CreateCronograma'
import { UpdateCronogramaDTO } from '../dtos/UpdateCronogramaDTO'
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors'

export type Prioridade = 'alta' | 'media' | 'baixa'

export interface CronogramaComPrioridade extends Cronograma {
    prioridade: Prioridade
}

// alta: vence em até 3 dias (ou já venceu)
// média: vence entre 4 e 7 dias
// baixa: vence em mais de 7 dias
function calcularPrioridade(data: Date): Prioridade {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const dataAlvo = new Date(data)
    dataAlvo.setHours(0, 0, 0, 0)

    const diffDias = Math.ceil((dataAlvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDias <= 3) return 'alta'
    if (diffDias <= 7) return 'media'
    return 'baixa'
}

export class CronogramaService {
    async listar(usuarioId: number): Promise<CronogramaComPrioridade[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM cronogramas WHERE usuario_id = ? AND concluido = false ORDER BY data ASC',
            [usuarioId]
        )

        return (rows as Cronograma[]).map((item) => ({
            ...item,
            prioridade: calcularPrioridade(item.data)
        }))
    }

    async buscarPorId(id: number, usuarioId: number): Promise<CronogramaComPrioridade> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM cronogramas WHERE id = ?',
            [id]
        )

        if (rows.length === 0) {
            throw new NotFoundError('Cronograma não encontrado')
        }

        const cronograma = rows[0] as Cronograma

        if (cronograma.usuario_id !== usuarioId) {
            throw new ForbiddenError('Você não tem permissão para acessar este cronograma')
        }

        return { ...cronograma, prioridade: calcularPrioridade(cronograma.data) }
    }

    async criar(usuarioId: number, data: CreateCronogramaDTO): Promise<CronogramaComPrioridade> {
        if (!data.materia || data.materia.trim() === '') {
            throw new BadRequestError('A matéria é obrigatória')
        }
        if (!data.data) {
            throw new BadRequestError('A data é obrigatória')
        }

        const conteudo = data.conteudo?.trim() || null

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO cronogramas (usuario_id, materia, conteudo, data) VALUES (?, ?, ?, ?)`,
            [usuarioId, data.materia.trim(), conteudo, data.data]
        )

        return this.buscarPorId(result.insertId, usuarioId)
    }

    async atualizar(id: number, usuarioId: number, data: UpdateCronogramaDTO): Promise<CronogramaComPrioridade> {
        const atual = await this.buscarPorId(id, usuarioId)

        const materia = data.materia ?? atual.materia
        const conteudo = data.conteudo !== undefined ? (data.conteudo.trim() || null) : atual.conteudo
        const novaData = data.data ?? atual.data
        const concluido = data.concluido ?? atual.concluido

        if (materia.trim() === '') {
            throw new BadRequestError('A matéria não pode ficar vazia')
        }

        await pool.query(
            `UPDATE cronogramas SET materia = ?, conteudo = ?, data = ?, concluido = ? WHERE id = ?`,
            [materia, conteudo, novaData, concluido, id]
        )

        return this.buscarPorId(id, usuarioId)
    }

    async excluir(id: number, usuarioId: number): Promise<void> {
        await this.buscarPorId(id, usuarioId)
        await pool.query('DELETE FROM cronogramas WHERE id = ?', [id])
    }
}