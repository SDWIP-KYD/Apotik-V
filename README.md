# Apotik-V

**Pharmacy Management System & Electronic Medical Records**

Apotik-V is a full-stack web application for pharmacy management and electronic medical records. It features two main roles: **Doctor (Owner)** and **Staff (Asisten Apoteker)**.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React Framework (App Router) |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling |
| **Shadcn UI** | Component Library |
| **Prisma ORM** | Database ORM |
| **Neon** | PostgreSQL Database |
| **NextAuth.js v5** | Authentication |
| **Vercel** | Hosting & Deployment |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Neon account (free tier)
- npm 10+

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/apotik-v.git
cd apotik-v

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Neon database URL

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed

# Run development server
npm run dev
```

### Test Credentials

- **Doctor:** `doctor@apotikv.com` / `password123`
- **Staff:** `staff@apotikv.com` / `password123`

---

## Deployment (Vercel + Neon)

### 1. Setup Neon Database

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

### 2. Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import GitHub repository
4. Add environment variables:
   - `DATABASE_URL` (from Neon)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Vercel URL)
5. Deploy

### 3. Initialize Database

```bash
# Run migration on Neon
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

---

## Project Structure

```
apotik-v/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities & configs
│   ├── server/                # Server Actions
│   └── types/                 # TypeScript types
├── docs/                      # Documentation
│   ├── 01-PRD.md
│   ├── 02-TECHNICAL-SPEC.md
│   ├── 03-DATABASE-DESIGN.md
│   ├── 04-API-CONTRACTS.md
│   ├── 05-WORKPLAN.md
│   ├── 06-WORKTASK.md
│   ├── 07-TESTING-GUIDE.md
│   └── 08-DEPLOYMENT-GUIDE.md
└── package.json
```

---

## Features

- ✅ **Authentication** - Login with role-based access
- ✅ **Patient Management** - CRUD with search
- ✅ **Medical Records** - SOAP format
- ✅ **Inventory** - Real-time stock tracking
- ✅ **Prescriptions** - Auto stock deduction
- ✅ **Dashboard** - Role-specific views
- ✅ **Audit Trail** - Complete logging

---

## Documentation

- [Product Requirements (PRD)](docs/01-PRD.md)
- [Technical Specifications](docs/02-TECHNICAL-SPEC.md)
- [Database Design](docs/03-DATABASE-DESIGN.md)
- [API Contracts](docs/04-API-CONTRACTS.md)
- [Workplan](docs/05-WORKPLAN.md)
- [Task Breakdown](docs/06-WORKTASK.md)
- [Testing Guide](docs/07-TESTING-GUIDE.md)
- [Deployment Guide](docs/08-DEPLOYMENT-GUIDE.md)

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

---

## License

Private - Internal Use Only
