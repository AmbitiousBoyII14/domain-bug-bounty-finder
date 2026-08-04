# 🔒 Domain Bug Bounty Finder

A production-ready full-stack web application for security researchers to collect and organize publicly available information about domains participating in bug bounty programs.

> **⚠️ Important**: This tool is for legitimate security research and bug bounty reconnaissance only. It collects publicly available information and does NOT perform exploitation or vulnerability attacks.

## 🏗️ Tech Stack

**Frontend**: TypeScript, React 18, Vite, Tailwind CSS, TanStack Query, React Router, Framer Motion, Recharts, Zustand
**Backend**: Node.js, Express, Prisma ORM, PostgreSQL, Redis, BullMQ, JWT, Swagger
**DevOps**: Docker, Docker Compose, Nginx

## 🚀 Quick Start

```bash
git clone https://github.com/AmbitiousBoyII14/domain-bug-bounty-finder.git
cd domain-bug-bounty-finder
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
cp .env.example backend/.env
docker-compose up -d postgres redis
cd backend && npx prisma migrate dev && npx prisma db seed && cd ..
npm run dev
```

Frontend: http://localhost:5173 | API: http://localhost:4000 | Docs: http://localhost:4000/api/docs

## 🔐 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@domainfinder.io | admin123! |
| User | demo@domainfinder.io | demo123! |

## 📡 API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/targets` - List targets
- `POST /api/targets` - Add target
- `POST /api/targets/bulk` - Bulk import
- `POST /api/scans` - Start scan
- `GET /api/dns/:targetId` - DNS records
- `GET /api/certificates/:targetId` - SSL/TLS info
- `GET /api/technologies/:targetId` - Technologies
- `GET /api/subdomains/:targetId` - Subdomains
- `GET /api/reports/:targetId` - Generate report

## 📦 Docker Deployment

```bash
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

Available at http://localhost:3000

## 📄 License

MIT
