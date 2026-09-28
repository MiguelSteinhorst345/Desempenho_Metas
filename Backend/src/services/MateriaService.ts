import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../config/dataBase'
import { Materia } from '../models/Materia'
import { CreateMateriasDTO } from '../dtos/CreateMateriasDTO'
import { UpdateMateriasDTO } from '../dtos/UpdateMateriasDTO'

export class MateriaService {
    async listar(usuarioId: number): Promise<Materia[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM materias WHERE usuario_id = ? ORDER BY id',
            [usuarioId]
        )
        return rows as Materia[]
    }

    async buscarPorId(id: number, usuarioId: number): Promise<Materia> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM materias WHERE id = ?',
            [id]
        )

        if (rows.length === 0) {
            throw new Error('Matéria não encontrada')
        }

        const materia = rows[0] as Materia

        // Não revela que a matéria existe caso seja de outro usuário
        if (materia.usuario_id !== usuarioId) {
            throw new Error('Matéria não encontrada')
        }

        return materia
    }

    async criar(usuarioId: number, data: CreateMateriasDTO): Promise<Materia> {
        if (!data.nome || data.nome.trim() === '') {
            throw new Error('O nome da matéria é obrigatório')
        }
        if (!data.descricao || data.descricao.trim() === '') {
            throw new Error('A descrição da matéria é obrigatória')
        }

        const professor = data.professor?.trim() || null

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO materias (usuario_id, nome, descricao, professor) VALUES (?, ?, ?, ?)`,
            [usuarioId, data.nome, data.descricao, professor]
        )

        return this.buscarPorId(result.insertId, usuarioId)
    }

    async atualizar(id: number, usuarioId: number, data: UpdateMateriasDTO): Promise<Materia> {
        const materiaAtual = await this.buscarPorId(id, usuarioId)

        const nome = data.nome ?? materiaAtual.nome
        const descricao = data.descricao ?? materiaAtual.descricao
        const professor = data.professor !== undefined ? (data.professor.trim() || null) : materiaAtual.professor

        if (nome.trim() === '') {
            throw new Error('O nome não pode ficar vazio')
        }
        if (descricao.trim() === '') {
            throw new Error('A descrição não pode ficar vazia')
        }

        await pool.query(
            `UPDATE materias SET nome = ?, descricao = ?, professor = ? WHERE id = ?`,
            [nome, descricao, professor, id]
        )

        return this.buscarPorId(id, usuarioId)
    }

    async excluir(id: number, usuarioId: number): Promise<void> {
        await this.buscarPorId(id, usuarioId)
        await pool.query('DELETE FROM materias WHERE id = ?', [id])
    }
}