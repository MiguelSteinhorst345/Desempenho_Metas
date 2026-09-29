export interface Cronograma {
    id: number
    usuario_id: number
    materia: string
    conteudo: string | null
    data: Date
    concluido: boolean
    criado_em: Date
    atualizado_em: Date
}