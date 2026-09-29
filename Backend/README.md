# 🎓 Guia Completo: Backend com TypeScript, Zod, Cookies e Middlewares

Um tutorial passo a passo para entender a arquitetura de um backend profissional em Node.js.

---

## 📋 Índice

1. [Instalação e Configuração](#instala%C3%A7%C3%A3o-e-configura%C3%A7%C3%A3o)

1. [Configurando TypeScript](#configurando-typescript)

1. [DTOs com Zod](#dtos-com-zod)

1. [Cookies HTTP-Only](#cookies-http-only)

1. [Mappers](#mappers)

1. [Middlewares](#middlewares)

1. [Error Handler Global](#error-handler-global)

---

## 🚀 Instalação e Configuração

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18+)

- **npm** ou **pnpm**

- **MySQL** ou **MariaDB**

- **Visual Studio Code**

### Criando o projeto

```bash
# Criar pasta do projeto
mkdir backend-api
cd backend-api

# Inicializar npm
npm init -y

# Instalar dependências de produção
npm install dotenv mysql2 typeorm reflect-metadata zod
npm install express cors cookie-parser bcryptjs jsonwebtoken

# Instalar dependências de desenvolvimento
npm install -D typescript@5.9.3 ts-node @types/node @types/express @types/cors @types/cookie-parser @types/bcryptjs @types/jsonwebtoken
```

### Explicação das dependências

| Pacote | O que faz |
| --- | --- |
| **express** | Framework para criar APIs REST |
| **cors** | Permite requisições de outros domínios |
| **cookie-parser** | Lê cookies enviados pelo navegador |
| **zod** | Valida dados (DTOs) |
| **bcryptjs** | Criptografa senhas |
| **jsonwebtoken** | Cria e valida tokens JWT |
| **typeorm** | ORM para banco de dados |
| **mysql2** | Driver para conectar ao MySQL |
| **dotenv** | Carrega variáveis de ambiente |

---

## ⚙️ Configurando TypeScript

### Criar `tsconfig.json`

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "nodenext",
    "target": "esnext",
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true,
    "strictPropertyInitialization": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### O que cada opção significa?

| Opção | Significado |
| --- | --- |
| `rootDir` | Pasta onde ficam os arquivos `.ts` |
| `outDir` | Pasta onde os arquivos compilados vão |
| `strict` | Ativa todas as verificações de tipo |
| `experimentalDecorators` | Permite usar decorators do TypeORM |
| `emitDecoratorMetadata` | Necessário para TypeORM funcionar |

### Criar `.env`

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_DATABASE=backend
JWT_SECRET=sua_chave_secreta_aqui
```

### Adicionar scripts no `package.json`

```json
"scripts": {
  "dev": "ts-node src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

### Executar o projeto

```bash
# Modo desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar versão compilada
npm start
```

---

## 📝 DTOs com Zod

### O que é DTO?

**DTO** = **Data Transfer Object**

É um objeto que **valida e padroniza** os dados que chegam do cliente. Pense nele como um "guarda de segurança" que verifica se os dados têm o formato correto antes de processar.

### Por que usar DTO?

✅ Valida dados automaticamente✅ Garante que os dados têm o tipo correto✅ Fornece mensagens de erro claras✅ Padroniza a API

### Exemplo: CreateUserDTO

```typescript
// src/dtos/CreateUserDTO.ts
import z from 'zod'

// Define as regras de validação
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

// Cria um tipo TypeScript baseado no schema
export type CreateUserDTO = z.infer<typeof CreateUserDTO>
```

### Como funciona?

```typescript
// src/controllers/AuthController.ts
import { CreateUserDTO } from "../dtos/CreateUserDTO"

export class AuthController {
    async register(req: Request, res: Response) {
        // ✅ Valida os dados
        // ❌ Se inválido, lança erro automaticamente
        const data = CreateUserDTO.parse(req.body)
        
        // Agora sabemos que 'data' tem os tipos corretos
        console.log(data.name)    // string
        console.log(data.email)   // string
        console.log(data.password) // string
        
        // Continuar o processamento...
    }
}
```

### Exemplo de requisição

```bash
# ✅ Válido
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "Senha123"
  }'

# ❌ Inválido - falta maiúscula na senha
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'
# Retorna erro: "Senha deve conter pelo menos uma letra maiúscula"
```

### Outros DTOs

```typescript
// src/dtos/LoginDTO.ts
export const LoginDTO = z.object({
    email: z.email('E-mail inválido' ),
    password: z.string().min(6, 'Senha inválida')
})

export type LoginDTO = z.infer<typeof LoginDTO>
```

```typescript
// src/dtos/UpdateUserDTO.ts
// Reutiliza o CreateUserDTO, mas torna todos os campos opcionais
export const UpdateUserDTO = CreateUserDTO.partial()

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>
```

---

## 🍪 Cookies HTTP-Only

### O que é um Cookie?

Um **cookie** é um pequeno arquivo armazenado no navegador que é enviado automaticamente em cada requisição.

### Por que usar Cookies para autenticação?

✅ Armazenado automaticamente no navegador✅ Enviado automaticamente em cada requisição✅ Pode ser marcado como `httpOnly` (não acessível via JavaScript )✅ Mais seguro que armazenar token em localStorage

### Fluxo de autenticação com Cookies

```
1. Cliente faz login
   ↓
2. Servidor valida credenciais
   ↓
3. Servidor cria um JWT e envia no cookie
   ↓
4. Navegador armazena o cookie automaticamente
   ↓
5. Próximas requisições enviam o cookie automaticamente
```

### Exemplo: Salvando um Cookie

```typescript
// src/controllers/AuthController.ts
async login(req: Request, res: Response) {
    const data = LoginDTO.parse(req.body)
    const result = await this.service.login(data)
    
    // Salvar token no cookie
    res.cookie('token', result.token, {
        httpOnly: true,      // ✅ Não acessível via JavaScript
        secure: false,       // ❌ false em desenvolvimento, true em produção
        sameSite: 'lax',     // ✅ Proteção contra CSRF
        maxAge: 1000 * 60 * 60  // ✅ Expira em 1 hora
    } )
    
    return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        user: result.user
    })
}
```

### Explicação das opções

| Opção | O que faz |
| --- | --- |
| `httpOnly` | Impede acesso via JavaScript (mais seguro ) |
| `secure` | Só envia em HTTPS (true em produção) |
| `sameSite` | Proteção contra ataques CSRF |
| `maxAge` | Tempo de expiração em milissegundos |

### Exemplo: Limpando um Cookie (Logout)

```typescript
async logoff(req: Request, res: Response) {
    res.clearCookie('token')
    
    return res.status(200).json({
        success: true,
        message: 'Logoff realizado com sucesso'
    })
}
```

### No Frontend

O navegador envia o cookie automaticamente:

```javascript
// Não precisa fazer nada especial!
// O cookie é enviado automaticamente

fetch('http://localhost:3000/me', {
    method: 'GET',
    credentials: 'include'  // ✅ Importante: permite enviar cookies
} )
```

---

## 🗺️ Mappers

### O que é um Mapper?

Um **Mapper** é uma classe que **transforma dados** de um formato para outro. Geralmente usado para:

- Remover campos sensíveis (como senha)

- Formatar dados para o cliente

- Converter entre diferentes estruturas

### Por que usar Mapper?

✅ Nunca expor dados sensíveis (senha, tokens)✅ Padronizar respostas da API✅ Reutilizar lógica de transformação

### Exemplo: UserMapper

```typescript
// src/mappers/UserMapper.ts
import { User } from "../models/User"

export class UserMapper {
    static toResponse(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
            // ❌ Nunca incluir: password, createdAt, updatedAt
        }
    }
}
```

### Como usar

```typescript
// src/services/AuthService.ts
import { UserMapper } from "../mappers/UserMapper"

export class AuthService {
    async register(data: CreateUserDTO) {
        // ... criar usuário no banco ...
        
        const user = await this.userRepository.save(newUser)
        
        // ✅ Transformar antes de enviar ao cliente
        return UserMapper.toResponse(user)
    }
}
```

### Fluxo completo

```
Banco de Dados
    ↓ (User com senha)
Repository
    ↓
Service
    ↓
Mapper (remove senha) ← Aqui!
    ↓ (User sem senha)
Controller
    ↓
Cliente
```

### Exemplo de resposta

```json
// ✅ Correto (com Mapper)
{
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "user"
}

// ❌ Errado (sem Mapper)
{
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "hashedPassword123...",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 🛡️ Middlewares

### O que é um Middleware?

Um **middleware** é uma função que executa **antes** da requisição chegar ao controller. Pense como um "filtro" ou "guarda".

```
Requisição
    ↓
Middleware 1 ← Aqui!
    ↓
Middleware 2 ← Aqui!
    ↓
Controller
    ↓
Resposta
```

### Tipos de Middleware

1. **Auth Middleware** - Verifica se o usuário está autenticado

1. **Admin Middleware** - Verifica se o usuário é admin

1. **Error Handler** - Captura erros

1. **Validação** - Valida dados

---

### 🔐 Auth Middleware

**Responsabilidade**: Verificar se o usuário está autenticado

```typescript
// src/middlewares/authMiddleware.ts
import { NextFunction, Request, Response } from "express"
import { UnauthorizedError } from "../errors"
import { verifyToken } from "../utils/jwtUtil"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // 1️⃣ Pegar o token do cookie
    const token = req.cookies.token
    
    // 2️⃣ Verificar se existe
    if (!token) {
        throw new UnauthorizedError('Token não informado')
    }
    
    // 3️⃣ Validar o token
    req.user = verifyToken(token)
    
    // 4️⃣ Passar para o próximo middleware/controller
    return next()
}
```

### Como usar

```typescript
// src/routes/userRoutes.ts
import { authMiddleware } from "../middlewares/authMiddleware"

router.get('/', authMiddleware, controller.findAllUser.bind(controller))
//                 ↑ Middleware aqui
```

### Fluxo

```
1. Cliente envia requisição com cookie
   ↓
2. authMiddleware lê o cookie
   ↓
3. Valida o JWT
   ↓
4. Se válido: req.user = { id, role }
   ↓
5. Controller recebe req.user preenchido
```

---

### 👑 Admin Middleware

**Responsabilidade**: Verificar se o usuário é administrador

```typescript
// src/middlewares/adminMiddleware.ts
import { NextFunction, Request, Response } from "express"
import { ForbiddenError } from "../errors"

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    // 1️⃣ Pegar o usuário (já foi validado pelo authMiddleware)
    const user = req.user
    
    // 2️⃣ Verificar se é admin
    if (user.role !== 'admin') {
        throw new ForbiddenError('Acesso Negado')
    }
    
    // 3️⃣ Se for admin, continuar
    return next()
}
```

### Como usar

```typescript
// src/routes/userRoutes.ts
import { authMiddleware } from "../middlewares/authMiddleware"
import { adminMiddleware } from "../middlewares/adminMiddleware"

// ✅ Apenas admins podem acessar
router.get('/:id', authMiddleware, adminMiddleware, controller.getUserById.bind(controller))
//                 ↑ Primeiro valida autenticação
//                                ↑ Depois valida se é admin
```

### Fluxo

```
1. Cliente envia requisição
   ↓
2. authMiddleware valida token
   ↓
3. adminMiddleware verifica role
   ↓
4. Se role === 'admin': continua
   ↓
5. Se role !== 'admin': retorna erro 403
```

### Exemplo de erro

```json
// ❌ Usuário comum tentando acessar rota de admin
{
    "success": false,
    "message": "Acesso Negado"
}
// Status: 403 Forbidden
```

---

## ⚠️ Error Handler Global

### O que é?

Um **error handler** é um middleware especial que **captura todos os erros** da aplicação e retorna respostas padronizadas.

### Por que usar?

✅ Erros padronizados✅ Não expor detalhes internos✅ Facilita debug✅ Melhor experiência do cliente

### Estrutura de Erros Customizados

```typescript
// src/errors/index.ts
export abstract class AppError extends Error {
    constructor(message: string, readonly statusCode: number) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 400)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Not Found') {
        super(message, 404)
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409)
    }
}
```

### O Error Handler

```typescript
// src/middlewares/errorHandler.ts
import { NextFunction, Request, Response } from "express"
import { AppError } from "../errors"
import { ZodError } from "zod"

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
    
    // 1️⃣ Erros customizados (AppError)
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }
    
    // 2️⃣ Erros de validação (Zod)
    if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {}
        
        error.issues.forEach(issue => {
            const field = issue.path.join('.')
            if (!errors[field]) {
                errors[field] = []
            }
            errors[field].push(issue.message)
        })
        
        return res.status(400).json({
            success: false,
            message: 'Erro de Validação',
            errors
        })
    }
    
    // 3️⃣ Erros desconhecidos
    console.error(error)
    
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
}
```

### Como registrar o Error Handler

```typescript
// src/server.ts
import express from 'express'
import { errorHandler } from './middlewares/errorHandler'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rotas aqui...
app.use(authRoutes)
app.use(userRoutes)

