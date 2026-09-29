import z from 'zod'

// Será usado para validar nossas requests
export const CreateUserDTO = z.object({
    name: z.string()
        .min(3, 'Nome deve conter pelo menos 3 caracteres')
        .max(100, 'Nome deve conter no máximo 100 caracteres'),
    email: z.email('E-mail inválido'),
    password: z.string()
        .min(6, 'Senha deve conter pelo menos 6 caracteres')
        .regex(/^(?=.*[A-Z])/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/^(?=.*[a-z])/, 'Senha deve conter pelo menos uma letra minúscula')
        .regex(/^(?=.*[0-9])/, 'Senha deve conter pelo menos um número')
})

//Será usado para tiapgem dos dados recebidos na camada service
export type CreateUserDTO = z.infer<typeof CreateUserDTO>