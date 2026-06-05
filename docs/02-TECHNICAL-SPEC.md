# Apotik-V - Technical Specifications

**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Status:** MVP  
**Document Owner:** Development Team

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [System Architecture](#2-system-architecture)
3. [Project Structure](#3-project-structure)
4. [Development Environment](#4-development-environment)
5. [Coding Standards](#5-coding-standards)
6. [Security Implementation](#6-security-implementation)
7. [Performance Optimization](#7-performance-optimization)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Logging & Monitoring](#9-logging--monitoring)

---

## 1. Technology Stack

### 1.1 Frontend

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **Next.js** | 14.x | React Framework | App Router, Server Components, Server Actions, built-in routing |
| **TypeScript** | 5.x | Language | Type safety, better DX, catch errors at compile time |
| **React** | 18.x | UI Library | Component-based, ecosystem, Server Components support |
| **Tailwind CSS** | 3.x | Styling | Utility-first, responsive, consistent design system |
| **Shadcn UI** | Latest | Component Library | Accessible, customizable, built on Radix UI |
| **TanStack Query** | 5.x | State Management | Server state, caching, background refetching |
| **React Hook Form** | 7.x | Form Handling | Performance, DX, integration with Zod |
| **Zod** | 3.x | Validation | TypeScript-first, schema validation, runtime type checking |
| **Lucide React** | Latest | Icons | Tree-shakeable, consistent style |

### 1.2 Backend

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **Next.js API Routes** | 14.x | REST Endpoints | Built-in, serverless-ready |
| **Server Actions** | 14.x | Mutations | Type-safe, simplified data mutations |
| **NextAuth.js** | 5.x (beta) | Authentication | Built for App Router, database sessions, extensible |
| **Prisma ORM** | 5.x | Database ORM | Type-safe queries, migrations, excellent DX |
| **Zod** | 3.x | Server Validation | Same validation library as frontend |

### 1.3 Database

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **PostgreSQL** | 15+ | Primary Database | JSON support, reliability, performance |
| **Prisma Migrate** | 5.x | Migrations | Declarative schema, version control |
| **Prisma Client** | 5.x | Query Builder | Auto-generated, type-safe |

### 1.4 Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Runtime |
| **npm** | 10+ | Package Manager |
| **ESLint** | 8.x | Linting |
| **Prettier** | 3.x | Code Formatting |
| **Git** | 2.x | Version Control |
| **VS Code** | Latest | IDE (Recommended) |

### 1.5 Deployment

| Platform | Purpose | Notes |
|----------|---------|-------|
| **Vercel** | Hosting (Recommended) | Zero-config Next.js deployment |
| **Supabase** | PostgreSQL Hosting | Free tier available |
| **Neon** | PostgreSQL Hosting (Alt) | Serverless Postgres |
| **Railway** | Full-stack Hosting | Good for self-hosted |
| **Docker** | Containerization | For self-hosted deployment |

### 1.6 Testing (Phase 4)

| Tool | Purpose |
|------|---------|
| **Jest** | Unit Testing |
| **React Testing Library** | Component Testing |
| **Playwright** | E2E Testing |
| **k6** | Load Testing |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Desktop    │  │   Tablet     │  │      Mobile          │  │
│  │   Browser    │  │   Browser    │  │      Browser         │  │
│  │  (1024px+)   │  │  (768px+)    │  │      (320px+)        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                      │              │
│         └──────────────────┼──────────────────────┘              │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS APPLICATION                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                     │   │
│  │                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │ Server Components│  │    Client Components        │   │   │
│  │  │   (RSC)         │  │   (Interactive)             │   │   │
│  │  │                 │  │                             │   │   │
│  │  │ - Data fetching │  │ - Forms                     │   │   │
│  │  │ - Static pages  │  │ - Modals                    │   │   │
│  │  │ - Layouts       │  │ - Client-side state         │   │   │
│  │  └─────────────────┘  └─────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │           Shadcn UI Components                      │ │   │
│  │  │  (Button, Input, Table, Dialog, Form, etc.)         │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API LAYER                            │   │
│  │                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │ Server Actions  │  │      API Routes             │   │   │
│  │  │                 │  │                             │   │   │
│  │  │ - Mutations     │  │ - Auth endpoints            │   │   │
│  │  │ - Form submits  │  │ - Webhooks (future)         │   │   │
│  │  │ - Data changes  │  │ - External integrations     │   │   │
│  │  └────────┬────────┘  └─────────────┬───────────────┘   │   │
│  │           │                          │                    │   │
│  │           └──────────┬───────────────┘                    │   │
│  │                      │                                    │   │
│  │                      ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │              Middleware Layer                        │ │   │
│  │  │                                                     │ │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │   │
│  │  │  │    Auth      │  │     RBAC     │  │  Logger  │ │ │   │
│  │  │  │  Middleware  │  │   Checks     │  │          │ │ │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   BUSINESS LOGIC LAYER                    │   │
│  │                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │   Services      │  │    Validators               │   │   │
│  │  │                 │  │                             │   │   │
│  │  │ - Stock Service │  │ - Zod Schemas               │   │   │
│  │  │ - Audit Service │  │ - Validation Logic          │   │   │
│  │  │ - Auth Service  │  │                             │   │   │
│  │  └─────────────────┘  └─────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Prisma ORM                              │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Prisma     │  │   Prisma     │  │   Prisma     │   │   │
│  │  │   Client     │  │   Migrate    │  │   Studio     │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ SQL
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  PostgreSQL Database                      │   │
│  │                                                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │  User    │ │ Patient  │ │ Medicine │ │Prescript.│    │   │
│  │  │  Table   │ │  Table   │ │  Table   │ │  Table   │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  │                                                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │   │
│  │  │ Medical  │ │  Audit   │ │ Session  │                 │   │
│  │  │  Record  │ │   Log    │ │  Table   │                 │   │
│  │  └──────────┘ └──────────┘ └──────────┘                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

```
src/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group (no sidebar)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/              # Dashboard routes group (with sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx          # Patient list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Patient detail
│   │   │   └── new/
│   │   │       └── page.tsx      # New patient form
│   │   ├── medical-records/
│   │   │   └── [patientId]/
│   │   │       └── page.tsx      # Medical record form + timeline
│   │   ├── inventory/
│   │   │   └── page.tsx          # Medicine inventory
│   │   ├── prescriptions/
│   │   │   ├── page.tsx          # Prescription list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Prescription detail
│   │   ├── audit-logs/
│   │   │   └── page.tsx          # Audit logs (DOCTOR only)
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth API handler
│   │
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root page (redirect to /dashboard)
│
├── components/
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx           # Main navigation sidebar
│   │   ├── topbar.tsx            # Top bar with user menu
│   │   └── mobile-nav.tsx        # Mobile navigation
│   │
│   ├── forms/                    # Reusable form components
│   │   ├── login-form.tsx
│   │   ├── patient-form.tsx
│   │   ├── medical-record-form.tsx
│   │   ├── medicine-form.tsx
│   │   └── prescription-form.tsx
│   │
│   └── features/                 # Feature-specific components
│       ├── dashboard/
│       │   ├── stats-cards.tsx
│       │   └── pending-prescriptions.tsx
│       ├── patients/
│       │   ├── patient-list.tsx
│       │   └── patient-card.tsx
│       ├── inventory/
│       │   ├── inventory-table.tsx
│       │   └── stock-alert.tsx
│       └── prescriptions/
│           ├── prescription-list.tsx
│           └── prescription-items.tsx
│
├── lib/                          # Utilities & configurations
│   ├── auth.ts                   # NextAuth configuration
│   ├── auth.config.ts            # Edge-compatible auth config
│   ├── auth-utils.ts             # Auth helper functions
│   ├── prisma.ts                 # Prisma client singleton
│   ├── routes.ts                 # Route definitions
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # General utilities (cn, etc.)
│
├── server/                       # Server-side code
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── medical-records.ts
│   │   ├── medicines.ts
│   │   ├── prescriptions.ts
│   │   └── audit-logs.ts
│   │
│   └── services/                 # Business logic services
│       ├── audit-service.ts      # Audit logging service
│       └── stock-service.ts      # Stock management service
│
├── types/                        # TypeScript type definitions
│   ├── next-auth.d.ts            # NextAuth type extensions
│   ├── patient.ts
│   ├── medicine.ts
│   ├── prescription.ts
│   └── api.ts                    # API response types
│
└── middleware.ts                  # Next.js middleware (RBAC)
```

### 2.3 Data Flow

#### Server Component Data Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│    Server    │────▶│   Database   │
│   Request    │     │   Component  │     │   (Prisma)   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    HTML      │
                     │   Response   │
                     └──────────────┘
```

#### Server Action Data Flow (Mutation)
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Client      │────▶│   Server     │────▶│   Prisma     │
│  Component   │     │   Action     │     │   Client     │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Zod        │     │   Database   │
                     │  Validation  │     │   Transaction│
                     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │  Audit Log   │
                                           │   (if needed)│
                                           └──────┬───────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │   Response   │
                                           │   to Client  │
                                           └──────────────┘
```

#### Authentication Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Login Form  │────▶│  NextAuth    │────▶│   Database   │
│  (Client)    │     │  Credentials │     │   (User)     │
└──────────────┘     │  Provider    │     └──────┬───────┘
                     └──────┬───────┘            │
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Bcrypt     │     │   Session    │
                     │   Compare    │     │   (DB)       │
                     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            └──────────┬──────────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │   Session    │
                                │   Cookie     │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │   Redirect   │
                                │  /dashboard  │
                                └──────────────┘
```

---

## 3. Project Structure

### 3.1 Root Directory Structure

```
apotik-v/
│
├── docs/                           # Documentation
│   ├── 01-PRD.md
│   ├── 02-TECHNICAL-SPEC.md
│   ├── 03-DATABASE-DESIGN.md
│   ├── 04-API-CONTRACTS.md
│   ├── 05-WORKPLAN.md
│   ├── 06-WORKTASK.md
│   ├── 07-TESTING-GUIDE.md
│   └── 08-DEPLOYMENT-GUIDE.md
│
├── prisma/                         # Prisma ORM
│   ├── schema.prisma               # Database schema
│   ├── seed.ts                     # Seed data
│   └── migrations/                 # Database migrations
│       └── <timestamp>_init/
│           └── migration.sql
│
├── public/                         # Static assets
│   ├── logo.svg
│   └── favicon.ico
│
├── src/                            # Source code
│   ├── app/                        # Next.js App Router
│   ├── components/                 # React components
│   ├── lib/                        # Utilities & configs
│   ├── server/                     # Server-side code
│   ├── types/                      # TypeScript types
│   └── middleware.ts               # Edge middleware
│
├── .env                            # Environment variables (local)
├── .env.example                    # Environment variables template
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore rules
├── .prettierrc                     # Prettier configuration
├── next.config.js                  # Next.js configuration
├── package.json                    # Dependencies & scripts
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project README
```

### 3.2 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case.tsx | `patient-form.tsx` |
| Pages | page.tsx | `page.tsx` (Next.js convention) |
| Layouts | layout.tsx | `layout.tsx` (Next.js convention) |
| Server Actions | kebab-case.ts | `patients.ts` |
| Services | kebab-case.ts | `audit-service.ts` |
| Utilities | kebab-case.ts | `auth-utils.ts` |
| Types | kebab-case.ts | `patient.ts` |
| Constants | UPPER_SNAKE_CASE | `ROLES`, `PRESCRIPTION_STATUS` |
| CSS | globals.css | `globals.css` |

### 3.3 Component Structure Template

```typescript
// 'use client' // Uncomment if client component

// 1. External imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 2. Internal imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPatient } from '@/server/actions/patients'

// 3. Types & Interfaces
interface PatientFormProps {
  initialData?: Patient
  onSuccess?: () => void
}

// 4. Constants
const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  // ...
})

type PatientFormData = z.infer<typeof patientSchema>

// 5. Component
export function PatientForm({ initialData, onSuccess }: PatientFormProps) {
  // Hooks
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData ?? { /* ... */ },
  })

  // Handlers
  async function onSubmit(data: PatientFormData) {
    // ...
  }

  // Render
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  )
}
```

### 3.4 Server Action Template

```typescript
'use server'

// 1. Imports
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createAuditLog } from '@/server/services/audit-service'

