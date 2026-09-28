// CreateCronogramaDTO.ts
export interface CreateCronogramaDTO {
    materia: string
    conteudo?: string
    data: string // formato aaaa-mm-dd, vindo do <input type="date">
}