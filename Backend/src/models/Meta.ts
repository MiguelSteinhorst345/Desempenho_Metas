export type MetaTipo = 'Meta diária' | 'Meta semanal' | 'Meta mensal'
export type MetaStatus = 'nao_iniciada' | 'andamento' | 'concluida'

export interface Meta {
    id: number
    usuario_id: number
    titulo: string
    tipo: MetaTipo
    prazo: string | null
    status: MetaStatus
    principal: boolean
    criado_em: Date
    atualizado_em: Date
}
