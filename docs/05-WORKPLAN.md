# Apotik-V - Phased Implementation Plan (Workplan)

**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Status:** MVP  
**Estimated Duration:** 8-10 weeks (full-time)

---

## 1. Project Timeline Overview

```
Week 1-2    ████████████████████████  Phase 1: Foundation & Auth
Week 3-4    ████████████████████████  Phase 2: Patient & Medical Records
Week 5-6    ████████████████████████  Phase 3: Inventory & Prescription
Week 7-8    ████████████████████████  Phase 4: Dashboard & Polish
Week 9-10   ████████████████████████  Phase 5: Testing & Deployment
```

---

## 2. Phase 1: Foundation & Auth

**Duration:** 2 weeks (Week 1-2)  
**Status:** Planned

### 2.1 Objectives
- Initialize Next.js 14 project with TypeScript
- Setup Prisma ORM with PostgreSQL schema
- Configure NextAuth.js v5 with database sessions
- Implement role-based access control (RBAC)
- Create base layout with sidebar navigation
- Build login page and authentication flow

### 2.2 Deliverables
- [ ] Next.js 14 project initialized
- [ ] Prisma schema created and migrated
- [ ] Database seeded with 2 test users
- [ ] NextAuth.js configured with Credentials provider
- [ ] Session strategy: Database sessions
- [ ] Middleware for route protection
- [ ] Login page functional
- [ ] Dashboard layout with sidebar
- [ ] Role-based menu items

### 2.3 Dependencies
- Node.js 20+ installed
- PostgreSQL database available
- npm/yarn/pnpm installed

### 2.4 Success Criteria
- [ ] Can login as DOCTOR (doctor@apotikv.com / password123)
- [ ] Can login as STAFF (staff@apotikv.com / password123)
- [ ] DOCTOR sees all menu items including Audit Logs
- [ ] STAFF sees limited menu (no Audit Logs)
- [ ] Unauthenticated users redirected to /login
- [ ] STAFF blocked from /audit-logs
- [ ] Session persists across page refreshes

---

## 3. Phase 2: Patient & Medical Records

**Duration:** 2 weeks (Week 3-4)  
**Status:** Planned

### 3.1 Objectives
- Implement patient CRUD (Create, Read, Update, Delete)
- Build patient list with search and pagination
- Create medical record form (SOAP format)
- Implement patient medical history timeline
- Add form validation with Zod

### 3.2 Deliverables
- [ ] Patient CRUD Server Actions
- [ ] Patient list page with search
- [ ] Patient detail page
- [ ] Create patient form
- [ ] Edit patient form (Doctor only)
- [ ] Delete patient (Doctor only, with confirmation)
- [ ] Medical record form (SOAP)
- [ ] Medical record timeline view
- [ ] Auto-create prescription from medical record
- [ ] Form validation (Zod)

### 3.3 Dependencies
- Phase 1 completed
- Authentication working
- Middleware functional

### 3.4 Success Criteria
- [ ] Can create new patient
- [ ] Can search patients by name/phone
- [ ] Can view patient list with pagination
- [ ] Can view patient details with medical history
- [ ] Doctor can edit patient info
- [ ] Doctor can delete patient (with confirmation)
- [ ] Staff cannot edit/delete patients
- [ ] Can create medical record with SOAP format
- [ ] Medical record linked to patient
- [ ] Timeline shows visit history sorted by date
- [ ] Form validation shows errors

---

## 4. Phase 3: Inventory & Prescription

**Duration:** 2 weeks (Week 5-6)  
**Status:** Planned

### 4.1 Objectives
- Implement medicine inventory CRUD
- Build inventory list with alerts (low stock, near expiry)
- Create prescription form with dynamic items
- Implement stock validation and auto-deduction
- Build audit trail system

### 4.2 Deliverables
- [ ] Medicine CRUD Server Actions
- [ ] Inventory list with search/filter
- [ ] Inventory alerts (low stock, near expiry)
- [ ] Create medicine form
- [ ] Edit medicine form
- [ ] Stock adjustment with audit logging
- [ ] Prescription form with dynamic items
- [ ] Real-time stock check during prescription
- [ ] Prescription status update (Staff)
- [ ] Prescription cancellation (Doctor)
- [ ] Auto stock deduction on COMPLETED
- [ ] Audit log for all critical operations
- [ ] Audit log viewer (Doctor only)

