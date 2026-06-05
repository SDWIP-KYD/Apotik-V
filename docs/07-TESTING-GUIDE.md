# Apotik-V - Testing Guide

**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Status:** MVP

---

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

```
         /\
        / E2E \        (Few - Slow - High confidence)
       /--------\
      / Integration\    (Some - Medium speed)
     /--------------\
    /   Unit Tests    \  (Many - Fast - Low confidence)
   /------------------\
```

### 1.2 Testing Tools

| Tool | Purpose | When |
|------|---------|------|
| Jest | Unit Testing | Phase 4 |
| React Testing Library | Component Testing | Phase 4 |
| Playwright | E2E Testing | Phase 4 |
| k6 | Load Testing | Future |

### 1.3 Coverage Targets

| Type | Target |
|------|--------|
| Unit Tests | > 70% |
| Integration Tests | > 50% |
| E2E Tests | Critical paths only |

---

## 2. Unit Testing

### 2.1 Setup

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D ts-jest @types/jest
```

### 2.2 Configuration (`jest.config.ts`)

```typescript
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)
```

### 2.3 Test Examples

#### Validation Schemas (`src/lib/__tests__/validations.test.ts`)

```typescript
import { loginSchema, patientSchema, medicineSchema } from '../validations'

describe('loginSchema', () => {
  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@test.com', password: '123' })
    expect(result.success).toBe(false)
  })

  it('accepts valid input', () => {
    const result = loginSchema.safeParse({ email: 'test@test.com', password: '123456' })
    expect(result.success).toBe(true)
  })
})

describe('patientSchema', () => {
  it('requires name', () => {
    const result = patientSchema.safeParse({ name: '', dateOfBirth: new Date(), gender: 'MALE' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid gender', () => {
    const result = patientSchema.safeParse({ name: 'John', dateOfBirth: new Date(), gender: 'OTHER' })
    expect(result.success).toBe(false)
  })
})

describe('medicineSchema', () => {
  it('rejects negative stock', () => {
    const result = medicineSchema.safeParse({
      name: 'Paracetamol',
      category: 'Analgesik',
      unit: 'Tablet',
      stockQty: -5,
      minThreshold: 10,
      expiryDate: new Date('2027-12-31'),
      batchNumber: 'PAR-001',
      price: 500,
    })
    expect(result.success).toBe(false)
  })
})
```

---

## 3. Server Action Testing

### 3.1 Stock Deduction Logic

```typescript
// src/server/services/__tests__/stock-service.test.ts
import { checkStockAvailability } from '../stock-service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    medicine: {
      findUnique: jest.fn(),
    },
  },
}))

