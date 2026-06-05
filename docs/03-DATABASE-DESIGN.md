# Apotik-V - Database Design

**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Status:** MVP

---

## 1. Database Overview

| Property | Value |
|----------|-------|
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma 5.x |
| **Schema Management** | Prisma Migrate |
| **Character Encoding** | UTF-8 |

**Why PostgreSQL:**
- JSON/JSONB support for audit log values
- ACID compliance for transactional stock deductions
- Excellent performance with proper indexing
- Robust concurrency handling

---

## 2. Enums

```prisma
enum Role {
  DOCTOR
  STAFF
}

enum PrescriptionStatus {
  PENDING
  PROCESSED
  COMPLETED
  CANCELLED
}
```

---

## 3. Complete Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  DOCTOR
  STAFF
}

enum PrescriptionStatus {
  PENDING
  PROCESSED
  COMPLETED
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(STAFF)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdPatients Patient[] @relation("CreatedBy")
  medicalRecords  MedicalRecord[]
  prescriptions   Prescription[] @relation("CreatedBy")
  processedBy     Prescription[] @relation("ProcessedBy")
  auditLogs       AuditLog[]
}

model Patient {
  id            String    @id @default(cuid())
  name          String
  dateOfBirth   DateTime
  gender        String
  phone         String?
  address       String?
  allergies     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdById   String
  createdBy     User      @relation("CreatedBy", fields: [createdById], references: [id])
  medicalRecords MedicalRecord[]
  prescriptions  Prescription[]
}

model MedicalRecord {
  id            String    @id @default(cuid())
  patientId     String
  doctorId      String
  visitDate     DateTime  @default(now())
  subjective    String    @db.Text
  objective     String    @db.Text
  assessment    String    @db.Text
  plan          String    @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  patient       Patient   @relation(fields: [patientId], references: [id])
  doctor        User      @relation(fields: [doctorId], references: [id])
  prescription  Prescription?
}

model Medicine {
  id            String    @id @default(cuid())
  name          String
  category      String
  unit          String
  stockQty      Int       @default(0)
  minThreshold  Int       @default(10)
  expiryDate    DateTime
  batchNumber   String
  price         Float
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  prescriptionItems PrescriptionItem[]
}

model Prescription {
  id            String    @id @default(cuid())
  recordId      String    @unique
  patientId     String
  status        PrescriptionStatus @default(PENDING)
  notes         String?   @db.Text
  createdById   String
  processedById String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  record        MedicalRecord @relation(fields: [recordId], references: [id])
  patient       Patient   @relation(fields: [patientId], references: [id])
  createdBy     User      @relation("CreatedBy", fields: [createdById], references: [id])
  processedBy   User?     @relation("ProcessedBy", fields: [processedById], references: [id])
  items         PrescriptionItem[]
}

model PrescriptionItem {
  id            String    @id @default(cuid())
  prescriptionId String
  medicineId    String
  dosage        String
  quantity      Int
  notes         String?
  prescription  Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)
  medicine      Medicine  @relation(fields: [medicineId], references: [id])
}

