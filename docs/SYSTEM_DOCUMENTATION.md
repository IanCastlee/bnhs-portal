# Bulusan National High School (BNHS) Online Pre-Admission, Enrollment, and Grading Portal

## Technical Architecture & System Documentation

School Year: 2026 - 2027 / 2027 - 2028  
School ID: 302196  
Division: Schools Division Office of Sorsogon (SDO Sorsogon)  
Region: Region V (Bicol Region)  
Document Version: 1.0.0 (Living Architecture Document)

---

## 1. Executive Summary

Bulusan National High School Portal is an integrated web-based academic and administrative information system designed to modernize and streamline DepEd secondary school operations. It replaces error-prone paper queues and fragmented spreadsheets with a centralized, data-protected, and high-performance portal.

### 1.1 Core Problems Addressed

1. Long walk-in queues and overcrowding during enrollment peak seasons.
2. Inconsistent learner identification records and unverified LRN entries.
3. Heavy server storage overhead and security risks associated with unvetted bulk document uploads.
4. Slow, manual sectioning resulting in unbalanced gender ratios and mismatched academic capabilities.
5. Delayed grade consolidation and manual SF9/SF10 generation.

### 1.2 Architectural Solution

The system employs a **Hybrid Online Pre-Admission & Onsite Physical Verification Model**:

- Applicants complete their official DepEd Basic Education Enrollment Form (BEEF Annex A) online.
- A Pre-Admission Slip with a unique tracking ticket is generated.
- Physical documents (Form 138/SF9, PSA Birth Certificate, Good Moral Certificate, 2x2 Photos) are received and verified physically by the Registrar Office.
- Cloud storage (Cloudinary) is reserved exclusively for student avatars with client-side WebP compression.
- Post-enrollment automated sectioning organizes approved students using balanced algorithmic distribution.

---

## 2. Technology Stack & Design Principles

### 2.1 Backend

- **Framework:** Laravel 11.x (PHP 8.2+)
- **Architecture Pattern:** Modular Monolith
    - `App/Modules/Identity`: Authentication, Authorization, Role-Based Access Control, Audit Trails.
    - `App/Modules/Enrollment`: BEEF Pre-Admission, Application Review, Automated Class Sectioning.
    - `App/Modules/Academic`: Academic Years, Grade Levels, Sections, Subjects, Announcements.
    - `App/Modules/Grading`: DepEd SF9/SF10 Grading Engine, Transmutation, Multi-Step Approval.
- **Database:** MySQL 8.4 Enterprise with Composite Indexing
- **Caching & Sessions:** Redis / Database Driver

### 2.2 Frontend

- **Framework:** React 19 with Inertia.js (Single Page Application architecture without client-side routing overhead)
- **Styling:** Tailwind CSS v4
- **Asset Pipeline:** Vite 6
- **Typography:** Geist & Geist Mono (DepEd standard clean UI, strictly zero decorative emojis in administrative interfaces)

### 2.3 Third-Party Services & Optimization

- **Cloudinary CDN:** Dedicated solely to student profile avatars.
- **Client-Side Image Processing:** Pre-upload conversion to WebP format (max 600x600 px, 40 KB - 80 KB) to eliminate server bandwidth bottlenecks.

---

## 3. User Roles & Access Control Matrix

The portal implements strict Role-Based Access Control (RBAC):

| Role                    | Scope of Access              | Primary Responsibilities                                                                                              |
| :---------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **SUPER ADMINISTRATOR** | Global System Access         | School Year Rollover, Registrar Grade Level Assignments, Audit Log Monitoring, School Feed Announcements.             |
| **REGISTRAR OFFICER**   | Assigned Grade Levels        | Physical Document Verification, BEEF Approval/Rejection, Automated/Manual Sectioning, SF10 Permanent Record Archival. |
| **FACULTY / TEACHER**   | Assigned Sections & Subjects | Advisory Class Roster Monitoring, Subject Grade Encoding (Q1 to Q4), SF9 Submission to Registrar.                     |
| **STUDENT / LEARNER**   | Self Learner Profile         | Online BEEF Submission, Pre-Admission Slip Printing, Class Schedule Viewing, SF9 Electronic Report Card.              |

---

## 4. System Workflows

### 4.1 Hybrid Enrollment & Admission Workflow

