import z from 'zod'

export const IdParamDTO = z.object({
    id: z.coerce.number()
        .int('Id precisa ser um número inteiro')
        .positive('Id precisa ser um número positivo')
})