model AuditLog {
  id            String    @id @default(cuid())
  userId        String
  action        String
  entity        String
  entityId      String
  oldValues     Json?
  newValues     Json?
  timestamp     DateTime  @default(now())
  user          User      @relation(fields: [userId], references: [id])
}
```

---

## 4. Table Documentation

### 4.1 User Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| name | String | NOT NULL | User's full name |
| email | String | UNIQUE, NOT NULL | Email for login |
| password | String | NOT NULL | Bcrypt hashed password |
| role | Role | NOT NULL, DEFAULT STAFF | DOCTOR or STAFF |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | NOT NULL, AUTO | Last update timestamp |

**Relations:**
- 1:N with Patient (createdPatients)
- 1:N with MedicalRecord (medicalRecords)
- 1:N with Prescription (createdBy, processedBy)
- 1:N with AuditLog (auditLogs)

---

### 4.2 Patient Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| name | String | NOT NULL | Patient's full name |
| dateOfBirth | DateTime | NOT NULL | Date of birth |
| gender | String | NOT NULL | MALE / FEMALE |
| phone | String? | NULLABLE | Phone number |
| address | String? | NULLABLE | Address |
| allergies | String? | NULLABLE | Known allergies (CRITICAL) |
| createdById | String | FK -> User.id | Creator |
| createdAt | DateTime | NOT NULL | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Update timestamp |

**Indexes:**
- `createdById` - Filter by creator

---

### 4.3 MedicalRecord Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| patientId | String | FK -> Patient.id, NOT NULL | Patient reference |
| doctorId | String | FK -> User.id, NOT NULL | Doctor reference |
| visitDate | DateTime | NOT NULL, DEFAULT now() | Visit date/time |
| subjective | Text | NOT NULL | Patient complaints (SOAP-S) |
| objective | Text | NOT NULL | Observations (SOAP-O) |
| assessment | Text | NOT NULL | Diagnosis (SOAP-A) |
| plan | Text | NOT NULL | Treatment plan (SOAP-P) |
| createdAt | DateTime | NOT NULL | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Update timestamp |

**Indexes:**
- `patientId` - Patient history lookup
- `doctorId` - Doctor filter
- `visitDate` - Date queries

**Relations:**
- N:1 Patient
- N:1 User (doctor)
- 1:1 Prescription (optional)

---

### 4.4 Medicine Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| name | String | NOT NULL | Medicine name |
| category | String | NOT NULL | Category (Analgesik, etc.) |
| unit | String | NOT NULL | Unit (Tablet, Capsule, etc.) |
| stockQty | Int | NOT NULL, DEFAULT 0 | Current stock |
| minThreshold | Int | NOT NULL, DEFAULT 10 | Low stock threshold |
| expiryDate | DateTime | NOT NULL | Expiration date |
| batchNumber | String | NOT NULL | Production batch number |
| price | Float | NOT NULL | Price per unit |
| createdAt | DateTime | NOT NULL | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Update timestamp |

**Indexes:**
- `name` - Search by name
- `category` - Filter by category
- `expiryDate` - Near-expiry queries
- `stockQty` - Low stock queries

---

### 4.5 Prescription Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| recordId | String | FK -> MedicalRecord.id, UNIQUE | Linked record |
| patientId | String | FK -> Patient.id | Patient |
| status | PrescriptionStatus | NOT NULL, DEFAULT PENDING | Current status |
| notes | Text? | NULLABLE | Additional notes |
| createdById | String | FK -> User.id | Doctor who created |
| processedById | String? | FK -> User.id | Staff who processed |
| createdAt | DateTime | NOT NULL | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Update timestamp |

**Status Flow:**
```
PENDING -> PROCESSED -> COMPLETED
PENDING -> CANCELLED
PROCESSED -> CANCELLED
```

**Relations:**
- 1:1 MedicalRecord (recordId)
- N:1 Patient
- N:1 User (createdBy)
- N:1 User (processedBy, optional)
- 1:N PrescriptionItem

---

### 4.6 PrescriptionItem Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| prescriptionId | String | FK -> Prescription.id, ON DELETE CASCADE | Parent prescription |
| medicineId | String | FK -> Medicine.id | Medicine reference |
| dosage | String | NOT NULL | Dosage instructions |
| quantity | Int | NOT NULL | Quantity prescribed |
| notes | String? | NULLABLE | Item-specific notes |

**Relations:**
- N:1 Prescription (cascade delete)
- N:1 Medicine

---

### 4.7 AuditLog Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| userId | String | FK -> User.id | Who performed action |
| action | String | NOT NULL | CREATE / UPDATE / DELETE |
| entity | String | NOT NULL | Table name (Patient, Medicine, etc.) |
| entityId | String | NOT NULL | ID of affected record |
| oldValues | Json? | NULLABLE | Previous values (UPDATE/DELETE) |
| newValues | Json? | NULLABLE | New values (CREATE/UPDATE) |
| timestamp | DateTime | NOT NULL, DEFAULT now() | When it happened |

**Immutable:** No UPDATE or DELETE allowed on this table.

---

## 5. Indexes Summary

| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| User | email | Unique | Login lookup |
| Patient | createdById | Index | Filter by creator |
| MedicalRecord | patientId | Index | Patient history |
| MedicalRecord | doctorId | Index | Doctor filter |
| MedicalRecord | visitDate | Index | Date queries |
| Medicine | name | Index | Search |
| Medicine | category | Index | Category filter |
| Medicine | expiryDate | Index | Near-expiry alerts |
| Medicine | stockQty | Index | Low stock alerts |
| AuditLog | timestamp | Index | Date range queries |
| AuditLog | entity, entityId | Index | Entity lookups |
| AuditLog | userId | Index | User filter |

---

## 6. Seed Data Specification

### 6.1 Test Users

```json
[
  {
    "name": "Dr. Andi Pratama",
    "email": "doctor@apotikv.com",
    "password": "password123 (bcrypt hashed)",
    "role": "DOCTOR"
  },
  {
    "name": "Budi Santoso",
    "email": "staff@apotikv.com",
    "password": "password123 (bcrypt hashed)",
    "role": "STAFF"
  }
]
```

### 6.2 Test Medicines (Optional)

```json
[
  {
    "name": "Paracetamol 500mg",
    "category": "Analgesik",
    "unit": "Tablet",
    "stockQty": 500,
    "minThreshold": 100,
    "expiryDate": "2027-12-31",
    "batchNumber": "PAR-2026-001",
    "price": 500
  },
  {
    "name": "Amoxicillin 500mg",
    "category": "Antibiotik",
    "unit": "Kapsul",
    "stockQty": 15,
    "minThreshold": 50,
    "expiryDate": "2026-06-30",
    "batchNumber": "AMX-2026-001",
    "price": 2000
  }
]
```

---

## 7. Migration Strategy

### Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name init

# Run seed
npx prisma db seed
```

### Best Practices
- Use `prisma db push` for rapid prototyping
- Use `prisma migrate dev` for production-ready migrations
- Always backup before running migrations in production
- Test migrations on staging before deploying

---

**End of Document**
