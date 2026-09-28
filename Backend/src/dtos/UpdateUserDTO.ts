import { z } from "zod";

export const UpdateUserDTO = z.object({
    name: z.string().min(2, 'Nome muito curto').optional(),
    email: z.string().email('E-mail inválido').optional(),
    currentPassword: z.string().optional(),
    password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres').optional(),
})
.strict()
.refine((d) => !d.password || d.currentPassword, {
    message: 'Informe a senha atual para definir uma nova senha',
    path: ['currentPassword'],
});

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;