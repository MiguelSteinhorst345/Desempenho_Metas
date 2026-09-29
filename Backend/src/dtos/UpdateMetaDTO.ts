import { MetaStatus, MetaTipo } from '../models/Meta'

export interface UpdateMetaDTO {
    titulo?: string
    tipo?: MetaTipo
    prazo?: string | null
    status?: MetaStatus
    principal?: boolean
}
