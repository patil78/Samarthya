-- =====================================================
-- COMPLETE DATABASE SETUP SCRIPT
-- Internship Allocation System
-- =====================================================
-- Version: 1.0
-- Date: January 2026
-- 
-- INSTRUCTIONS:
-- 1. Create a new database: CREATE DATABASE samarthya_db;
-- 2. USE samarthya_db;
-- 3. Run this entire script
-- =====================================================

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 1. USERS TABLE (Student Accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. ADMINS TABLE (Admin Accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. ORGANIZATIONS TABLE (Company Accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
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

-- =====================================================
-- 4. STUDENT_PROFILES TABLE (Student Details)
-- =====================================================
CREATE TABLE IF NOT EXISTS student_profiles (
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

-- =====================================================
-- 5. VERIFICATION TABLE (Aadhaar Verification)
-- =====================================================
CREATE TABLE IF NOT EXISTS verification (
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

-- =====================================================
-- 6. COMPANY_JOB_POSTINGS TABLE (Job Listings)
-- =====================================================
CREATE TABLE IF NOT EXISTS company_job_postings (
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

-- =====================================================
-- 7. SECTORS TABLE (Master Sector List)
-- =====================================================
CREATE TABLE IF NOT EXISTS sectors (
    sector_id INT AUTO_INCREMENT PRIMARY KEY,
    sector_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sector_name (sector_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. ORGANIZATION_SECTORS TABLE (Company-Sector Mapping)
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_sectors (
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

-- =====================================================
-- 9. OPPORTUNITIES TABLE (Job Opportunities)
-- =====================================================
CREATE TABLE IF NOT EXISTS opportunities (
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

-- =====================================================
-- 10. STUDENT_PREFERENCES TABLE (Job Preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS student_preferences (
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

-- =====================================================
-- 11. ALLOCATION_SCORES TABLE (Match Scores)
-- =====================================================
CREATE TABLE IF NOT EXISTS allocation_scores (
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

-- =====================================================
-- 12. ALLOCATION_STATUS TABLE (Final Allocations)
-- =====================================================
CREATE TABLE IF NOT EXISTS allocation_status (
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

-- =====================================================
-- 13. RESUMES TABLE (Resume Storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS resumes (
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

-- =====================================================
-- 14. SEAT_SUMMARY TABLE (Allocation Summary)
-- =====================================================
CREATE TABLE IF NOT EXISTS seat_summary (
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

-- =====================================================
-- INSERT MASTER DATA - SECTORS
-- =====================================================
INSERT INTO sectors (sector_name, description) VALUES
('IT/Consulting', 'Information Technology and Consulting Services'),
('Banking & Finance', 'Banking, Finance, and Investment Services'),
('Manufacturing', 'Manufacturing and Production Industries'),
('Conglomerate', 'Diversified Business Conglomerates'),
('Energy', 'Energy and Power Generation'),
('Telecom', 'Telecommunications Services'),
('Energy/Oil & Gas', 'Oil, Gas, and Petroleum Industries'),
('Energy/Power', 'Power Generation and Distribution'),
('Mining', 'Mining and Mineral Extraction'),
('FMCG', 'Fast-Moving Consumer Goods'),
('Retail', 'Retail and E-commerce'),
('Healthcare', 'Healthcare and Pharmaceuticals'),
('Automobile', 'Automotive Manufacturing'),
('Construction', 'Construction and Infrastructure'),
('Media & Entertainment', 'Media, Entertainment, and Publishing'),
('Education', 'Education and EdTech'),
('Agriculture', 'Agriculture and Agribusiness'),
('Logistics', 'Logistics and Supply Chain'),
('Real Estate', 'Real Estate and Property Development'),
('Government', 'Government and Public Sector')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after setup to verify:

-- Check all tables were created
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
-- WHERE TABLE_SCHEMA = 'samarthya_db' 
-- ORDER BY TABLE_NAME;

-- Check foreign key constraints
-- SELECT 
--     TABLE_NAME,
--     CONSTRAINT_NAME,
--     REFERENCED_TABLE_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE TABLE_SCHEMA = 'samarthya_db' 
--     AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check indexes
-- SELECT DISTINCT
--     TABLE_NAME,
--     INDEX_NAME,
--     COLUMN_NAME
-- FROM INFORMATION_SCHEMA.STATISTICS
-- WHERE TABLE_SCHEMA = 'samarthya_db'
-- ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Create admin account: python create_admin.py
-- 2. Start backend: uvicorn main:app --reload
-- 3. Start frontend: npm start
-- 4. Test signup/login for students and companies
-- =====================================================
