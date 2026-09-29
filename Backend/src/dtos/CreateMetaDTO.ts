import { MetaTipo } from '../models/Meta'

export interface CreateMetaDTO {
    titulo: string
    tipo?: MetaTipo
    prazo?: string | null
}
