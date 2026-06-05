# Apotik-V - Detailed Task Breakdown (Worktask)

**Version:** 1.0
**Last Updated:** 2026-02-07
**Status:** MVP
**Detail Level:** Very Detailed (with subtasks, estimates, acceptance criteria)

---

## 1. Task Management Methodology

- Each phase contains multiple task groups
- Each task group contains subtasks
- Each subtask has: description, estimated time, acceptance criteria, dependencies
- Status tracking: Pending, In Progress, Done

**Priority Levels:**
- P0: Critical (must have for MVP)
- P1: High (important for full functionality)
- P2: Medium (nice to have)
- P3: Low (can be deferred)

**Time Estimates:** Based on single developer working full-time

---

## 2. Phase 1: Foundation & Auth

### Task 1.1: Project Initialization
**Status:** Pending
**Estimate:** 1 hour
**Priority:** P0
**Dependencies:** None

**Subtasks:**
- [ ] 1.1.1 Run `npx create-next-app@latest apotik-v --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
- [ ] 1.1.2 Verify project structure created correctly
- [ ] 1.1.3 Run `npm run dev` to verify dev server starts
- [ ] 1.1.4 Open http://localhost:3000 and verify default page loads

**Acceptance Criteria:**
- [ ] Project folder `apotik-v` created
- [ ] TypeScript configured (tsconfig.json exists)
- [ ] Tailwind configured (tailwind.config.ts exists)
- [ ] App Router structure exists (src/app/)
- [ ] Dev server starts without errors
- [ ] Default page renders in browser

---

### Task 1.2: Install Dependencies
**Status:** Pending
**Estimate:** 30 minutes
**Priority:** P0
**Dependencies:** 1.1

**Subtasks:**
- [ ] 1.2.1 Install core dependencies:
  ```bash
  npm install next-auth@beta @auth/prisma-adapter
  npm install @prisma/client prisma
  npm install zod react-hook-form @hookform/resolvers
  npm install @tanstack/react-query
  npm install bcryptjs
  npm install -D @types/bcryptjs
  ```
- [ ] 1.2.2 Initialize Shadcn UI: `npx shadcn@latest init`
- [ ] 1.2.3 Install Shadcn components:
  ```bash
  npx shadcn@latest add button input label card table badge \
    dialog alert-dialog form select textarea toast toaster \
    separator dropdown-menu avatar skeleton
  ```
- [ ] 1.2.4 Verify all packages in package.json

**Acceptance Criteria:**
- [ ] All dependencies listed in package.json
- [ ] Shadcn components exist in src/components/ui/
- [ ] No peer dependency errors

---

### Task 1.3: Setup Prisma
**Status:** Pending
**Estimate:** 1.5 hours
**Priority:** P0
**Dependencies:** 1.2

**Subtasks:**
- [ ] 1.3.1 Initialize Prisma: `npx prisma init`
- [ ] 1.3.2 Create `prisma/schema.prisma` with complete schema (all models, enums)
- [ ] 1.3.3 Create `.env` file with DATABASE_URL placeholder
- [ ] 1.3.4 Create `src/lib/prisma.ts` singleton client
- [ ] 1.3.5 Run `npx prisma generate` to generate client
- [ ] 1.3.6 Run `npx prisma db push` to sync schema to database
- [ ] 1.3.7 Verify Prisma Studio opens: `npx prisma studio`

**Acceptance Criteria:**
- [ ] schema.prisma contains all 7 models (User, Patient, MedicalRecord, Medicine, Prescription, PrescriptionItem, AuditLog)
- [ ] schema.prisma contains both enums (Role, PrescriptionStatus)
- [ ] prisma.ts exports singleton PrismaClient
- [ ] Database tables created successfully
- [ ] Prisma Studio shows all tables

---

### Task 1.4: Create Seed Script
**Status:** Pending
**Estimate:** 1 hour
**Priority:** P0
**Dependencies:** 1.3

**Subtasks:**
- [ ] 1.4.1 Create `prisma/seed.ts` file
- [ ] 1.4.2 Implement password hashing with bcryptjs
- [ ] 1.4.3 Create DOCTOR user: doctor@apotikv.com / password123
- [ ] 1.4.4 Create STAFF user: staff@apotikv.com / password123
- [ ] 1.4.5 Add seed script to package.json: `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }`
- [ ] 1.4.6 Run `npx prisma db seed`
- [ ] 1.4.7 Verify users in Prisma Studio

**Acceptance Criteria:**
- [ ] 2 users created in database
- [ ] Passwords are bcrypt hashed (not plain text)
- [ ] DOCTOR role assigned correctly
- [ ] STAFF role assigned correctly
- [ ] Can query users via Prisma Client

---

### Task 1.5: Configure NextAuth.js v5
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P0
**Dependencies:** 1.3, 1.4

**Subtasks:**
- [ ] 1.5.1 Create `src/lib/auth.config.ts` (edge-compatible config)
- [ ] 1.5.2 Create `src/lib/auth.ts` (main auth config with PrismaAdapter)
- [ ] 1.5.3 Configure Credentials Provider (email + password)
- [ ] 1.5.4 Implement password validation with bcrypt
- [ ] 1.5.5 Configure session strategy: database
- [ ] 1.5.6 Configure session callback to inject user.role
- [ ] 1.5.7 Configure pages: signIn -> /login
- [ ] 1.5.8 Create `src/types/next-auth.d.ts` type extensions
- [ ] 1.5.9 Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] 1.5.10 Test login via browser

**Acceptance Criteria:**
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials fails with error
- [ ] Session contains user.id, user.email, user.role
- [ ] Session persisted in database
- [ ] Logout clears session

---

### Task 1.6: Create Middleware
**Status:** Pending
**Estimate:** 1.5 hours
**Priority:** P0
**Dependencies:** 1.5

**Subtasks:**
- [ ] 1.6.1 Create `src/middleware.ts`
- [ ] 1.6.2 Define public routes: ["/login", "/auth/error"]
- [ ] 1.6.3 Define protected routes: ["/dashboard", "/patients", ...]
- [ ] 1.6.4 Define doctor-only routes: ["/audit-logs"]
- [ ] 1.6.5 Implement auth check (redirect to /login if not authenticated)
- [ ] 1.6.6 Implement RBAC check (block STAFF from doctor-only routes)
- [ ] 1.6.7 Create `src/lib/routes.ts` with route definitions
- [ ] 1.6.8 Create `src/lib/auth-utils.ts` helper functions
- [ ] 1.6.9 Test route protection

**Acceptance Criteria:**
- [ ] Unauthenticated access to /dashboard redirects to /login
- [ ] STAFF access to /audit-logs redirects to /dashboard
- [ ] DOCTOR access to /audit-logs works
- [ ] Public routes accessible without auth

---

### Task 1.7: Create Login Page
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P0
**Dependencies:** 1.5, 1.6

**Subtasks:**
- [ ] 1.7.1 Create `src/app/(auth)/layout.tsx` (minimal layout)
- [ ] 1.7.2 Create `src/app/(auth)/login/page.tsx`
- [ ] 1.7.3 Create `src/components/forms/login-form.tsx`
- [ ] 1.7.4 Implement form with React Hook Form + Zod
- [ ] 1.7.5 Implement signIn("credentials", {...}) logic
- [ ] 1.7.6 Show error toast on failed login
- [ ] 1.7.7 Redirect to /dashboard on success
- [ ] 1.7.8 Style with Shadcn components
- [ ] 1.7.9 Create `src/app/auth/error/page.tsx` for auth errors

**Acceptance Criteria:**
- [ ] Login form displays with email and password fields
- [ ] Form validates input (email format, password min 6)
- [ ] Successful login redirects to /dashboard
- [ ] Failed login shows error message
- [ ] Form is accessible (labels, ARIA)
- [ ] Responsive design (mobile-friendly)

---

### Task 1.8: Create Base Layout
**Status:** Pending
**Estimate:** 3 hours
**Priority:** P0
**Dependencies:** 1.6

**Subtasks:**
- [ ] 1.8.1 Create `src/components/layout/sidebar.tsx`
- [ ] 1.8.2 Implement collapsible sidebar with navigation
- [ ] 1.8.3 Add role-based menu items (DOCTOR vs STAFF)
- [ ] 1.8.4 Create `src/components/layout/topbar.tsx`
- [ ] 1.8.5 Add user profile display
- [ ] 1.8.6 Add logout button
- [ ] 1.8.7 Create `src/app/(dashboard)/layout.tsx` (wrapper)
- [ ] 1.8.8 Create `src/components/providers.tsx` (SessionProvider + QueryClientProvider)
- [ ] 1.8.9 Wrap root layout with providers
- [ ] 1.8.10 Create placeholder dashboard page: `src/app/(dashboard)/dashboard/page.tsx`
- [ ] 1.8.11 Create `src/lib/utils.ts` with `cn()` helper

**Acceptance Criteria:**
- [ ] Sidebar displays with navigation links
- [ ] Menu items differ based on role
- [ ] Sidebar can collapse/expand
- [ ] Topbar shows user name and logout
- [ ] Logout clears session and redirects to /login
- [ ] Layout is responsive (sidebar collapses on mobile)

---

### Task 1.9: Phase 1 Verification
**Status:** Pending
**Estimate:** 1 hour
**Priority:** P0
**Dependencies:** 1.1 - 1.8

**Subtasks:**
- [ ] 1.9.1 Test full login flow (DOCTOR)
- [ ] 1.9.2 Test full login flow (STAFF)
- [ ] 1.9.3 Verify RBAC enforcement
- [ ] 1.9.4 Verify session persistence
- [ ] 1.9.5 Verify logout flow
- [ ] 1.9.6 Check for console errors
- [ ] 1.9.7 Test on mobile viewport

**Acceptance Criteria:**
- [ ] All Phase 1 success criteria met (see Workplan)
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] All tests pass

---

## 3. Phase 2: Patient & Medical Records

### Task 2.1: Patient Server Actions
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P0
**Dependencies:** Phase 1

**Subtasks:**
- [ ] 2.1.1 Create `src/server/actions/patients.ts`
- [ ] 2.1.2 Implement createPatient action
- [ ] 2.1.3 Implement getPatients action (with search, pagination)
- [ ] 2.1.4 Implement getPatientById action
- [ ] 2.1.5 Implement updatePatient action (Doctor only)
- [ ] 2.1.6 Implement deletePatient action (Doctor only)
- [ ] 2.1.7 Add Zod validation for all inputs
- [ ] 2.1.8 Add audit logging for update/delete

**Acceptance Criteria:**
- [ ] All CRUD operations work
- [ ] Input validation rejects invalid data
- [ ] Only Doctor can update/delete
- [ ] Audit logs created for update/delete

---

### Task 2.2: Patient UI Components
**Status:** Pending
**Estimate:** 3 hours
**Priority:** P0
**Dependencies:** 2.1

**Subtasks:**
- [ ] 2.2.1 Create `src/components/forms/patient-form.tsx`
- [ ] 2.2.2 Create `src/components/features/patients/patient-list.tsx`
- [ ] 2.2.3 Create `src/components/features/patients/patient-card.tsx`
- [ ] 2.2.4 Create `src/app/(dashboard)/patients/page.tsx` (list)
- [ ] 2.2.5 Create `src/app/(dashboard)/patients/new/page.tsx` (create)
- [ ] 2.2.6 Create `src/app/(dashboard)/patients/[id]/page.tsx` (detail)
- [ ] 2.2.7 Implement search functionality
- [ ] 2.2.8 Implement pagination
- [ ] 2.2.9 Add edit/delete buttons (Doctor only)

**Acceptance Criteria:**
- [ ] Patient list displays with search
- [ ] Pagination works correctly
- [ ] Create form validates input
- [ ] Detail page shows all patient info
- [ ] Edit button only visible for Doctor
- [ ] Delete shows confirmation dialog

---

### Task 2.3: Medical Record Server Actions
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P0
**Dependencies:** 2.1

**Subtasks:**
- [ ] 2.3.1 Create `src/server/actions/medical-records.ts`
- [ ] 2.3.2 Implement createMedicalRecord action (Doctor only)
- [ ] 2.3.3 Implement getMedicalRecordsByPatient action
- [ ] 2.3.4 Implement updateMedicalRecord action (Doctor only)
- [ ] 2.3.5 Auto-create Prescription on MedicalRecord creation
- [ ] 2.3.6 Add Zod validation
- [ ] 2.3.7 Add audit logging

**Acceptance Criteria:**
- [ ] Only Doctor can create/update medical records
- [ ] Auto-creates prescription when record is created
- [ ] Records linked to patient correctly
- [ ] SOAP fields validated

---

### Task 2.4: Medical Record UI
**Status:** Pending
**Estimate:** 3 hours
**Priority:** P0
**Dependencies:** 2.3

**Subtasks:**
- [ ] 2.4.1 Create `src/components/forms/medical-record-form.tsx`
- [ ] 2.4.2 Create `src/app/(dashboard)/medical-records/[patientId]/page.tsx`
- [ ] 2.4.3 Implement split view (form left, timeline right)
- [ ] 2.4.4 Create timeline component showing visit history
- [ ] 2.4.5 Sort timeline by date (newest first)
- [ ] 2.4.6 Show doctor name and summary on each entry
- [ ] 2.4.7 Add expand/collapse for full details
- [ ] 2.4.8 Show linked prescription

**Acceptance Criteria:**
- [ ] Form has 4 SOAP sections
- [ ] Timeline displays correctly
- [ ] New records appear at top
- [ ] Can expand to see full details
- [ ] Linked prescription shown

---

### Task 2.5: Phase 2 Verification
**Status:** Pending
**Estimate:** 1 hour
**Priority:** P0
**Dependencies:** 2.1 - 2.4

**Subtasks:**
- [ ] 2.5.1 Test patient CRUD flow
- [ ] 2.5.2 Test medical record creation
- [ ] 2.5.3 Test RBAC enforcement
- [ ] 2.5.4 Test form validation
- [ ] 2.5.5 Test search and pagination
- [ ] 2.5.6 Check for console errors

**Acceptance Criteria:**
- [ ] All Phase 2 success criteria met
- [ ] No console errors
- [ ] Responsive design working

---

## 4. Phase 3: Inventory & Prescription

### Task 3.1: Medicine Server Actions
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P0
**Dependencies:** Phase 1

**Subtasks:**
- [ ] 3.1.1 Create `src/server/actions/medicines.ts`
- [ ] 3.1.2 Implement createMedicine action
- [ ] 3.1.3 Implement getMedicines action (with search, category filter)
- [ ] 3.1.4 Implement updateMedicine action
- [ ] 3.1.5 Implement deleteMedicine action (Doctor only)
- [ ] 3.1.6 Implement adjustStock action
- [ ] 3.1.7 Add Zod validation
- [ ] 3.1.8 Add audit logging

**Acceptance Criteria:**
- [ ] All CRUD operations work
- [ ] Stock adjustment validates non-negative
- [ ] Audit logs created for all changes

---

### Task 3.2: Inventory UI
**Status:** Pending
**Estimate:** 3 hours
**Priority:** P0
**Dependencies:** 3.1

**Subtasks:**
- [ ] 3.2.1 Create `src/components/forms/medicine-form.tsx`
- [ ] 3.2.2 Create `src/components/features/inventory/inventory-table.tsx`
- [ ] 3.2.3 Create `src/components/features/inventory/stock-alert.tsx`
- [ ] 3.2.4 Create `src/app/(dashboard)/inventory/page.tsx`
- [ ] 3.2.5 Implement search by name
- [ ] 3.2.6 Implement category filter
- [ ] 3.2.7 Highlight low stock items (red)
- [ ] 3.2.8 Highlight near-expiry items (yellow)
- [ ] 3.2.9 Add stock adjustment dialog
- [ ] 3.2.10 Add delete confirmation (Doctor only)

**Acceptance Criteria:**
- [ ] Inventory list displays all medicines
- [ ] Search works by name
- [ ] Category filter works
- [ ] Low stock highlighted in red
- [ ] Near-expiry highlighted in yellow
- [ ] Stock adjustment works with reason
- [ ] Delete only available for Doctor

---

### Task 3.3: Prescription Server Actions
**Status:** Pending
**Estimate:** 3 hours
**Priority:** P0
**Dependencies:** 3.1

**Subtasks:**
- [ ] 3.3.1 Create `src/server/actions/prescriptions.ts`
- [ ] 3.3.2 Implement getPrescriptions action (with status filter)
- [ ] 3.3.3 Implement getPrescriptionById action
- [ ] 3.3.4 Implement addPrescriptionItems action (Doctor only)
- [ ] 3.3.5 Implement updatePrescriptionStatus action
- [ ] 3.3.6 Implement stock validation in updatePrescriptionStatus
- [ ] 3.3.7 Implement atomic stock deduction in $transaction
- [ ] 3.3.8 Implement cancelPrescription action (Doctor only)
- [ ] 3.3.9 Add Zod validation
- [ ] 3.3.10 Add audit logging

**Acceptance Criteria:**
- [ ] Status updates work correctly
- [ ] Stock deduction is atomic (all or nothing)
- [ ] Insufficient stock returns clear error
- [ ] Cancel only available for Doctor
- [ ] Audit logs created

---

### Task 3.4: Prescription UI
**Status:** Pending
**Estimate:** 3 hours
**Priority:** P0
**Dependencies:** 3.3

**Subtasks:**
- [ ] 3.4.1 Create `src/components/features/prescriptions/prescription-list.tsx`
- [ ] 3.4.2 Create `src/components/features/prescriptions/prescription-items.tsx`
- [ ] 3.4.3 Create `src/app/(dashboard)/prescriptions/page.tsx`
- [ ] 3.4.4 Create `src/app/(dashboard)/prescriptions/[id]/page.tsx`
- [ ] 3.4.5 Implement status filter
- [ ] 3.4.6 Show status badges with colors
- [ ] 3.4.7 Add status update buttons (Staff)
- [ ] 3.4.8 Add cancel button (Doctor)
- [ ] 3.4.9 Show stock info per item
- [ ] 3.4.10 Add confirmation dialog for completion

**Acceptance Criteria:**
- [ ] Prescription list displays with filters
- [ ] Status badges colored correctly
- [ ] Staff can update status
- [ ] Doctor can cancel
- [ ] Stock info visible
- [ ] Confirmation dialog before completion

---

### Task 3.5: Audit Log Implementation
**Status:** Pending
**Estimate:** 1.5 hours
**Priority:** P1
**Dependencies:** Phase 1

**Subtasks:**
- [ ] 3.5.1 Create `src/server/services/audit-service.ts`
- [ ] 3.5.2 Create `src/server/actions/audit-logs.ts`
- [ ] 3.5.3 Create `src/app/(dashboard)/audit-logs/page.tsx`
- [ ] 3.5.4 Implement filters (entity, user, date range)
- [ ] 3.5.5 Display old/new values in JSON format
- [ ] 3.5.6 Restrict to Doctor only

**Acceptance Criteria:**
- [ ] Audit logs display correctly
- [ ] Filters work
- [ ] Old/new values shown
- [ ] Staff blocked from viewing

---

### Task 3.6: Phase 3 Verification
**Status:** Pending
**Estimate:** 1.5 hours
**Priority:** P0
**Dependencies:** 3.1 - 3.5

**Subtasks:**
- [ ] 3.6.1 Test medicine CRUD
- [ ] 3.6.2 Test stock adjustment
- [ ] 3.6.3 Test prescription creation
- [ ] 3.6.4 Test stock deduction flow
- [ ] 3.6.5 Test insufficient stock error
- [ ] 3.6.6 Test prescription cancellation
- [ ] 3.6.7 Test audit logging
- [ ] 3.6.8 Check for console errors

**Acceptance Criteria:**
- [ ] All Phase 3 success criteria met
- [ ] Stock deduction atomic and correct
- [ ] Audit trail complete
- [ ] No console errors

---

## 5. Phase 4: Dashboard & Polish

### Task 4.1: Doctor Dashboard
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P1
**Dependencies:** Phase 3

**Subtasks:**
- [ ] 4.1.1 Create `src/components/features/dashboard/stats-cards.tsx`
- [ ] 4.1.2 Create `src/app/(dashboard)/dashboard/page.tsx`
- [ ] 4.1.3 Implement stats: total patients today
- [ ] 4.1.4 Implement stats: critical stock count
- [ ] 4.1.5 Implement stats: near-expiry count
- [ ] 4.1.6 Implement stats: today's revenue
- [ ] 4.1.7 Implement stats: pending prescriptions

**Acceptance Criteria:**
- [ ] Dashboard displays all stats cards
- [ ] Data is accurate
- [ ] Cards are responsive

---

### Task 4.2: Staff Dashboard
**Status:** Pending
**Estimate:** 1.5 hours
**Priority:** P1
**Dependencies:** Phase 3

**Subtasks:**
- [ ] 4.2.1 Create pending prescriptions table component
- [ ] 4.2.2 Show today's prescriptions list
- [ ] 4.2.3 Show stock alerts
- [ ] 4.2.4 Limit stats to task-focused info

**Acceptance Criteria:**
- [ ] Staff sees pending prescriptions count
- [ ] Staff sees stock alerts
- [ ] No revenue data shown

---

### Task 4.3: UI Polish
**Status:** Pending
**Estimate:** 3 hours
**Priority:** P2
**Dependencies:** 4.1, 4.2

**Subtasks:**
- [ ] 4.3.1 Add loading skeletons for all pages
- [ ] 4.3.2 Add error boundaries
- [ ] 4.3.3 Add toast notifications for all actions
- [ ] 4.3.4 Add confirmation dialogs for destructive actions
- [ ] 4.3.5 Fix responsive design issues
- [ ] 4.3.6 Add mobile navigation
- [ ] 4.3.7 Test on mobile viewport
- [ ] 4.3.8 Fix any console errors

**Acceptance Criteria:**
- [ ] Loading states on all data fetches
- [ ] Error messages displayed
- [ ] Success toasts shown
- [ ] Confirmation dialogs on delete/cancel
- [ ] Mobile-friendly

---

### Task 4.4: Phase 4 Verification
**Status:** Pending
**Estimate:** 1 hour
**Priority:** P0
**Dependencies:** 4.1 - 4.3

**Subtasks:**
- [ ] 4.4.1 Test Doctor dashboard
- [ ] 4.4.2 Test Staff dashboard
- [ ] 4.4.3 Test responsive design
- [ ] 4.4.4 Check for console errors
- [ ] 4.4.5 Full flow test

**Acceptance Criteria:**
- [ ] All Phase 4 success criteria met
- [ ] No console errors
- [ ] Responsive design working

---

## 6. Phase 5: Testing & Deployment

### Task 5.1: Testing
**Status:** Pending
**Estimate:** 4 hours
**Priority:** P1
**Dependencies:** Phase 4

**Subtasks:**
- [ ] 5.1.1 Setup Jest configuration
- [ ] 5.1.2 Write unit tests for stock deduction logic
- [ ] 5.1.3 Write unit tests for audit logging
- [ ] 5.1.4 Write unit tests for validation schemas
- [ ] 5.1.5 Write unit tests for auth utilities
- [ ] 5.1.6 Write E2E tests for login flow
- [ ] 5.1.7 Write E2E tests for prescription workflow
- [ ] 5.1.8 Run all tests and fix failures

**Acceptance Criteria:**
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No critical test failures

---

### Task 5.2: Performance Optimization
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P2
**Dependencies:** 5.1

**Subtasks:**
- [ ] 5.2.1 Optimize database queries (add select, limit)
- [ ] 5.2.2 Verify indexes are being used
- [ ] 5.2.3 Add pagination to all list views
- [ ] 5.2.4 Test with large datasets
- [ ] 5.2.5 Run Lighthouse audit

**Acceptance Criteria:**
- [ ] Lighthouse score > 80
- [ ] Page load < 2 seconds
- [ ] No N+1 query issues

---

### Task 5.3: Deployment
**Status:** Pending
**Estimate:** 2 hours
**Priority:** P0
**Dependencies:** 5.1, 5.2

**Subtasks:**
- [ ] 5.3.1 Create production build: `npm run build`
- [ ] 5.3.2 Fix any build errors
- [ ] 5.3.3 Setup Vercel account and connect repository
- [ ] 5.3.4 Configure environment variables in Vercel
- [ ] 5.3.5 Deploy to Vercel
- [ ] 5.3.6 Setup production database (Supabase/Neon)
- [ ] 5.3.7 Run Prisma migrate on production
- [ ] 5.3.8 Run seed on production
- [ ] 5.3.9 Test production deployment
- [ ] 5.3.10 Configure custom domain (optional)

**Acceptance Criteria:**
- [ ] Production build successful
- [ ] App accessible via Vercel URL
- [ ] All features working in production
- [ ] No build errors

---

## 7. Effort Summary

| Phase | Estimated Hours | Priority |
|-------|----------------|----------|
| Phase 1: Foundation & Auth | 14 hours | P0 |
| Phase 2: Patient & Medical Records | 14 hours | P0 |
| Phase 3: Inventory & Prescription | 17 hours | P0 |
| Phase 4: Dashboard & Polish | 8.5 hours | P1 |
| Phase 5: Testing & Deployment | 10 hours | P0 |
| **Total** | **63.5 hours** | |

---

## 8. Task Priority Matrix

| Priority | Tasks | Description |
|----------|-------|-------------|
| P0 | 1.1-1.9, 2.1-2.5, 3.1-3.6, 5.3 | Critical for MVP |
| P1 | 3.5, 4.1-4.2, 5.1 | Important for full functionality |
| P2 | 4.3, 5.2 | Nice to have |
| P3 | - | Can be deferred |

---

**End of Document**