### 4.3 Dependencies
- Phase 2 completed
- Patient management working
- Medical records working

### 4.4 Success Criteria
- [ ] Can add new medicine to inventory
- [ ] Can search/filter medicines
- [ ] Low stock items highlighted (red)
- [ ] Near-expiry items highlighted (yellow)
- [ ] Can adjust stock with reason
- [ ] Can create prescription from medical record
- [ ] Dynamic add/remove items in prescription
- [ ] Stock check prevents insufficient stock
- [ ] Status update works (PENDING -> PROCESSED -> COMPLETED)
- [ ] Stock auto-deducted on COMPLETED
- [ ] Doctor can cancel prescription
- [ ] Audit logs show all changes with old/new values
- [ ] Staff cannot view audit logs

---

## 5. Phase 4: Dashboard & Polish

**Duration:** 2 weeks (Week 7-8)  
**Status:** Planned

### 5.1 Objectives
- Build role-specific dashboards
- Add statistics cards and metrics
- Implement pending prescriptions table (Staff)
- Polish UI/UX across all pages
- Add loading states and error handling

### 5.2 Deliverables
- [ ] Doctor dashboard with full stats
- [ ] Staff dashboard with task focus
- [ ] Statistics cards (patients, stock, expiry)
- [ ] Pending prescriptions table (Staff)
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Confirmation dialogs
- [ ] Responsive design fixes
- [ ] Mobile navigation

### 5.3 Dependencies
- Phase 3 completed
- All CRUD operations working
- Audit trail functional

### 5.4 Success Criteria
- [ ] Doctor sees total patients, critical stock, near-expiry, revenue
- [ ] Staff sees pending prescriptions count and list
- [ ] Low stock count displayed
- [ ] Near-expiry count displayed
- [ ] Loading states on all data fetches
- [ ] Error messages displayed clearly
- [ ] Success toasts on operations
- [ ] Confirmation dialogs on delete/cancel
- [ ] Mobile-friendly layout
- [ ] No console errors

---

## 6. Phase 5: Testing & Deployment

**Duration:** 2 weeks (Week 9-10)  
**Status:** Planned

### 6.1 Objectives
- Write unit tests for critical functions
- Perform end-to-end testing
- Optimize performance
- Deploy to production
- Create deployment documentation

### 6.2 Deliverables
- [ ] Unit tests for Server Actions
- [ ] Unit tests for stock deduction logic
- [ ] Unit tests for audit logging
- [ ] E2E test for login flow
- [ ] E2E test for prescription workflow
- [ ] Performance optimization
- [ ] Production build tested
- [ ] Vercel deployment configured
- [ ] Database migrated to production
- [ ] Environment variables set
- [ ] Deployment documentation

### 6.3 Dependencies
- Phase 4 completed
- All features functional
- No critical bugs

### 6.4 Success Criteria
- [ ] All unit tests pass
- [ ] E2E tests pass
- [ ] Lighthouse score > 80
- [ ] No critical bugs
- [ ] Production build successful
- [ ] App accessible via production URL
- [ ] All features working in production

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database setup issues | Medium | High | Use managed PostgreSQL (Supabase/Neon) |
| NextAuth v5 API changes | Low | Medium | Follow official docs, pin version |
| Prisma migration errors | Medium | Medium | Test migrations on dev first |
| Stock deduction race condition | Low | High | Use database transactions |
| Performance issues | Medium | Medium | Optimize queries, add indexes |
| Mobile responsiveness | Low | Low | Test on multiple devices |

---

## 8. Milestones

| Milestone | Target Date | Criteria |
|-----------|-------------|----------|
| M1: Foundation Ready | End of Week 2 | Auth working, base layout done |
| M2: Patient Management | End of Week 4 | CRUD working, forms validated |
| M3: Core Features | End of Week 6 | Inventory + Prescription + Audit |
| M4: Dashboard Ready | End of Week 8 | All UI complete, polished |
| M5: Production Launch | End of Week 10 | Deployed and functional |

---

## 9. Communication Plan

- **Daily Standup:** Quick sync on progress/blockers
- **Weekly Review:** Demo completed features
- **Phase Review:** Full review before moving to next phase
- **Documentation:** Update docs at each milestone

---

**End of Document**
