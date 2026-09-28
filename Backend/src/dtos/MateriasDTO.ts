export interface MateriasDTO {
    nome: string
    descricao: string
    prioridade?: 'baixa' | 'media' | 'alta'
}