// ✅ Error handler SEMPRE por último!
app.use(errorHandler)

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})
```

### Exemplos de Respostas

#### ✅ Erro de Validação (Zod)

```json
{
    "success": false,
    "message": "Erro de Validação",
    "errors": {
        "email": ["E-mail inválido"],
        "password": [
            "Senha deve conter pelo menos uma letra maiúscula",
            "Senha deve conter pelo menos um número"
        ]
    }
}
// Status: 400 Bad Request
```

#### ✅ Erro Customizado (AppError)

```json
{
    "success": false,
    "message": "Este email já está registrado"
}
// Status: 409 Conflict
```

#### ✅ Erro Desconhecido

```json
{
    "success": false,
    "message": "Internal Server Error"
}
// Status: 500 Internal Server Error
```

### Como usar nos Services

```typescript
// src/services/AuthService.ts
import { ConflictError, UnauthorizedError } from "../errors"

export class AuthService {
    async login(data: LoginDTO) {
        const user = await this.userRepository.findOneBy({ email: data.email })
        
        if (!user) {
            throw new UnauthorizedError('Credenciais inválidas')
        }
        
        // ... validar senha ...
    }
    
    async register(data: CreateUserDTO) {
        const userExists = await this.userRepository.findOneBy({ email: data.email })
        
        if (userExists) {
            throw new ConflictError('Este email já está registrado')
        }
        
        // ... criar usuário ...
    }
}
```

---

## 📊 Fluxo Completo de uma Requisição

```
Cliente envia: POST /register
    ↓
Express recebe
    ↓
Middleware: errorHandler (wraps tudo)
    ↓
Route: /register
    ↓
Controller.register()
    ↓
CreateUserDTO.parse(req.body) ← Valida com Zod
    ↓
Se inválido: ZodError → errorHandler → Resposta com erro
Se válido: Continua
    ↓
Service.register(data)
    ↓
Repository.save(user) ← Salva no banco
    ↓
UserMapper.toResponse(user) ← Remove campos sensíveis
    ↓
res.json({ user }) ← Envia resposta
    ↓
Cliente recebe resposta
```

---

## 🎯 Resumo

| Conceito | O que faz |
| --- | --- |
| **DTO** | Valida e padroniza dados de entrada |
| **Cookie** | Armazena token de autenticação no navegador |
| **Mapper** | Transforma dados antes de enviar ao cliente |
| **Auth Middleware** | Verifica se o usuário está autenticado |
| **Admin Middleware** | Verifica se o usuário é administrador |
| **Error Handler** | Captura e padroniza erros |

---

## 🚀 Próximos Passos

1. Clone o projeto de exemplo

1. Execute `npm install`

1. Configure o `.env`

1. Execute `npm run dev`

1. Teste os endpoints com Thunder Client, Postman ou Insomnia
