import { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '../config/dataBase'
import { Meta, MetaStatus, MetaTipo } from '../models/Meta'
import { CreateMetaDTO } from '../dtos/CreateMetaDTO'
import { UpdateMetaDTO } from '../dtos/UpdateMetaDTO'

function normalizarPrazo(prazo: string | null | undefined): string | null {
    if (!prazo || prazo.trim() === '') return null
    if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo.trim())) {
        throw new Error('O prazo deve estar no formato AAAA-MM-DD')
    }
    return prazo.trim()
}

function validarTipo(tipo: string | undefined): MetaTipo {
    const valor = tipo || 'Meta semanal'
    if (!['Meta diária', 'Meta semanal', 'Meta mensal'].includes(valor)) {
        throw new Error('Tipo de meta inválido')
    }
    return valor as MetaTipo
}

function validarStatus(status: string | undefined): MetaStatus {
    const valor = status || 'nao_iniciada'
    if (!['nao_iniciada', 'andamento', 'concluida'].includes(valor)) {
        throw new Error('Status de meta inválido')
    }
    return valor as MetaStatus
}

export class MetaService {
    async listar(usuarioId: number): Promise<Meta[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, usuario_id, titulo, tipo, prazo, status, principal, criado_em, atualizado_em
             FROM metas
             WHERE usuario_id = ?
             ORDER BY principal DESC, id DESC`,
            [usuarioId]
        )
        return rows as Meta[]
    }

    async resumo(usuarioId: number) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                COUNT(*) AS total,
                COALESCE(SUM(status = 'andamento'), 0) AS andamento,
                COALESCE(SUM(status = 'concluida'), 0) AS concluida,
                COALESCE(SUM(status = 'nao_iniciada'), 0) AS nao_iniciada
             FROM metas
             WHERE usuario_id = ?`,
            [usuarioId]
        )
        return rows[0]
    }

    async buscarPorId(id: number, usuarioId: number): Promise<Meta> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, usuario_id, titulo, tipo, prazo, status, principal, criado_em, atualizado_em
             FROM metas
             WHERE id = ? AND usuario_id = ?`,
            [id, usuarioId]
        )
        if (rows.length === 0) throw new Error('Meta não encontrada')
        return rows[0] as Meta
    }

    async criar(usuarioId: number, data: CreateMetaDTO): Promise<Meta> {
        const titulo = String(data.titulo || '').trim()
        if (!titulo) throw new Error('O título da meta é obrigatório')
        const tipo = validarTipo(data.tipo)
        const prazo = normalizarPrazo(data.prazo)

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO metas (usuario_id, titulo, tipo, prazo)
             VALUES (?, ?, ?, ?)`,
            [usuarioId, titulo, tipo, prazo]
        )
        return this.buscarPorId(result.insertId, usuarioId)
    }

    async atualizar(id: number, usuarioId: number, data: UpdateMetaDTO): Promise<Meta> {
        const atual = await this.buscarPorId(id, usuarioId)
        const titulo = data.titulo !== undefined ? String(data.titulo).trim() : atual.titulo
        if (!titulo) throw new Error('O título da meta é obrigatório')

        const tipo = data.tipo !== undefined ? validarTipo(data.tipo) : atual.tipo
        const prazo = data.prazo !== undefined ? normalizarPrazo(data.prazo) : atual.prazo
        const status = data.status !== undefined ? validarStatus(data.status) : atual.status
        const principal = data.principal !== undefined ? Boolean(data.principal) : Boolean(atual.principal)

        if (principal) {
            await pool.query(
                `UPDATE metas SET principal = FALSE WHERE usuario_id = ? AND id <> ?`,
                [usuarioId, id]
            )
        }

        await pool.query(
            `UPDATE metas
             SET titulo = ?, tipo = ?, prazo = ?, status = ?, principal = ?
             WHERE id = ? AND usuario_id = ?`,
            [titulo, tipo, prazo, status, principal, id, usuarioId]
        )

        return this.buscarPorId(id, usuarioId)
    }

    async excluir(id: number, usuarioId: number): Promise<void> {
        await this.buscarPorId(id, usuarioId)
        await pool.query(
            `DELETE FROM metas WHERE id = ? AND usuario_id = ?`,
            [id, usuarioId]
        )
    }
}