// 2. Validation Schema
const createPatientSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.date(),
  // ...
})

// 3. Type
type CreatePatientInput = z.infer<typeof createPatientSchema>

// 4. Action
export async function createPatient(input: CreatePatientInput) {
  // Auth check
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  // Validate input
  const validated = createPatientSchema.parse(input)

  // Business logic
  const patient = await prisma.patient.create({
    data: {
      ...validated,
      createdById: session.user.id,
    },
  })

  // Revalidate
  revalidatePath('/patients')

  return { data: patient }
}
```

---

## 4. Development Environment

### 4.1 Prerequisites

| Requirement | Version | Installation |
|------------|---------|--------------|
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | Included with Node.js |
| PostgreSQL | 15+ | https://postgresql.org |
| Git | 2.x | https://git-scm.com |

### 4.2 Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd apotik-v

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Setup database
npx prisma generate          # Generate Prisma Client
npx prisma db push           # Push schema to database
npx prisma db seed           # Seed initial data

# 5. Run development server
npm run dev

# 6. (Optional) Open Prisma Studio
npx prisma studio
```

### 4.3 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/apotik_v"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Direct URL for Prisma Migrate (if using connection pooler)
DIRECT_URL="postgresql://user:password@localhost:5432/apotik_v"
```

### 4.4 Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  }
}
```

