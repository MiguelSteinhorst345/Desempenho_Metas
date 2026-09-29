export interface Materia {
    id: number
    usuario_id: number | null
    nome: string
    descricao: string
    professor: string | null
    criado_em: Date
    atualizado_em: Date
}