describe('checkStockAvailability', () => {
  it('returns available: true when stock sufficient', async () => {
    const mockFindUnique = require('@/lib/prisma').prisma.medicine.findUnique
    mockFindUnique.mockResolvedValue({ id: '1', name: 'Paracetamol', stockQty: 100 })

    const result = await checkStockAvailability([
      { medicineId: '1', quantity: 50 },
    ])

    expect(result[0].available).toBe(true)
  })

  it('returns available: false when stock insufficient', async () => {
    const mockFindUnique = require('@/lib/prisma').prisma.medicine.findUnique
    mockFindUnique.mockResolvedValue({ id: '1', name: 'Paracetamol', stockQty: 10 })

    const result = await checkStockAvailability([
      { medicineId: '1', quantity: 50 },
    ])

    expect(result[0].available).toBe(false)
  })

  it('returns available: false when medicine not found', async () => {
    const mockFindUnique = require('@/lib/prisma').prisma.medicine.findUnique
    mockFindUnique.mockResolvedValue(null)

    const result = await checkStockAvailability([
      { medicineId: 'nonexistent', quantity: 50 },
    ])

    expect(result[0].available).toBe(false)
  })
})
```

### 3.2 Prescription Status Transitions

```typescript
// Validate status transitions
const VALID_TRANSITIONS = {
  PENDING: ['PROCESSED', 'CANCELLED'],
  PROCESSED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

describe('Prescription Status Transitions', () => {
  it('allows PENDING -> PROCESSED', () => {
    expect(isValidTransition('PENDING', 'PROCESSED')).toBe(true)
  })

  it('allows PENDING -> CANCELLED', () => {
    expect(isValidTransition('PENDING', 'CANCELLED')).toBe(true)
  })

  it('allows PROCESSED -> COMPLETED', () => {
    expect(isValidTransition('PROCESSED', 'COMPLETED')).toBe(true)
  })

  it('does not allow PENDING -> COMPLETED', () => {
    expect(isValidTransition('PENDING', 'COMPLETED')).toBe(false)
  })

  it('does not allow COMPLETED -> any', () => {
    expect(isValidTransition('COMPLETED', 'PENDING')).toBe(false)
    expect(isValidTransition('COMPLETED', 'CANCELLED')).toBe(false)
  })
})
```

---

## 4. E2E Testing (Playwright)

### 4.1 Setup

```bash
npm install -D @playwright/test
npx playwright install
```

### 4.2 Configuration (`playwright.config.ts`)

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### 4.3 Test Scenarios

#### Login Flow (`e2e/auth.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'wrong@email.com')
    await page.fill('input[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toBeVisible()
  })

  test('logs in as doctor successfully', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'doctor@apotikv.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Audit Logs')).toBeVisible()
  })

  test('logs in as staff successfully', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'staff@apotikv.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Audit Logs')).not.toBeVisible()
  })
})
```

#### Patient Management (`e2e/patients.spec.ts`)

```typescript
test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'doctor@apotikv.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('creates a new patient', async ({ page }) => {
    await page.goto('/patients/new')
    await page.fill('input[name="name"]', 'Test Patient')
    await page.fill('input[name="phone"]', '+62812345678')
    await page.click('button[type="submit"]')
    await expect(page.locator('.toast')).toBeVisible()
  })

  test('searches patients', async ({ page }) => {
    await page.goto('/patients')
    await page.fill('input[placeholder="Search..."]', 'John')
    // Verify filtered results
  })

  test('staff cannot edit patients', async ({ page }) => {
    // Logout and login as staff
    await page.goto('/login')
    await page.fill('input[name="email"]', 'staff@apotikv.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.goto('/patients')
    await expect(page.locator('text=Edit')).not.toBeVisible()
  })
})
```

#### Prescription Workflow (`e2e/prescriptions.spec.ts`)

```typescript
test.describe('Prescription Workflow', () => {
  test('completes prescription and deducts stock', async ({ page }) => {
    // Login as doctor
    await page.goto('/login')
    await page.fill('input[name="email"]', 'doctor@apotikv.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Create patient and medical record
    // ... (setup)

    // Go to prescription
    await page.goto('/prescriptions')
    
    // Find pending prescription
    const prescription = page.locator('tr:has-text("PENDING")').first()
    await prescription.click()

    // Process and complete
    await page.click('button:has-text("Complete")')
    await page.click('button:has-text("Confirm")')

    // Verify status changed
    await expect(page.locator('.badge:has-text("COMPLETED")')).toBeVisible()
  })
})
```

---

## 5. Test Commands

```bash
# Unit Tests
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage

# E2E Tests
npx playwright test         # Run all E2E tests
npx playwright test --ui    # Open Playwright UI
npx playwright test --headed # Run with browser visible
```

---

## 6. Manual Testing Checklist

### 6.1 Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session
- [ ] Session persists on page refresh
- [ ] Protected routes redirect to login

### 6.2 RBAC
- [ ] Doctor sees all menu items
- [ ] Staff sees limited menu items
- [ ] Staff blocked from /audit-logs
- [ ] Staff cannot edit/delete patients
- [ ] Staff cannot cancel prescriptions

### 6.3 Patient Management
- [ ] Create new patient
- [ ] Search patients by name/phone
- [ ] View patient details
- [ ] Edit patient (Doctor only)
- [ ] Delete patient with confirmation (Doctor only)

### 6.4 Medical Records
- [ ] Create SOAP record (Doctor only)
- [ ] View patient history timeline
- [ ] Auto-creates prescription
- [ ] Edit record (Doctor only)

### 6.5 Inventory
- [ ] Add new medicine
- [ ] Search/filter medicines
- [ ] Low stock items highlighted
- [ ] Near-expiry items highlighted
- [ ] Adjust stock with reason

### 6.6 Prescriptions
- [ ] Create prescription from medical record
- [ ] Add multiple items
- [ ] Real-time stock check
- [ ] Update status (Staff)
- [ ] Stock deducted on COMPLETED
- [ ] Cancel prescription (Doctor)

### 6.7 Audit Trail
- [ ] View audit logs (Doctor only)
- [ ] Filter by entity, user, date
- [ ] Old/new values displayed

---

**End of Document**