### 4.5 VS Code Extensions (Recommended)

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Importer
- Error Lens

---

## 5. Coding Standards

### 5.1 TypeScript Guidelines

#### DO:
```typescript
// Use interfaces for object shapes
interface Patient {
  id: string
  name: string
  dateOfBirth: Date
}

// Use type aliases for unions
type UserRole = 'DOCTOR' | 'STAFF'

// Use explicit return types for exported functions
export function getPatient(id: string): Promise<Patient | null> {
  // ...
}

// Use enums for fixed sets of values
enum PrescriptionStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Use generics for reusable types
interface ApiResponse<T> {
  data?: T
  error?: string
}
```

#### DON'T:
```typescript
// Avoid 'any' type
function processData(data: any) { ... }  // BAD

// Avoid type assertions when possible
const patient = data as Patient  // Only when necessary

// Avoid non-null assertion
patient.name!  // Use optional chaining instead: patient?.name
```

### 5.2 React/Next.js Patterns

#### Server Components (Default)
```typescript
// This is a Server Component by default (no 'use client' directive)
import { prisma } from '@/lib/prisma'

export default async function PatientsPage() {
  const patients = await prisma.patient.findMany()
  
  return (
    <div>
      {patients.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}
```

#### Client Components (When Needed)
```typescript
'use client'

import { useState } from 'react'

export function PatientList() {
  const [search, setSearch] = useState('')
  
  return (
    <input 
      value={search} 
      onChange={(e) => setSearch(e.target.value)} 
    />
  )
}
```