1. **Account Registration:** Learner registers using a valid email, password, and their 12-digit DepEd Learner Reference Number (LRN).
2. **Online BEEF Form:** Learner fills out personal details, household information, guardian contacts, and previous school background.
3. **Pre-Admission Slip Generation:** The system issues an official Confirmation Ticket containing the learner's tracking number and an onsite receiving checklist.
4. **Onsite Hardcopy Submission:** Learner/Parent presents original credentials to the BNHS Registrar Office.
5. **Registrar Review:**
    - Registrar conducts physical credential checks.
    - Registrar evaluates the application and chooses a standardized remark (e.g., Complete, Conditionally Approved, or Custom note).
    - Approval updates the student status to `APPROVED` and places them in the Unassigned Students Pool.

### 4.2 Automated Class Sectioning Workflow

Approved learners are partitioned into designated sections using one of four strategies:

1. **Heterogeneous Balanced:** Equal distribution of total student count and male/female gender balance per room.
2. **Academic Snake (Equal Ability):** Sorts learners by General Average in a zigzag pattern so all sections maintain equivalent academic capabilities.
3. **Academic Rank (Special/Star Section):** First section is populated by highest-ranking General Average learners (Pilot Class), while remaining learners are evenly balanced.
4. **Alphabetical (A-Z):** Standard alphabetical distribution by surname.

### 4.3 Student Profile Avatar Workflow

1. Student selects a profile image on desktop or mobile.
2. In-browser canvas compresses the file and converts it to WebP format.
3. Server receives the compressed file and securely delivers it to Cloudinary under folder `bnhs_avatars/student_{id}`.
4. The authenticated user avatar updates reactively across navigation headers without requiring full-page reloads.

---

## 5. Database Schema & Indexing Strategy

### 5.1 Key Tables

#### `users`

- Primary user table storing authentication, roles (`ADMIN`, `REGISTRAR`, `TEACHER`, `STUDENT`), and identifiers (`lrn`, `employee_id`, `avatar_path`).

#### `enrollments`

- Core admission record linking `student_id`, `academic_year_id`, `grade_level_id`, and `section_id`.
- Stores DepEd BEEF demographics, general average, physical evaluation remarks, and review metadata.

#### `academic_years`

- Manages operational school years (e.g., 2026-2027, 2027-2028).
- Flags for active year, enrollment open window, and grading submission window.

#### `sections`

- Class groupings linked to academic year, grade level, and assigned faculty adviser.
- Stores section capacity limits (standard: 40-45 learners).

#### `grades`

- Individual subject quarter grades (`q1`, `q2`, `q3`, `q4`, `final_grade`, `remarks`).
- DepEd workflow status tracking (`DRAFT`, `SUBMITTED_TO_ADVISER`, `SUBMITTED_TO_REGISTRAR`, `PUBLISHED`).

#### `audit_logs`

- Immutable system trail tracking all administrative approvals, section assignments, deletions, and configuration changes.

### 5.2 Enterprise Performance Composite Indexing

To support scaling up to tens of thousands of applicants and historical cohorts, the database includes dedicated composite indexes:

1. **`idx_enrollments_sy_gl_status`** (`academic_year_id`, `grade_level_id`, `status`):
    - Accelerates Registrar queue filtering and sectioning candidate lookups.
2. **`idx_enrollments_sy_section`** (`academic_year_id`, `section_id`):
    - Accelerates Section Roster queries and room capacity counters.
3. **`idx_grades_sy_section_subject`** (`academic_year_id`, `section_id`, `subject_id`):
    - Optimizes electronic grade sheet retrieval for subject teachers.
4. **`idx_grades_sy_student`** (`academic_year_id`, `student_id`):
    - Guarantees sub-millisecond retrieval of student quarterly report cards (SF9).

---

## 6. Security, Compliance, and Data Privacy

1. **Data Privacy Act of 2012 (Republic Act No. 10173):**
    - Learner permanent records and physical credentials are not hosted publicly on unprotected storage.
    - Passwords use bcrypt hashing; sensitive sessions are protected with CSRF tokens and HTTP-only cookies.
2. **Role Boundaries:**
    - Registrars are restricted strictly to their assigned grade levels via route-level authorization guards.
    - Students cannot access grading or sectioning endpoints.
3. **Auditability:**
    - Critical operations (Enrollment approvals, rejections, section creation, section deletion, and mass distribution) generate non-repudiable audit logs recording user ID, IP address, and timestamp.

---

## 7. Upcoming Modules (Roadmap)

The following modules are scheduled for upcoming development:

1. **Curriculum Subject Assignment:** Mapping core, applied, and specialized DepEd curriculum subjects per grade level and track.
2. **Teacher Subject Loading:** Assigning faculty instructors to specific subjects across sections.
3. **Section Adviser Designation:** Assigning official class advisers to sections and linking them to advisory SF9 sign-offs.
4. **DepEd SF10 Permanent Record Generator:** Multi-year academic historical archiving and automated transcript generation.
