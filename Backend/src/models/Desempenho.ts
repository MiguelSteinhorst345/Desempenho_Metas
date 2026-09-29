export interface Desempenho {
    id: number
    usuario_id: number
    cronograma_id: number | null
    materia: string
    acertos: number
    erros: number
    minutos_estudados: number
    criado_em: Date
}