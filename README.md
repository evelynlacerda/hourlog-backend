# Hourlog – Backend

The **Hourlog Backend** is the API responsible for authentication, users, projects, tasks, reports, and automated cleanup routines.

Built using **Node.js**, **Express**, **Prisma ORM**, **JWT**, and deployed on **Vercel** with automatic **cron jobs**.

![License](https://img.shields.io/badge/License-Custom%20Restricted-red?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/evelynlacerda/hourlog-backend?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/evelynlacerda/hourlog-backend?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/evelynlacerda/hourlog-backend?style=for-the-badge)

> 🌎 Read this in other languages:  
> **[Português (Brasil)](./README.pt-br.md)**

## Technologies

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

## Project Structure

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

## Installation & Local Setup

```bash
git clone https://github.com/evelynlacerda/hourlog-backend.git
cd hourlog-backend
npm install
```

Create `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key"
PROJECT_RETENTION_DAYS=15
RUN_CLEANUP_ON_BOOT=true
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

## Authentication

Use header:

```bash
Authorization: Bearer <token>
```

## Main Endpoints

### Auth

- POST `/login`
- POST `/register`
- POST `/password/forgot`
- POST `/password/reset`

### Projects

- GET `/projetos`
- POST `/projetos`
- PUT `/projetos/:id`
- DELETE `/projetos/:id`

### Tasks

- GET `/tarefas`
- POST `/tarefas`
- PUT `/tarefas/:id`
- DELETE `/tarefas/:id`

### Reports

- GET `/relatorios/geral`

## Scheduled Cleanup (Cron)

Endpoint called daily by Vercel:

```bash
/api/cron
```

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 5 * * *"
    }
  ]
}
```

## Deployment

Auto deploy through Vercel.
