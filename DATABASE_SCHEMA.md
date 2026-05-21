# Complete Database Schema for Internship Allocation System

## 📋 Overview
This document provides a complete, well-structured database schema for the internship allocation platform. The schema supports students, companies, admins, job postings, preferences, allocations, and scoring.

---

## 🗄️ Database Tables

### 1. **users** (Student Accounts)
Stores student login credentials and basic contact information.

```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Authentication and basic contact for students  
**Key Fields**: `user_id` (PK), `email`, `mobile`

---

### 2. **admins** (Admin Accounts)
Stores admin login credentials.

```sql
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Admin authentication  
**Key Fields**: `admin_id` (PK), `email`, `name`  
**Security**: Admin accounts can only be created via backend (not frontend)

---

### 3. **organizations** (Company Accounts)
Stores company login credentials and information.

```sql
CREATE TABLE organizations (
    organization_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    website VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Company authentication and profile  
**Key Fields**: `organization_id` (PK), `name`, `email`

---

### 4. **student_profiles** (Student Detailed Information)
Stores complete student profile including academic details, skills, and education.

```sql
CREATE TABLE student_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100),
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    
    -- Academic Information
    college_name VARCHAR(200),
    degree VARCHAR(100),
    qualification VARCHAR(100),
    branch VARCHAR(100),
    cgpa DECIMAL(4,2),
    grad_year INT,
    
    -- 12th Grade Details
    twelth_school VARCHAR(200),
    twelth_pct DECIMAL(5,2),
    twelth_year INT,
    
    -- 10th Grade Details
    tenth_school VARCHAR(200),
    tenth_pct DECIMAL(5,2),
    tenth_year INT,
    
    -- Skills and Preferences
    skills TEXT,
    location_pref1 VARCHAR(100),
    location_pref2 VARCHAR(100),
    location_pref3 VARCHAR(100),
    
    -- Family Information
    father_name VARCHAR(100),
    father_mobile VARCHAR(15),
    mother_name VARCHAR(100),
    mother_mobile VARCHAR(15),
    annual_income DECIMAL(12,2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_profile (user_id),
    INDEX idx_name (name),
    INDEX idx_degree (degree),
    INDEX idx_branch (branch),
    INDEX idx_cgpa (cgpa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Complete student profile with academic and personal details  
**Key Fields**: `profile_id` (PK), `user_id` (FK), `cgpa`, `skills`, `degree`  
**Note**: Column `twelth_pct` has a typo for backward compatibility

---

### 5. **verification** (Aadhaar Verification)
Stores student Aadhaar verification status.

```sql
CREATE TABLE verification (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    aadhaar_number VARCHAR(12),
    aadhaar_age INT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_verification (user_id),
    INDEX idx_aadhaar (aadhaar_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Track Aadhaar verification for students  
**Key Fields**: `user_id` (FK), `is_verified`

---

### 6. **company_job_postings** (Job Listings)
Stores job opportunities posted by companies.

```sql
CREATE TABLE company_job_postings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    
    -- Job Details
    sector_name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    
    -- Requirements
    education_required VARCHAR(200),
    skills_required TEXT,
    min_score DECIMAL(5,2),
    
    -- Compensation & Duration
    stipend DECIMAL(10,2),
    duration VARCHAR(50),
    
    -- Vacancy Information
    vacancies INT DEFAULT 1,
    
    -- Job Description
    description TEXT,
    
    -- Status
    status ENUM('Active', 'Inactive', 'Closed') DEFAULT 'Active',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_organization (organization_id),
    INDEX idx_sector (sector_name),
    INDEX idx_role (role),
    INDEX idx_location (location),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Company job postings with all requirements  
**Key Fields**: `job_id` (PK), `organization_id` (FK), `sector_name`, `role`, `vacancies`

---

### 7. **student_preferences** (Student Job Preferences)
Stores student preferences for sectors, roles, and locations.

```sql
CREATE TABLE student_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    opportunity_id INT,
    
    -- Preference Details
    sector_preference VARCHAR(100),
    role_preference VARCHAR(100),
    location_preference VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
    INDEX idx_profile (profile_id),
    INDEX idx_opportunity (opportunity_id),
    INDEX idx_sector (sector_preference),
    INDEX idx_role (role_preference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Track student job preferences (up to 5 preferences per student)  
**Key Fields**: `preference_id` (PK, auto-incremented serves as ranking), `profile_id` (FK)  
**Note**: Lower `preference_id` = higher priority for same student

---

### 8. **sectors** (Master Sector List)
Master list of industry sectors.

```sql
CREATE TABLE sectors (
    sector_id INT AUTO_INCREMENT PRIMARY KEY,
    sector_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sector_name (sector_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Standardized list of sectors  
**Common Values**: IT/Consulting, Banking & Finance, Manufacturing, Energy, etc.

---

### 9. **organization_sectors** (Company-Sector Mapping)
Links organizations to sectors they operate in.

```sql
CREATE TABLE organization_sectors (
    org_sector_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    sector_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (sector_id) REFERENCES sectors(sector_id) ON DELETE CASCADE,
    UNIQUE KEY unique_org_sector (organization_id, sector_id),
    INDEX idx_organization (organization_id),
    INDEX idx_sector (sector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Many-to-many relationship between organizations and sectors

---

### 10. **opportunities** (Job Opportunities - Extended Details)
Extended job opportunity details (used by allocation algorithm).

```sql
CREATE TABLE opportunities (
    opportunity_id INT AUTO_INCREMENT PRIMARY KEY,
    org_sector_id INT NOT NULL,
    
    -- Job Details
    role VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    seats INT NOT NULL DEFAULT 1,
    
    -- Requirements
    education_required VARCHAR(200),
    min_score DECIMAL(5,2),
    skills_required TEXT,
    
    -- Compensation
    stipend DECIMAL(10,2),
    duration VARCHAR(50),
    
    -- Description
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (org_sector_id) REFERENCES organization_sectors(org_sector_id) ON DELETE CASCADE,
    INDEX idx_org_sector (org_sector_id),
    INDEX idx_role (role),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Detailed opportunities for matching algorithm  
**Note**: This table is populated from `company_job_postings` via sync

---

### 11. **allocation_scores** (Student-Job Match Scores)
Stores calculated matching scores between students and jobs.

```sql
CREATE TABLE allocation_scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    
    -- Score Components (0-100 scale)
    total_score DECIMAL(5,2) NOT NULL,
    skills_score DECIMAL(5,2),
    academic_score DECIMAL(5,2),
    preference_score DECIMAL(5,2),
    branch_score DECIMAL(5,2),
    location_score DECIMAL(5,2),
    
    -- Timestamps
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    UNIQUE KEY unique_score (profile_id, opportunity_id),
    INDEX idx_profile (profile_id),
    INDEX idx_opportunity (opportunity_id),
    INDEX idx_total_score (total_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Store calculated match scores for student-job pairs  
**Scoring Breakdown**:
- Skills Match: 35%
- Academic Performance: 20%
- Preference Match: 20%
- Branch Suitability: 15%
- Location Preference: 10%

---

### 12. **allocation_status** (Final Allocations)
Stores the final allocation status of students to jobs.

```sql
CREATE TABLE allocation_status (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    
    -- Company and Job Info
    company_name VARCHAR(200),
    role VARCHAR(100),
    sector VARCHAR(100),
    location VARCHAR(100),
    
    -- Student Info
    student_name VARCHAR(100),
    student_email VARCHAR(100),
    
    -- Allocation Details
    seats INT DEFAULT 1,
    status ENUM('Allocated', 'Waiting', 'Rejected', 'Accepted', 'Not Allocated') DEFAULT 'Not Allocated',
    allocation_score DECIMAL(5,2),
    
    -- Timestamps
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    INDEX idx_profile (profile_id),
    INDEX idx_opportunity (opportunity_id),
    INDEX idx_status (status),
    INDEX idx_company (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Final allocation results and status tracking  
**Status Values**:
- `Allocated`: Student matched to job
- `Waiting`: On waitlist
- `Accepted`: Student accepted the offer
- `Rejected`: Student rejected the offer
- `Not Allocated`: No match found

---

### 13. **resumes** (Resume Storage)
Stores uploaded resume file paths and metadata.

```sql
CREATE TABLE resumes (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    user_id INT NOT NULL,
    
    -- File Information
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    
    -- Resume Data
    parsed_text TEXT,
    extracted_skills TEXT,
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_profile (profile_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Store and track uploaded resumes  
**Features**: AI parsing extracts skills and text

---

### 14. **seat_summary** (Allocation Summary)
Summary table for allocation statistics (optional, for reporting).

```sql
CREATE TABLE seat_summary (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id INT NOT NULL,
    company_name VARCHAR(200),
    role VARCHAR(100),
    
    -- Seat Statistics
    total_seats INT,
    allocated_seats INT DEFAULT 0,
    waiting_students INT DEFAULT 0,
    accepted_students INT DEFAULT 0,
    
    -- Timestamps
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    UNIQUE KEY unique_opportunity (opportunity_id),
    INDEX idx_company (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose**: Quick access to allocation statistics per job

---

## 🔗 Entity Relationship Diagram

```
users (1) ──────→ (1) student_profiles
                        │
                        ├──→ (N) student_preferences
                        ├──→ (N) allocation_scores
                        ├──→ (N) allocation_status
                        └──→ (N) resumes

organizations (1) ──→ (N) company_job_postings
       │
       └──→ (N) organization_sectors ←── (N) sectors
                        │
                        └──→ (N) opportunities
                                      │
                                      ├──→ (N) allocation_scores
                                      └──→ (N) allocation_status

admins (standalone)
verification (1:1 with users)
```

---

## 📊 Key Relationships

1. **One User → One Profile**: Each student has one profile
2. **One Profile → Many Preferences**: Students can have multiple preferences (up to 5)
3. **One Organization → Many Jobs**: Companies can post multiple jobs
4. **Many Students → Many Jobs**: Allocation is many-to-many via scores and status
5. **One Admin**: Standalone, manages the entire system

---

## 🔐 Security Features

1. **Password Hashing**: All passwords stored as SHA256 hashes
2. **Foreign Key Constraints**: CASCADE delete for data integrity
3. **Unique Constraints**: Prevent duplicate emails, profiles
4. **Indexes**: Optimized queries on frequently searched columns
5. **Admin Restriction**: Admin accounts created only via backend

---

## 📈 Performance Optimization

### Recommended Indexes:
- Email fields (users, organizations, admins)
- Profile IDs and User IDs (all related tables)
- Status fields (allocation_status)
- Score fields (descending for ranking)
- Sector/Role/Location fields (for filtering)

### Query Optimization:
- Use covering indexes for common queries
- Partition `allocation_status` by year if data grows large
- Consider materialized views for complex reporting

---

## 🚀 Next Steps

1. **Run the complete setup script** (see `DATABASE_SETUP.sql`)
2. **Insert master data** (sectors, sample data)
3. **Create first admin account** via `create_admin.py`
4. **Test all relationships** with sample data
5. **Set up backups** and monitoring

---

## 📝 Notes

- Character set: `utf8mb4` for emoji and international character support
- Collation: `utf8mb4_unicode_ci` for case-insensitive searches
- Engine: InnoDB for transaction support and foreign keys
- All timestamps in UTC (adjust in application layer if needed)
- Typo in `twelth_pct` maintained for backward compatibility

---

**Database Ready for Production!** ✅
