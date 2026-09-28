import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../config/dataBase'
import { BadRequestError, NotFoundError } from '../errors'

export interface CriarDesempenhoDTO { cronograma_id?: number; materia: string; acertos?: number; erros?: number; minutos_estudados?: number }

export class DesempenhoService {
    async garantirTabela() {
        await pool.query(`CREATE TABLE IF NOT EXISTS desempenhos (
            id INT NOT NULL AUTO_INCREMENT, usuario_id INT NOT NULL, cronograma_id INT NULL,
            materia VARCHAR(150) NOT NULL, acertos INT NOT NULL DEFAULT 0, erros INT NOT NULL DEFAULT 0,
            minutos_estudados INT NOT NULL DEFAULT 0, criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id), INDEX idx_desempenho_usuario (usuario_id), INDEX idx_desempenho_data (usuario_id, criado_em)
        ) ENGINE=InnoDB`)
    }

    async registrar(usuarioId: number, data: CriarDesempenhoDTO) {
        const materia = data.materia?.trim()
        const acertos = Number(data.acertos ?? 0), erros = Number(data.erros ?? 0), minutos = Number(data.minutos_estudados ?? 0)
        if (!materia) throw new BadRequestError('A matéria é obrigatória')
        if (!Number.isInteger(acertos) || acertos < 0) throw new BadRequestError('Acertos inválidos')
        if (!Number.isInteger(erros) || erros < 0) throw new BadRequestError('Erros inválidos')
        if (!Number.isInteger(minutos) || minutos < 0) throw new BadRequestError('Tempo estudado inválido')
        if (data.cronograma_id) {
            const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM cronogramas WHERE id = ? AND usuario_id = ?', [data.cronograma_id, usuarioId])
            if (!rows.length) throw new NotFoundError('Cronograma não encontrado')
        }
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO desempenhos (usuario_id, cronograma_id, materia, acertos, erros, minutos_estudados) VALUES (?, ?, ?, ?, ?, ?)`,
            [usuarioId, data.cronograma_id ?? null, materia, acertos, erros, minutos])
        return { id: result.insertId, materia, acertos, erros, minutos_estudados: minutos }
    }

    async resumo(usuarioId: number) {
        const [geralRows] = await pool.query<RowDataPacket[]>(`SELECT COALESCE(SUM(acertos),0) acertos, COALESCE(SUM(erros),0) erros,
            COALESCE(SUM(CASE WHEN criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN minutos_estudados ELSE 0 END),0) minutos_semana
            FROM desempenhos WHERE usuario_id = ?`, [usuarioId])
        const geral = geralRows[0] || { acertos: 0, erros: 0, minutos_semana: 0 }
        const total = Number(geral.acertos) + Number(geral.erros)

        const [dias] = await pool.query<RowDataPacket[]>(`SELECT DATE(criado_em) dia, COALESCE(SUM(minutos_estudados),0) minutos
            FROM desempenhos WHERE usuario_id = ? AND criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(criado_em) ORDER BY dia`, [usuarioId])
        const [materias] = await pool.query<RowDataPacket[]>(`SELECT materia, COALESCE(SUM(acertos),0) acertos, COALESCE(SUM(erros),0) erros,
            COALESCE(SUM(minutos_estudados),0) minutos FROM desempenhos WHERE usuario_id = ? GROUP BY materia`, [usuarioId])
        const [cronogramas] = await pool.query<RowDataPacket[]>(`SELECT materia, COUNT(*) total,
            SUM(CASE WHEN concluido=true THEN 1 ELSE 0 END) concluidas FROM cronogramas WHERE usuario_id=? GROUP BY materia`, [usuarioId])

        const mapa = new Map(cronogramas.map(x => [String(x.materia).trim().toLowerCase(), x]))
        const nomes = new Set<string>([...materias.map(x => String(x.materia)), ...cronogramas.map(x => String(x.materia))])
        const porMateria = Array.from(nomes).sort((a,b)=>a.localeCompare(b,'pt-BR')).map(nome => {
            const r = materias.find(x => String(x.materia) === nome) || {acertos:0, erros:0, minutos:0}
            const c = mapa.get(nome.trim().toLowerCase())
            const a=Number(r.acertos), e=Number(r.erros), q=a+e
            return { materia:nome, percentual:q ? Math.round(a/q*100) : 0, acertos:a, erros:e,
                atividades:Number(c?.concluidas ?? 0), atividades_total:Number(c?.total ?? 0), minutos:Number(r.minutos) }
        })

        const hoje = new Date(); hoje.setHours(0,0,0,0)
        const diasSemana = Array.from({length:7},(_,i)=>{
            const d=new Date(hoje); d.setDate(hoje.getDate()-(6-i)); const chave=d.toISOString().slice(0,10)
            const x=dias.find(v=>String(v.dia).slice(0,10)===chave)
            return {data:chave,minutos:Number(x?.minutos ?? 0),label:d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')}
        })
        return { horas_semana:Number(geral.minutos_semana)/60, acertos:Number(geral.acertos), erros:Number(geral.erros),
            taxa_acertos:total?Math.round(Number(geral.acertos)/total*100):0, taxa_erros:total?Math.round(Number(geral.erros)/total*100):0,
            dias:diasSemana, materias:porMateria }
    }
}