#### Server Actions
```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function createPatient(formData: FormData) {
  // ... implementation
  
  revalidatePath('/patients')
}
```

### 5.3 Styling (Tailwind + Shadcn)

#### DO:
```tsx
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-6">

// Use cn() for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg p-4',
  isActive && 'bg-primary text-primary-foreground',
  className
)}>

// Use Shadcn components for consistency
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
```

#### DON'T:
```tsx
// Avoid custom CSS when Tailwind can handle it
<style>{`.custom { ... }`}</style>  // BAD

// Avoid inline styles
<div style={{ padding: '16px' }}>  // BAD

// Avoid arbitrary values when possible
<div className="p-[17px]">  // Use p-4 instead
```

### 5.4 State Management

#### Server State (TanStack Query)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export function PatientList() {
  const { data, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => fetchPatients(),
  })
  
  // ...
}
```

#### Form State (React Hook Form)
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function PatientForm() {
  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: { /* ... */ },
  })
  
  // ...
}
```

#### URL State
```typescript
// Use Next.js searchParams for URL state
export default function PatientsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  const search = searchParams.search ?? ''
  const page = Number(searchParams.page ?? 1)
  
  // ...
}
```

---

## 6. Security Implementation

### 6.1 Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  NextAuth    │────▶│  PostgreSQL  │
│              │     │  Credentials │     │   (User)     │
│              │     │   Provider   │     │              │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            │  1. Submit email    │
                            │     + password      │
                            │────────────────────▶│
                            │                     │
                            │  2. Fetch user      │
                            │◀────────────────────│
                            │                     │
                            │  3. Compare bcrypt  │
                            │     hash            │
                            │                     │
                            │  4. Create session  │
                            │     in DB           │
                            │────────────────────▶│
                            │                     │
                            │  5. Set session     │
                            │     cookie          │
                            │◀────────────────────│
                            │                     │
                            │  6. Redirect to     │
                            │     /dashboard      │
                            │◀────────────────────│
