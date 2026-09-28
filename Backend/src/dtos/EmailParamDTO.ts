import z from 'zod'

export const EmailParamDTO = z.object({
    email: z.email('E-mail inválido')
})