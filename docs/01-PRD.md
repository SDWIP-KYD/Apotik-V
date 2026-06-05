# Apotik-V - Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** MVP (Minimum Viable Product)  
**Last Updated:** 2026-02-07  
**Project Name:** Apotik-V  
**Document Owner:** Development Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Target Users & Personas](#4-target-users--personas)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Business Rules](#8-business-rules)
9. [Role-Based Access Control Matrix](#9-role-based-access-control-matrix)
10. [Out of Scope](#10-out-of-scope)
11. [Success Metrics](#11-success-metrics)
12. [Assumptions & Constraints](#12-assumptions--constraints)
13. [Glossary](#13-glossary)

---

## 1. Executive Summary

### 1.1 Project Vision
Apotik-V adalah aplikasi web full-stack yang dirancang khusus untuk manajemen apotik dan rekam medis elektronik. Sistem ini bertujuan untuk mendigitalisasi operasional apotik skala kecil hingga menengah, dengan fokus pada integritas data medis, sinkronisasi stok real-time, dan jejak audit yang ketat.

### 1.2 Mission Statement
Menyediakan solusi terintegrasi yang memudahkan dokter dan staf apotek dalam mengelola pasien, rekam medis, inventori obat, dan resep dengan efisiensi tinggi dan akurasi data terjamin.

### 1.3 Key Value Proposition
- **Integrated System:** Menggabungkan manajemen pasien, rekam medis, inventori, dan resep dalam satu platform
- **Real-time Stock Management:** Sinkronisasi stok otomatis dengan validasi real-time
- **Audit Trail:** Jejak audit lengkap untuk semua operasi kritis
- **Role-Based Access:** Kontrol akses berbasis peran untuk keamanan data
- **User-Friendly Interface:** Antarmuka yang intuitif dan responsif

### 1.4 Target Market
- Apotik tunggal (single-location pharmacy)
- Klinik kecil dengan apotek internal
- Praktik dokter mandiri dengan apotek
- Target: 10-50 apotik/klinik dalam 12 bulan pertama

---

## 2. Problem Statement

### 2.1 Current Pain Points

#### 2.1.1 Manual Stock Tracking
- Pencatatan stok obat dilakukan secara manual menggunakan spreadsheet atau buku
- Sering terjadi selisih antara stok fisik dan catatan
- Tidak ada peringatan otomatis untuk stok menipis atau obat mendekati kedaluwarsa
- Proses stock opname memakan waktu lama dan rentan error

#### 2.1.2 Fragmented Medical Records
- Rekam medis pasien tersimpan dalam format kertas atau sistem terpisah
- Sulit mencari riwayat kunjungan pasien
- Tidak ada struktur standar untuk dokumentasi medis
- Risiko kehilangan data medis

#### 2.1.3 Prescription Management Issues
- Proses resep manual rentan terhadap kesalahan
- Tidak ada validasi stok saat membuat resep
- Sulit melacak status resep (siap, sedang diproses, selesai)
- Tidak ada jejak audit untuk perubahan resep

#### 2.1.4 Lack of Oversight & Accountability
- Tidak ada sistem untuk melacak siapa melakukan perubahan apa
- Sulit mengidentifikasi kesalahan atau penyalahgunaan
- Tidak ada laporan otomatis untuk manajemen
- Compliance terhadap regulasi kesehatan sulit dibuktikan

#### 2.1.5 Inefficient Workflow
- Komunikasi antara dokter dan staf apotek tidak terstruktur
- Duplikasi data entry
- Waktu proses resep lama
- Sulit memantau performa operasional

### 2.2 Business Impact
- **Financial Loss:** Kerugian akibat obat kedaluwarsa tidak terdeteksi
- **Patient Safety:** Risiko kesalahan pemberian obat
- **Operational Inefficiency:** Waktu terbuang untuk proses manual
- **Compliance Risk:** Kesulitan memenuhi regulasi kesehatan
- **Poor Customer Experience:** Waktu tunggu lama untuk resep

---

## 3. Solution Overview

### 3.1 Apotik-V as Integrated Solution

Apotik-V adalah platform web-based yang mengintegrasikan semua aspek operasional apotik:

```
┌─────────────────────────────────────────────────────────┐
│                    APOTIK-V SYSTEM                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Patient    │  │   Medical    │  │  Prescription│ │
│  │  Management  │  │   Records    │  │  Management  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│           │                  │                  │       │
│           └──────────────────┼──────────────────┘       │
│                              │                          │
│                    ┌─────────▼─────────┐               │
│                    │   Inventory Mgmt  │               │
│                    │   (Real-time)     │               │
│                    └─────────┬─────────┘               │
│                              │                          │
│                    ┌─────────▼─────────┐               │
│                    │   Audit Trail     │               │
│                    │   (All Changes)   │               │
│                    └───────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Key Features Summary

#### 3.2.1 Patient Management
- Registrasi pasien baru dengan data lengkap
- Pencarian dan filter pasien
- Riwayat kunjungan per pasien
- Catatan alergi untuk keselamatan

#### 3.2.2 Medical Records (SOAP Format)
- Dokumentasi medis terstruktur (Subjective, Objective, Assessment, Plan)
- Timeline riwayat medis pasien
- Link langsung ke resep
- Akses berbasis peran

#### 3.2.3 Inventory Management
- Database obat lengkap dengan detail batch
- Tracking stok real-time
- Alert untuk stok menipis
- Alert untuk obat mendekati kedaluwarsa
- Penyesuaian stok manual

#### 3.2.4 Prescription Management
- Pembuatan resep dari rekam medis
- Multi-item prescription
- Validasi stok real-time
- Auto-deduction stok saat resep selesai
- Status tracking (PENDING, PROCESSED, COMPLETED, CANCELLED)

#### 3.2.5 Dashboard & Analytics
- Dashboard role-specific
- Statistik real-time
- Alert dan notifikasi
- Tabel antrian resep

#### 3.2.6 Audit Trail
- Logging semua operasi kritis
- Penyimpanan old/new values
- Filter dan search logs
- Immutable records

### 3.3 Benefits

#### For Doctor (Owner)
- **Full Oversight:** Monitor semua aspek operasional dari satu dashboard
- **Better Decision Making:** Data real-time untuk keputusan stok dan operasional
- **Compliance:** Audit trail untuk memenuhi regulasi
- **Efficiency:** Kurangi waktu administrasi, fokus ke pasien
- **Patient Safety:** Validasi stok dan catatan alergi

#### For Staff (Asisten Apoteker)
- **Clear Workflow:** Status resep yang jelas
- **Efficient Processing:** Proses resep lebih cepat
- **Stock Visibility:** Lihat stok real-time
- **Reduced Errors:** Validasi otomatis mencegah kesalahan
- **Better Communication:** Sistem terintegrasi dengan dokter

---

## 4. Target Users & Personas

### 4.1 Persona: Doctor (Owner)

#### Profile
- **Name:** Dr. Andi Pratama
- **Age:** 35-50 years old
- **Role:** Owner & Primary Doctor
- **Education:** Medical degree with pharmacy practice license
- **Tech Proficiency:** Medium (comfortable with web apps, not tech expert)

#### Goals
- Menyediakan layanan kesehatan yang efisien dan berkualitas
- Mengontrol operasional apotik dengan baik
- Memastikan stok obat selalu tersedia
- Memenuhi regulasi kesehatan dan compliance
- Meningkatkan kepuasan pasien

#### Pain Points
- Tidak punya visibility terhadap stok obat
- Sulit melacak riwayat pasien
- Tidak tahu siapa yang melakukan perubahan apa
- Waktu habis untuk administrasi
- Khawatir tentang obat kedaluwarsa

#### Needs
- Dashboard yang memberikan overview operasional
- Sistem rekam medis yang terstruktur
- Alert untuk stok kritis dan obat ED
- Audit trail untuk accountability
- Akses mudah dari mana saja

#### Behavior Patterns
- Cek dashboard di pagi hari untuk lihat statistik
- Buat rekam medis setelah konsultasi
- Review resep sebelum difinalisasi
- Cek audit logs mingguan
- Butuh laporan bulanan

#### Quote
> "Saya butuh sistem yang bisa saya percaya untuk mengelola apotik saya, sehingga saya bisa fokus melayani pasien."

---

### 4.2 Persona: Staff (Asisten Apoteker)

#### Profile
- **Name:** Budi Santoso
- **Age:** 20-35 years old
- **Role:** Pharmacy Assistant
- **Education:** Vocational pharmacy school (SMK Farmasi/D3 Farmasi)
- **Tech Proficiency:** Medium-High (digital native, quick learner)

#### Goals
- Memproses resep dengan cepat dan akurat
- Menjaga ketersediaan stok obat
- Membantu dokter dalam operasional
- Mencegah kesalahan dalam pemberian obat
- Bekerja efisien dengan workflow yang jelas

#### Pain Points
- Sering kehabisan stok tanpa peringatan
- Sulit mencari informasi pasien
- Tidak tahu status resep yang sedang diproses
- Manual tracking stok memakan waktu
- Komunikasi dengan dokter tidak terstruktur

#### Needs
- List resep yang perlu diproses
- Informasi stok real-time
- Data pasien yang mudah diakses
- Status tracking yang jelas
- Alert untuk stok menipis

#### Behavior Patterns
- Cek daftar resep pending di awal shift
- Proses resep satu per satu
- Update status resep secara real-time
- Cek stok sebelum ambil obat
- Laporkan stok menipis ke dokter

#### Quote
> "Saya butuh sistem yang membuat pekerjaan saya lebih mudah dan mencegah saya membuat kesalahan."

---

## 5. User Stories

### 5.1 Doctor (Owner) Stories

#### Authentication & Dashboard
**US-D01:** As a doctor, I want to login with my email and password so that I can access the system securely.
- **Acceptance Criteria:**
  - Login form validates email format
  - Password minimum 6 characters
  - Invalid credentials show error message
  - Successful login redirects to dashboard
  - Session persists for 30 days

**US-D02:** As a doctor, I want to view a dashboard with key metrics so that I can monitor clinic performance at a glance.
- **Acceptance Criteria:**
  - Dashboard shows total patients today
  - Dashboard shows critical stock items count
  - Dashboard shows near-expiry items count
  - Dashboard shows revenue statistics
  - Data refreshes automatically

#### Patient Management
**US-D03:** As a doctor, I want to create new patient records so that I can maintain a comprehensive patient database.
- **Acceptance Criteria:**
  - Form captures all required patient information
  - Form validates data (email format, date format)
  - Allergies field is prominently displayed
  - System tracks who created the record
  - Success message shown after creation

**US-D04:** As a doctor, I want to view a list of all patients with search and filter capabilities so that I can quickly find patient information.
- **Acceptance Criteria:**
  - List shows all patients with basic info
  - Search by name or phone number
  - Filter by date range
  - Pagination for large lists
  - Click to view patient details

**US-D05:** As a doctor, I want to update patient information so that records stay current and accurate.
- **Acceptance Criteria:**
  - All patient fields are editable
  - Changes are validated
  - Audit log records the change
  - Success message shown after update

**US-D06:** As a doctor, I want to delete patient records (with caution) so that I can remove incorrect or duplicate entries.
- **Acceptance Criteria:**
  - Confirmation dialog before deletion
  - Cannot delete if patient has medical records
  - Audit log records the deletion
  - Soft delete recommended

#### Medical Records
**US-D07:** As a doctor, I want to create medical records using SOAP format so that I can document patient consultations in a structured way.
- **Acceptance Criteria:**
  - Form has sections for S, O, A, P
  - Can link to existing patient
  - Auto-populate patient info
  - Save as draft or finalize
  - Timestamp recorded

**US-D08:** As a doctor, I want to view a patient's medical history timeline so that I can make informed decisions during consultations.
- **Acceptance Criteria:**
  - Timeline shows all past visits
  - Sorted by date (newest first)
  - Shows summary of each visit
  - Click to view full details
  - Includes prescriptions

**US-D09:** As a doctor, I want to update medical records so that I can correct or add information after the initial consultation.
- **Acceptance Criteria:**
  - All SOAP fields are editable
  - Changes are validated
  - Audit log records the change
  - Original values preserved in audit

#### Prescription Management
**US-D10:** As a doctor, I want to create prescriptions with real-time stock validation so that I can avoid prescribing out-of-stock medications.
- **Acceptance Criteria:**
  - Dynamic form to add multiple medicines
  - Real-time stock display for each medicine
  - Warning if stock < requested quantity
  - Cannot finalize if insufficient stock
  - Auto-link to medical record

**US-D11:** As a doctor, I want to view all prescriptions with status tracking so that I can monitor prescription processing.
- **Acceptance Criteria:**
  - List shows all prescriptions
  - Filter by status, date, patient
  - Shows who created and processed
  - Click to view details
  - Status badges with colors

**US-D12:** As a doctor, I want to cancel prescriptions so that I can prevent processing of incorrect or outdated prescriptions.
- **Acceptance Criteria:**
  - Can cancel PENDING or PROCESSED prescriptions
  - Cannot cancel COMPLETED prescriptions
  - Reason for cancellation required
  - Audit log records the cancellation
  - Stock not affected if cancelled

#### Inventory Management
**US-D13:** As a doctor, I want to manage medicine inventory so that I can maintain accurate stock levels.
- **Acceptance Criteria:**
  - Add new medicines with all details
  - Edit existing medicine information
  - Delete medicines (if not in active prescriptions)
  - Batch number tracking
  - Expiry date tracking

**US-D14:** As a doctor, I want to receive alerts for low stock items so that I can reorder in time.
- **Acceptance Criteria:**
  - Alert when stock ≤ minimum threshold
  - Visual indicator on inventory list
  - Dashboard shows critical stock count
  - Email notification (future)

**US-D15:** As a doctor, I want to receive alerts for near-expiry medicines so that I can manage expiring stock.
- **Acceptance Criteria:**
  - Alert when expiry date < 30 days
  - Visual indicator on inventory list
  - Dashboard shows near-expiry count
  - Sorted by expiry date

**US-D16:** As a doctor, I want to adjust stock manually so that I can correct discrepancies from stock opname.
- **Acceptance Criteria:**
  - Form to add or reduce stock
  - Reason for adjustment required
  - Audit log records the adjustment
  - Cannot go below zero

#### Audit Trail
**US-D17:** As a doctor, I want to view audit logs so that I can track all system changes and maintain accountability.
- **Acceptance Criteria:**
  - List all logged actions
  - Filter by user, entity, date range
  - Shows old and new values
  - Timestamp for each action
  - Cannot be edited or deleted

---

### 5.2 Staff (Asisten) Stories

#### Authentication & Dashboard
**US-S01:** As a staff, I want to login with my credentials so that I can access the system.
- **Acceptance Criteria:**
  - Same as US-D01
  - Redirect to staff-specific dashboard

**US-S02:** As a staff, I want to view a dashboard with my tasks for the day so that I can prioritize my work.
- **Acceptance Criteria:**
  - Shows pending prescriptions count
  - Shows stock alerts
  - Shows today's prescriptions list
  - Does not show revenue data

#### Patient Management
**US-S03:** As a staff, I want to register new patients so that they can be added to the system when the doctor is unavailable.
- **Acceptance Criteria:**
  - Same form as doctor
  - Cannot edit or delete patients
  - System tracks who created the record

**US-S04:** As a staff, I want to view patient records so that I can assist the doctor during consultations.
- **Acceptance Criteria:**
  - Read-only access to patient data
  - Can search and filter
  - Can view medical history
  - Cannot modify records

#### Prescription Management
**US-S05:** As a staff, I want to view a list of pending prescriptions so that I can process them in order.
- **Acceptance Criteria:**
  - List shows PENDING and PROCESSED prescriptions
  - Sorted by creation date
  - Shows patient name and medicine count
  - Click to view details

**US-S06:** As a staff, I want to process prescriptions so that I can prepare the medicines for pickup.
- **Acceptance Criteria:**
  - View prescription details
  - See medicine list with quantities
  - Update status: PENDING → PROCESSED
  - Update status: PROCESSED → COMPLETED
  - Stock auto-deducted on COMPLETED

**US-S07:** As a staff, I want to see real-time stock information so that I can verify availability before processing prescriptions.
- **Acceptance Criteria:**
  - Stock quantity shown for each medicine
  - Warning if stock insufficient
  - Cannot complete if stock < required
  - Can view full inventory

#### Inventory Management
**US-S08:** As a staff, I want to view inventory with alerts so that I can inform the doctor about stock issues.
- **Acceptance Criteria:**
  - View all medicines
  - See low stock alerts
  - See near-expiry alerts
  - Cannot delete medicines
  - Can add new medicines

**US-S09:** As a staff, I want to adjust stock so that I can help maintain accurate inventory records.
- **Acceptance Criteria:**
  - Same as US-D16
  - Audit log records who made adjustment

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization

**FR-A01:** System shall support login with email and password
- **Priority:** P0 (Critical)
- **Validation:** Email format, password min 6 chars
- **Security:** Bcrypt hashing, rate limiting

**FR-A02:** System shall support two user roles: DOCTOR and STAFF
- **Priority:** P0 (Critical)
- **Implementation:** Enum in database, role-based middleware

**FR-A03:** System shall enforce role-based access control (RBAC)
- **Priority:** P0 (Critical)
- **Implementation:** Middleware + server-side checks

**FR-A04:** System shall maintain session with 30-day expiration
- **Priority:** P1 (High)
- **Implementation:** Database sessions

**FR-A05:** System shall log all authentication attempts
- **Priority:** P2 (Medium)
- **Implementation:** Audit log for login/logout

---

### 6.2 Patient Management

**FR-P01:** System shall allow creating new patient records
- **Priority:** P0 (Critical)
- **Fields:** Name, DOB, Gender, Phone, Address, Allergies
- **Validation:** Required fields, date format

**FR-P02:** System shall allow viewing patient list with search/filter
- **Priority:** P0 (Critical)
- **Features:** Search by name/phone, filter by date, pagination

**FR-P03:** System shall allow viewing patient details
- **Priority:** P0 (Critical)
- **Display:** All patient info, medical history, prescriptions

**FR-P04:** System shall allow updating patient information (DOCTOR only)
- **Priority:** P1 (High)
- **Restriction:** DOCTOR role only
- **Audit:** Log all changes

**FR-P05:** System shall allow deleting patient records (DOCTOR only)
- **Priority:** P2 (Medium)
- **Restriction:** DOCTOR role only
- **Safety:** Cannot delete if has medical records
- **Audit:** Log deletion

**FR-P06:** System shall store patient allergies for safety
- **Priority:** P0 (Critical)
- **Display:** Prominent display in all patient views
- **Alert:** Warning when prescribing

**FR-P07:** System shall track who created each patient record
- **Priority:** P1 (High)
- **Implementation:** createdBy relation to User

---

### 6.3 Medical Records (SOAP)

**FR-M01:** System shall allow creating medical records in SOAP format
- **Priority:** P0 (Critical)
- **Sections:** Subjective, Objective, Assessment, Plan
- **Link:** Auto-link to patient

**FR-M02:** System shall link medical records to patients
- **Priority:** P0 (Critical)
- **Implementation:** Foreign key relation
- **Validation:** Patient must exist

**FR-M03:** System shall display patient medical history timeline
- **Priority:** P0 (Critical)
- **Sort:** Newest first
- **Display:** Summary with expand option

**FR-M04:** System shall allow updating medical records (DOCTOR only)
- **Priority:** P1 (High)
- **Restriction:** DOCTOR role only
- **Audit:** Log all changes with old/new values

**FR-M05:** System shall track which doctor created each record
- **Priority:** P1 (High)
- **Implementation:** doctorId relation to User

**FR-M06:** System shall automatically create prescription from medical record
- **Priority:** P0 (Critical)
- **Flow:** Create medical record → Create prescription
- **Link:** One-to-one relation

---

### 6.4 Inventory Management

**FR-I01:** System shall allow creating new medicine entries
- **Priority:** P0 (Critical)
- **Fields:** Name, Category, Unit, Stock, Threshold, Expiry, Batch, Price
- **Validation:** Required fields, positive numbers

**FR-I02:** System shall allow viewing inventory with search/filter
- **Priority:** P0 (Critical)
- **Features:** Search by name, filter by category, sort by stock/expiry

**FR-I03:** System shall allow updating medicine details
- **Priority:** P0 (Critical)
- **Audit:** Log all changes
- **Restriction:** Cannot change if in active prescription

**FR-I04:** System shall allow deleting medicines (DOCTOR only)
- **Priority:** P2 (Medium)
- **Restriction:** DOCTOR role only
- **Safety:** Cannot delete if in active prescriptions
- **Audit:** Log deletion

**FR-I05:** System shall track stock quantity in real-time
- **Priority:** P0 (Critical)
- **Update:** Auto-update on prescription completion
- **Display:** Real-time in all views

**FR-I06:** System shall allow manual stock adjustment
- **Priority:** P1 (High)
- **Features:** Add or reduce stock
- **Validation:** Cannot go below zero
- **Audit:** Log adjustment with reason

**FR-I07:** System shall highlight low stock items (≤ minThreshold)
- **Priority:** P1 (High)
- **Visual:** Red badge or highlight
- **Dashboard:** Count in doctor dashboard

**FR-I08:** System shall highlight near-expiry items (< 30 days)
- **Priority:** P1 (High)
- **Visual:** Yellow badge or highlight
- **Dashboard:** Count in doctor dashboard
- **Sort:** By expiry date

**FR-I09:** System shall track batch numbers for traceability
- **Priority:** P1 (High)
- **Display:** In inventory and prescription details
- **Audit:** Track batch in stock adjustments

---

### 6.5 Prescription Management

**FR-R01:** System shall allow creating prescriptions from medical records
- **Priority:** P0 (Critical)
- **Link:** Auto-link to medical record and patient
- **Validation:** Medical record must exist

**FR-R02:** System shall support multiple items per prescription
- **Priority:** P0 (Critical)
- **Features:** Dynamic form to add/remove items
- **Fields:** Medicine, Dosage, Quantity, Notes

**FR-R03:** System shall validate stock availability before finalization
- **Priority:** P0 (Critical)
- **Check:** Real-time stock check for all items
- **Error:** Show which items have insufficient stock
- **Prevent:** Cannot finalize if any item insufficient

**FR-R04:** System shall auto-deduct stock when prescription is completed
- **Priority:** P0 (Critical)
- **Trigger:** Status change to COMPLETED
- **Transaction:** Atomic transaction (all or nothing)
- **Validation:** Re-check stock before deduction

**FR-R05:** System shall track prescription status
- **Priority:** P0 (Critical)
- **Statuses:** PENDING, PROCESSED, COMPLETED, CANCELLED
- **Transitions:** 
  - PENDING → PROCESSED (Staff)
  - PROCESSED → COMPLETED (Staff)
  - PENDING/PROCESSED → CANCELLED (Doctor)

**FR-R06:** System shall allow staff to update prescription status
- **Priority:** P0 (Critical)
- **Restriction:** Staff can only update status
- **Validation:** Valid status transitions only

**FR-R07:** System shall track who created and processed each prescription
- **Priority:** P1 (High)
- **Fields:** createdById, processedById
- **Display:** In prescription details and list

**FR-R08:** System shall prevent stock deduction if insufficient quantity
- **Priority:** P0 (Critical)
- **Check:** Before status change to COMPLETED
- **Error:** Clear message with item names
- **Rollback:** Transaction rollback if any item insufficient

---

### 6.6 Dashboard & Analytics

**FR-DA01:** System shall display role-specific dashboards
- **Priority:** P0 (Critical)
- **Doctor:** Full statistics
- **Staff:** Task-focused view

**FR-DA02:** Doctor dashboard shall show comprehensive statistics
- **Priority:** P1 (High)
- **Metrics:**
  - Total patients today
  - Critical stock items count
  - Near-expiry items count
  - Revenue (today/week/month)
  - Pending prescriptions

**FR-DA03:** Staff dashboard shall show task-focused information
- **Priority:** P1 (High)
- **Metrics:**
  - Pending prescriptions count
  - Stock alerts count
  - Today's prescriptions list

**FR-DA04:** System shall display pending prescriptions table for staff
- **Priority:** P0 (Critical)
- **Columns:** Patient, Medicine count, Created time, Status
- **Actions:** Click to process
- **Sort:** By creation date

**FR-DA05:** System shall show real-time statistics
- **Priority:** P1 (High)
- **Update:** Auto-refresh or manual refresh button
- **Performance:** Optimized queries

---

### 6.7 Audit Trail

**FR-AU01:** System shall log all CREATE, UPDATE, DELETE operations
- **Priority:** P0 (Critical)
- **Entities:** Prescription, Medicine, MedicalRecord, Patient
- **Trigger:** Automatic on operation

**FR-AU02:** System shall store old and new values in JSON format
- **Priority:** P0 (Critical)
- **Format:** JSON with field names and values
- **Storage:** oldValues and newValues columns

**FR-AU03:** System shall record user ID and timestamp
- **Priority:** P0 (Critical)
- **Fields:** userId, timestamp
- **Accuracy:** Server-side timestamp

**FR-AU04:** System shall allow doctor to view audit logs
- **Priority:** P1 (High)
- **Restriction:** DOCTOR role only
- **Features:** Filter by user, entity, date range

**FR-AU05:** System shall filter logs by entity, user, date range
- **Priority:** P1 (High)
- **Filters:**
  - Entity type (Patient, Medicine, etc.)
  - User (who performed action)
  - Date range
  - Action type (CREATE, UPDATE, DELETE)

**FR-AU06:** Audit logs shall be immutable
- **Priority:** P0 (Critical)
- **Restriction:** No UPDATE or DELETE on AuditLog table
- **Implementation:** Database constraints + application logic

---

## 7. Non-Functional Requirements

### 7.1 Performance

**NFR-P01:** Page load time < 2 seconds
- **Measurement:** Time to Interactive (TTI)
- **Target:** < 2s on 3G connection
- **Optimization:** Code splitting, lazy loading, image optimization

**NFR-P02:** API response time < 500ms
- **Measurement:** Server response time
- **Target:** < 500ms for 95% of requests
- **Optimization:** Database indexing, query optimization, caching

**NFR-P03:** Support 50 concurrent users
- **Measurement:** Concurrent active sessions
- **Target:** 50 users without degradation
- **Testing:** Load testing with k6 or similar

**NFR-P04:** Database queries optimized with indexes
- **Measurement:** Query execution time
- **Target:** < 100ms for most queries
- **Implementation:** Indexes on foreign keys, frequently filtered fields

---

### 7.2 Security

**NFR-S01:** Passwords hashed with bcrypt (10 rounds)
- **Algorithm:** bcrypt
- **Rounds:** 10 (configurable)
- **Storage:** Hash only, never plain text

**NFR-S02:** CSRF protection enabled
- **Implementation:** NextAuth.js built-in CSRF tokens
- **Validation:** Token validation on all mutations

**NFR-S03:** XSS prevention with input sanitization
- **Implementation:** React auto-escaping, CSP headers
- **Validation:** Sanitize all user inputs

**NFR-S04:** SQL injection prevention with Prisma ORM
- **Implementation:** Parameterized queries via Prisma
- **Validation:** Never use raw SQL with user input

**NFR-S05:** Role-based access control enforced
- **Implementation:** Middleware + server-side checks
- **Validation:** Check role on every protected route/action

**NFR-S06:** Audit trail for all critical operations
- **Coverage:** 100% of CREATE, UPDATE, DELETE operations
- **Integrity:** Immutable logs
- **Retention:** Minimum 1 year

---

### 7.3 Scalability

**NFR-SC01:** Modular architecture for future features
- **Design:** Feature-based folder structure
- **Implementation:** Server Actions for easy extension
- **Testing:** Modular tests per feature

**NFR-SC02:** Database designed for 10,000+ patients
- **Schema:** Normalized with proper indexes
- **Optimization:** Query optimization, pagination
- **Testing:** Load testing with large datasets

**NFR-SC03:** API designed for future mobile app integration
- **Design:** RESTful principles
- **Documentation:** OpenAPI/Swagger (future)
- **Versioning:** API versioning strategy

---

### 7.4 Usability

**NFR-U01:** Responsive design (mobile, tablet, desktop)
- **Breakpoints:** Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Testing:** Cross-browser testing
- **Accessibility:** WCAG 2.1 AA compliance

**NFR-U02:** Consistent UI with Shadcn components
- **Components:** Shadcn UI library
- **Consistency:** Design system with tokens
- **Documentation:** Component documentation

**NFR-U03:** Intuitive navigation with sidebar
- **Design:** Collapsible sidebar
- **Logic:** Role-based menu items
- **Feedback:** Active state indicators

**NFR-U04:** Clear error messages and validation feedback
- **Style:** User-friendly, actionable messages
- **Placement:** Inline validation, toast notifications
- **Language:** Clear, non-technical language

---

## 8. Business Rules

### 8.1 Stock Deduction Logic

**BR-S01:** Stock deduction ONLY when prescription status changes to COMPLETED
- **Trigger:** Status transition to COMPLETED
- **Timing:** After validation, before status update
- **Scope:** All items in prescription

**BR-S02:** Transaction must be atomic (all or nothing)
- **Implementation:** Prisma `$transaction`
- **Rollback:** If any step fails, entire transaction rolls back
- **Consistency:** Database remains consistent

**BR-S03:** If any item has insufficient stock, entire transaction fails
- **Check:** Before deduction, check all items
- **Error:** List all items with insufficient stock
- **Action:** No partial deductions

**BR-S04:** Stock deduction sequence
```
1. Validate all items have sufficient stock
   - Loop through all PrescriptionItems
   - Check Medicine.stockQty >= PrescriptionItem.quantity
   - If any fail, return error with list

2. Begin transaction

3. Deduct stock for each item
   - For each PrescriptionItem:
     - Medicine.stockQty -= PrescriptionItem.quantity
     - Update Medicine record

4. Update prescription status to COMPLETED
   - Prescription.status = COMPLETED
   - Prescription.processedById = currentUserId
   - Prescription.updatedAt = now()

5. Create audit log entry
   - Action: PRESCRIPTION_COMPLETED
   - Entity: Prescription
   - Old values: { status: PROCESSED }
   - New values: { status: COMPLETED }

6. Commit transaction

7. If any step fails:
   - Rollback entire transaction
   - Return error message
   - No changes persisted
```

---

### 8.2 Audit Trail Requirements

**BR-A01:** Log ALL updates to: Prescription, Medicine, MedicalRecord
- **Trigger:** Any UPDATE operation
- **Data:** Old values, new values, user, timestamp
- **Storage:** AuditLog table

**BR-A02:** Log ALL deletes to: Prescription, Medicine, MedicalRecord, Patient
- **Trigger:** Any DELETE operation
- **Data:** Deleted values, user, timestamp
- **Storage:** AuditLog table

**BR-A03:** Store complete old and new values in JSON
- **Format:** JSON object with field names as keys
- **Example:**
  ```json
  {
    "oldValues": { "stockQty": 100, "price": 5000 },
    "newValues": { "stockQty": 90, "price": 5500 }
  }
  ```

**BR-A04:** Include userId, action, entity, entityId, timestamp
- **Fields:**
  - userId: Who performed the action
  - action: CREATE, UPDATE, DELETE
  - entity: Table name (Patient, Medicine, etc.)
  - entityId: ID of the affected record
  - timestamp: When the action occurred

**BR-A05:** Audit logs are immutable (cannot be deleted/updated)
- **Restriction:** No UPDATE or DELETE on AuditLog
- **Implementation:** Database constraint + application logic
- **Exception:** Only system admin can purge old logs (future)

---

### 8.3 Prescription Workflow

**BR-P01:** Prescription created with status PENDING
- **Default:** status = PENDING
- **Creator:** Doctor who created medical record
- **Timestamp:** createdAt = now()

**BR-P02:** Staff can change status: PENDING → PROCESSED → COMPLETED
- **Transitions:**
  - PENDING → PROCESSED: Staff starts processing
  - PROCESSED → COMPLETED: Staff finishes, stock deducted
- **Restriction:** Cannot skip steps
- **Audit:** Log each transition

**BR-P03:** Doctor can cancel: PENDING/PROCESSED → CANCELLED
- **Transitions:**
  - PENDING → CANCELLED: Before processing starts
  - PROCESSED → CANCELLED: During processing
- **Restriction:** Cannot cancel COMPLETED
- **Reason:** Cancellation reason required
- **Audit:** Log cancellation with reason

**BR-P04:** COMPLETED prescriptions cannot be modified
- **Restriction:** No updates to COMPLETED prescriptions
- **Reason:** Stock already deducted, audit trail integrity
- **Exception:** Only system admin can reverse (future)

**BR-P05:** CANCELLED prescriptions do NOT deduct stock
- **Logic:** Stock deduction only on COMPLETED
- **Reason:** Medicines not actually dispensed
- **Audit:** Log cancellation, no stock changes

---

## 9. Role-Based Access Control Matrix

| Feature | DOCTOR (Owner) | STAFF (Asisten) | Notes |
|---------|----------------|-----------------|-------|
| **Dashboard** | Full Stats | Limited Stats | Doctor sees revenue, Staff sees tasks |
| **Patients - Create** | ✓ | ✓ | Both can register patients |
| **Patients - Read** | ✓ | ✓ | Both can view patients |
| **Patients - Update** | ✓ | ✗ | Only Doctor can edit |
| **Patients - Delete** | ✓ | ✗ | Only Doctor can delete |
| **Medical Records - Create** | ✓ | ✗ | Only Doctor can create |
| **Medical Records - Read** | ✓ | ✓ | Both can view |
| **Medical Records - Update** | ✓ | ✗ | Only Doctor can edit |
| **Prescriptions - Create** | ✓ | ✗ | Only Doctor can create |
| **Prescriptions - Read** | ✓ | ✓ | Both can view |
| **Prescriptions - Update** | ✓ | Status Only | Staff can only change status |
| **Prescriptions - Cancel** | ✓ | ✗ | Only Doctor can cancel |
| **Prescriptions - Process** | ✗ | ✓ | Only Staff can process |
| **Inventory - Create** | ✓ | ✓ | Both can add medicines |
| **Inventory - Read** | ✓ | ✓ | Both can view |
| **Inventory - Update** | ✓ | ✓ | Both can edit |
| **Inventory - Delete** | ✓ | ✗ | Only Doctor can delete |
| **Inventory - Adjust Stock** | ✓ | ✓ | Both can adjust |
| **Audit Logs - Read** | ✓ | ✗ | Only Doctor can view |

### Implementation Notes:
- Middleware handles route-level protection
- Server Actions include role checks
- UI hides unauthorized actions (but backend enforces)
- All role violations logged to audit trail

---

## 10. Out of Scope

### 10.1 Phase 2 Features (Future)

#### 10.1.1 Telegram Bot Integration
- Notifikasi stok menipis via Telegram
- Command untuk cek stok
- Command untuk lihat resep pending
- **Status:** Ditunda ke Phase 2

#### 10.1.2 Hermes AI Integration
- AI assistant untuk rekomendasi obat
- Auto-suggest berdasarkan diagnosis
- Drug interaction checking
- **Status:** Ditunda ke Phase 2

#### 10.1.3 Multi-Branch Support
- Support untuk multiple pharmacy locations
- Inter-branch stock transfer
- Centralized reporting
- **Status:** Planned for future version

#### 10.1.4 Advanced Analytics & Reports
- Sales reports (daily, weekly, monthly)
- Inventory turnover analysis
- Patient visit trends
- Export to Excel/PDF
- **Status:** Planned for future version

#### 10.1.5 Patient Portal
- Patient login untuk lihat riwayat
- Appointment booking
- Prescription refill requests
- **Status:** Planned for future version

#### 10.1.6 E-Prescription Integration
- Integration dengan e-prescription systems
- Digital signature
- Insurance claim integration
- **Status:** Planned for future version

#### 10.1.7 Mobile App
- Native mobile app (iOS/Android)
- Offline support
- Push notifications
- **Status:** Planned for future version

---

## 11. Success Metrics

### 11.1 Operational Metrics

**SM01:** 90% of prescriptions processed without stock errors
- **Measurement:** Track stock errors vs total prescriptions
- **Target:** ≥ 90% error-free
- **Timeline:** Within 3 months of launch

**SM02:** 100% audit trail coverage for critical operations
- **Measurement:** Audit log entries vs critical operations
- **Target:** 100% coverage
- **Timeline:** From day 1

**SM03:** Average prescription processing time < 5 minutes
- **Measurement:** Time from PENDING to COMPLETED
- **Target:** < 5 minutes average
- **Timeline:** Within 1 month of launch

**SM04:** Zero data loss incidents
- **Measurement:** Count of data loss incidents
- **Target:** 0 incidents
- **Timeline:** Ongoing

**SM05:** User satisfaction score > 4/5
- **Measurement:** User survey (quarterly)
- **Target:** > 4/5 average score
- **Timeline:** First survey at 3 months

### 11.2 Business Metrics

**BM01:** Reduce stock discrepancies by 80%
- **Measurement:** Stock opname variance before/after
- **Target:** 80% reduction
- **Timeline:** Within 6 months

**BM02:** Reduce expired medicine waste by 50%
- **Measurement:** Value of expired medicines discarded
- **Target:** 50% reduction
- **Timeline:** Within 6 months

**BM03:** Increase prescription processing speed by 60%
- **Measurement:** Average processing time before/after
- **Target:** 60% faster
- **Timeline:** Within 3 months

**BM04:** Achieve 100% regulatory compliance
- **Measurement:** Audit findings
- **Target:** 0 major findings
- **Timeline:** First audit at 12 months

---

## 12. Assumptions & Constraints

### 12.1 Assumptions

**A01:** Single pharmacy location (no multi-branch)
- System designed for single location
- Multi-branch support requires significant changes

**A02:** Maximum 50 concurrent users
- System optimized for this scale
- Beyond 50 users requires performance review

**A03:** PostgreSQL database
- Specific features used (JSON columns, etc.)
- Migration to other DB may require changes

**A04:** Internet connection required
- No offline support in MVP
- Offline mode planned for future

**A05:** Modern browsers only
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- No IE11 support

**A06:** Users have basic computer skills
- No extensive training required
- Intuitive UI design

### 12.2 Constraints

**C01:** Budget constraints
- MVP scope limited to essential features
- Phase 2 features require additional budget

**C02:** Timeline constraints
- MVP must be ready in 3 months
- Features prioritized by business value

**C03:** Technical constraints
- Next.js 14 (App Router) required
- PostgreSQL required (no other DB)
- Vercel or self-hosted deployment

**C04:** Regulatory constraints
- Must comply with health data regulations
- Audit trail required for compliance
- Data retention policies apply

**C05:** Resource constraints
- Small development team (2-3 developers)
- Limited QA resources
- Documentation critical for maintenance

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **SOAP** | Subjective, Objective, Assessment, Plan - format for medical records |
| **RBAC** | Role-Based Access Control - access control based on user roles |
| **MVP** | Minimum Viable Product - version with just enough features to satisfy early customers |
| **ED** | Expiry Date - date when medicine expires |
| **CRUD** | Create, Read, Update, Delete - basic data operations |
| **RSC** | React Server Components - React components that run on the server |
| **ORM** | Object-Relational Mapping - technique for converting between incompatible systems |
| **JWT** | JSON Web Token - compact URL-safe means of representing claims |
| **API** | Application Programming Interface - interface for software interaction |
| **UI/UX** | User Interface / User Experience - design aspects of software |
| **E2E** | End-to-End - testing the complete flow from start to finish |
| **UAT** | User Acceptance Testing - testing by end users to verify requirements |
| **CUID** | Collision-resistant Unique Identifier - type of unique ID |
| **Batch Number** | Unique identifier for a production batch of medicine |
| **Stock Opname** | Physical count of inventory to verify records |
| **Threshold** | Minimum stock level that triggers alert |
| **Transaction** | Atomic operation that either fully completes or fully fails |
| **Audit Trail** | Chronological record of all system changes |
| **Immutable** | Cannot be changed once created |
| **Soft Delete** | Marking record as deleted without actually removing it |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| Development Team | | | |

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | Development Team | Initial version |

---

**End of Document**
