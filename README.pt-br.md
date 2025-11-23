# ⏱️ Hourlog – Backend (PT-BR)

O **Hourlog Backend** é a API responsável pelo gerenciamento de usuários, autenticação, projetos, tarefas, relatórios e rotinas automatizadas do sistema Hourlog – uma plataforma de controle de horas trabalhadas focada em produtividade e organização.

Este backend foi desenvolvido em **Node.js**, utilizando **Express**, **Prisma ORM**, **JWT**, e deploy automático via **Vercel**, incluindo execução de **cron jobs** para limpeza periódica de dados.

![License](https://img.shields.io/badge/License-Custom%20Restricted-red?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/evelynlacerda/hourlog-backend?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/evelynlacerda/hourlog-backend?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/evelynlacerda/hourlog-backend?style=for-the-badge)

> 🌎 Leia em outro idioma:  
> **[Read in English](./README.md)**

## 🚀 Tecnologias Utilizadas

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JWT](https://img.shields.io/badge/JSON%20Web%20Tokens-000000?style=for-the-badge&logo=jsonwebtokens)
![bcrypt](https://img.shields.io/badge/bcryptjs-3384C2?style=for-the-badge&logo=lock&logoColor=white)
![Date Fns](https://img.shields.io/badge/Date%20Fns-Included?style=for-the-badge&logo=date-fns&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-4A90E2?style=for-the-badge&logo=cloudflare&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Cron Jobs](https://img.shields.io/badge/Cron-Jobs-5A5A5A?style=for-the-badge&logo=clockify&logoColor=white)

## 📁 Estrutura do Projeto

```bash
hourlog-backend/
├── api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── routes/
├── utils/
│   ├── cleanup.js
│   └── helpers.js
├── index.js
├── app.js
├── vercel.json
└── README.md
```

## ⚙️ Instalação e Execução Local

### 1. Clonar o repositório

```bash
git clone https://github.com/evelynlacerda/hourlog-backend.git
cd hourlog-backend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta"
PROJECT_RETENTION_DAYS=15
RUN_CLEANUP_ON_BOOT=true
```

### 4. Rodar migrações

```bash
npx prisma migrate dev
```

### 5. Rodar o servidor

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3001`.

## 🔐 Autenticação

Use o header:

```bash
Authorization: Bearer <token>
```

## 📘 Principais Rotas

### Autenticação

- POST `/login`
- POST `/register`
- POST `/password/forgot`
- POST `/password/reset`

### Projetos

- GET `/projetos`
- POST `/projetos`
- PUT `/projetos/:id`
- DELETE `/projetos/:id`

### Tarefas

- GET `/tarefas`
- POST `/tarefas`
- PUT `/tarefas/:id`
- DELETE `/tarefas/:id`

### Relatórios

- GET `/relatorios/geral`

## 🧹 Rotina Automática (Cron)

A Vercel chama automaticamente o endpoint:

```bash
/api/cron
```

### Configuração no `vercel.json`

```bash
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 5 * * *"
    }
  ]
}
```

## 🚀 Deploy (Vercel)

Deploy automático via push na branch principal.

Acompanhe logs em:

```bash
Vercel → Project → Deployments → Logs
```