```

### 6.2 Authorization (RBAC)

#### Middleware (Route Protection)
```typescript
// src/middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const doctorOnlyRoutes = ['/audit-logs']
const protectedRoutes = ['/dashboard', '/patients', '/medical-records', 
                         '/inventory', '/prescriptions']

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )
  const isDoctorOnly = doctorOnlyRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if not authenticated
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Block STAFF from doctor-only routes
  if (isDoctorOnly && role === 'STAFF') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})
```

#### Server Action (Permission Check)
```typescript
'use server'

export async function deletePatient(id: string) {
  const session = await auth()
  
  // Check authentication
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  
  // Check role
  if (session.user.role !== 'DOCTOR') {
    throw new Error('Forbidden: Only doctors can delete patients')
  }
  
  // Proceed with deletion
  // ...
}
```

### 6.3 Data Validation

#### Client-Side Validation
```typescript
import { z } from 'zod'

const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.date().max(new Date(), 'Date of birth cannot be in the future'),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})
```

#### Server-Side Validation
```typescript
'use server'

export async function createPatient(input: unknown) {
  // Validate input
  const validated = patientSchema.parse(input)
  
  // Proceed with validated data
  // ...
}
```

### 6.4 Audit Logging

```typescript
// src/server/services/audit-service.ts
import { prisma } from '@/lib/prisma'

interface AuditLogInput {
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: input,
  })
}
```

---

## 7. Performance Optimization

### 7.1 React Server Components

```typescript
// GOOD: Server Component - data fetched on server
export default async function PatientsPage() {
  const patients = await prisma.patient.findMany()
  
  return <PatientList patients={patients} />
}

// BAD: Client Component with client-side fetch
'use client'
export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  
  useEffect(() => {
    fetch('/api/patients').then(...)
  }, [])
  
  return <PatientList patients={patients} />
}
```

### 7.2 Database Query Optimization

```typescript
// GOOD: Select only needed fields
const patients = await prisma.patient.findMany({
  select: {
    id: true,
    name: true,
    // Only fields needed for list view
  },
})

// GOOD: Use pagination
const patients = await prisma.patient.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
})

// GOOD: Use indexes (defined in schema)
model Patient {
  name String
  @@index([name])
}
```

### 7.3 Caching Strategy

```typescript
// Revalidate on mutation
import { revalidatePath } from 'next/cache'

export async function createPatient(data: PatientInput) {
  const patient = await prisma.patient.create({ data })
  
  revalidatePath('/patients')  // Invalidate cache
  
  return patient
}

// TanStack Query caching
const { data } = useQuery({
  queryKey: ['patients', search],
  queryFn: () => fetchPatients(search),
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
})
```

---

## 8. Error Handling Strategy

### 8.1 Server Actions Error Handling

```typescript
'use server'

import { isZodError } from '@/lib/utils'

export async function createPatient(input: unknown) {
  try {
    const validated = patientSchema.parse(input)
    const patient = await prisma.patient.create({ data: validated })
    
    revalidatePath('/patients')
    
    return { data: patient, error: null }
  } catch (error) {
    if (isZodError(error)) {
      return { 
        data: null, 
        error: 'Validation failed',
        details: error.errors 
      }
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { 
        data: null, 
        error: 'Database error',
        code: error.code 
      }
    }
    
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    }
  }
}
```

### 8.2 Client-Side Error Handling

```typescript
'use client'

import { toast } from 'sonner'

export function PatientForm() {
  async function onSubmit(data: PatientInput) {
    const result = await createPatient(data)
    
    if (result.error) {
      toast.error(result.error)
      return
    }
    
    toast.success('Patient created successfully')
    router.push('/patients')
  }
  
  // ...
}
```

### 8.3 Global Error Boundary

```typescript
// src/app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

## 9. Logging & Monitoring

### 9.1 Application Logging

```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data)
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data)
  },
}
```

### 9.2 Audit Trail

All critical operations are logged to the AuditLog table:
- CREATE operations
- UPDATE operations
- DELETE operations

See `03-DATABASE-DESIGN.md` for audit log schema.

### 9.3 Monitoring (Production)

Recommended tools:
- **Vercel Analytics** - Web vitals and performance
- **Sentry** - Error tracking
- **LogSnag** - Event tracking

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | Development Team | Initial version |

---

**End of Document**
