-- =====================================================
-- MOCK DATA FOR TESTING
-- Internship Allocation System
-- =====================================================
-- This script populates the database with realistic test data
-- for both student and company portals
-- =====================================================

USE samarthya_db;

-- Disable foreign key checks temporarily for clean insert
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- CLEAR EXISTING MOCK DATA (if any)
-- =====================================================
TRUNCATE TABLE seat_summary;
TRUNCATE TABLE allocation_status;
TRUNCATE TABLE allocation_scores;
TRUNCATE TABLE student_preferences;
TRUNCATE TABLE opportunities;
TRUNCATE TABLE company_job_postings;
TRUNCATE TABLE organization_sectors;
TRUNCATE TABLE resumes;
TRUNCATE TABLE verification;
TRUNCATE TABLE student_profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE organizations;

-- Reset auto_increment counters to ensure consistent IDs
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE organizations AUTO_INCREMENT = 60001;
ALTER TABLE student_profiles AUTO_INCREMENT = 60001;

-- =====================================================
-- 1. COMPANIES (5 Organizations)
-- =====================================================
-- Password for all companies: company123 (hashed with SHA256)

INSERT INTO organizations (name, email, password_hash, phone, website, address, created_at) VALUES
('Tata Consultancy Services', 'tcs@example.com', '$5$rounds=535000$dLPnnFg4J5ftixFF$BbKJxtalqYGCjBhEHas2q5LOfEgzbcMlc5QIJMscAEB', '9876543210', 'https://www.tcs.com', 'Mumbai, Maharashtra, India', NOW()),
('Infosys Limited', 'infosys@example.com', '$5$rounds=535000$dLPnnFg4J5ftixFF$BbKJxtalqYGCjBhEHas2q5LOfEgzbcMlc5QIJMscAEB', '9876543211', 'https://www.infosys.com', 'Bangalore, Karnataka, India', NOW()),
('HDFC Bank', 'hdfc@example.com', '$5$rounds=535000$dLPnnFg4J5ftixFF$BbKJxtalqYGCjBhEHas2q5LOfEgzbcMlc5QIJMscAEB', '9876543212', 'https://www.hdfcbank.com', 'Mumbai, Maharashtra, India', NOW()),
('Tata Steel', 'tatasteel@example.com', '$5$rounds=535000$dLPnnFg4J5ftixFF$BbKJxtalqYGCjBhEHas2q5LOfEgzbcMlc5QIJMscAEB', '9876543213', 'https://www.tatasteel.com', 'Jamshedpur, Jharkhand, India', NOW()),
('Reliance Industries', 'reliance@example.com', '$5$rounds=535000$dLPnnFg4J5ftixFF$BbKJxtalqYGCjBhEHas2q5LOfEgzbcMlc5QIJMscAEB', '9876543214', 'https://www.ril.com', 'Mumbai, Maharashtra, India', NOW());

-- =====================================================
-- 2. STUDENTS (9 Students with real emails for allocation testing)
-- =====================================================
-- Password for all students: student123 (hashed with SHA256)
-- NOTE: Student names are stored in student_profiles table, not users table

INSERT INTO users (email, password_hash, mobile, created_at) VALUES
('siddhantakhade1@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501001', NOW()),
('bittupatil020206@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501002', NOW()),
('acv12102021@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501003', NOW()),
('internmatchsih@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501004', NOW()),
('rainashradhaa@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501005', NOW()),
('theburiedwords755@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501006', NOW()),
('yug20162016@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501007', NOW()),
('yugrajawat24@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501008', NOW()),
('yugrajawat23@gmail.com', '$5$rounds=535000$o8M6Nn9zjNu4lPyr$hkM.n08PWS5nxnwIBUT46DUvEUnVDDExYsmdjyVjSk5', '9876501009', NOW());

-- =====================================================
-- 3. STUDENT PROFILES (Complete profiles for all 9 students)
-- =====================================================

INSERT INTO student_profiles (user_id, name, dob, gender, college_name, degree, qualification, branch, cgpa, grad_year, twelth_school, twelth_pct, twelth_year, tenth_school, tenth_pct, tenth_year, skills, location_pref1, location_pref2, location_pref3, father_name, father_mobile, mother_name, mother_mobile, annual_income) VALUES
(1, 'Siddhant Akhade', '2002-05-15', 'Male', 'MIT Pune', 'B.Tech', 'Engineering', 'Computer Science', 8.5, 2024, 'DAV Public School', 92.5, 2019, 'St. Mary School', 95.0, 2017, 'Java, Python, SQL, React, Node.js', 'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Bangalore, Karnataka', 'Mr. Akhade', '9876501101', 'Mrs. Akhade', '9876501102', 500000),
(2, 'Bittu Patil', '2002-08-20', 'Male', 'COEP Pune', 'B.Tech', 'Engineering', 'Computer Science', 8.2, 2024, 'Kendriya Vidyalaya', 89.0, 2019, 'Model School', 92.0, 2017, 'Python, JavaScript, React, MongoDB, Express', 'Pune, Maharashtra', 'Mumbai, Maharashtra', 'Hyderabad, Telangana', 'Mr. Patil', '9876501201', 'Mrs. Patil', '9876501202', 450000),
(3, 'Acv Kumar', '2002-12-10', 'Male', 'VIT Vellore', 'B.Tech', 'Engineering', 'Electronics', 7.8, 2024, 'Delhi Public School', 85.5, 2019, 'Cambridge School', 88.0, 2017, 'C++, Embedded Systems, MATLAB, Arduino', 'Chennai, Tamil Nadu', 'Bangalore, Karnataka', 'Hyderabad, Telangana', 'Mr. Kumar', '9876501301', 'Mrs. Kumar', '9876501302', 400000),
(4, 'Intern Match', '2002-03-25', 'Male', 'IIT Bombay', 'B.Tech', 'Engineering', 'Computer Science', 9.0, 2024, 'Ryan International', 95.0, 2019, 'St. Xavier School', 96.5, 2017, 'Java, Python, Machine Learning, AI, Deep Learning', 'Mumbai, Maharashtra', 'Bangalore, Karnataka', 'Pune, Maharashtra', 'Mr. Match', '9876501401', 'Mrs. Match', '9876501402', 800000),
(5, 'Raina Shradha', '2002-07-18', 'Female', 'NIT Trichy', 'B.Tech', 'Engineering', 'Computer Science', 8.7, 2024, 'Holy Cross School', 91.0, 2019, 'Convent School', 93.5, 2017, 'Python, Data Science, Pandas, NumPy, Scikit-learn', 'Chennai, Tamil Nadu', 'Bangalore, Karnataka', 'Hyderabad, Telangana', 'Mr. Shradha', '9876501501', 'Mrs. Shradha', '9876501502', 600000),
(6, 'Buried Words', '2002-09-05', 'Male', 'BITS Pilani', 'B.Tech', 'Engineering', 'Mechanical', 7.5, 2024, 'Bharatiya Vidya Bhavan', 82.0, 2019, 'Army Public School', 85.5, 2017, 'CAD, SolidWorks, AutoCAD, Manufacturing', 'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Delhi, Delhi', 'Mr. Words', '9876501601', 'Mrs. Words', '9876501602', 350000),
(7, 'Yug Sharma', '2002-11-22', 'Male', 'DTU Delhi', 'B.Tech', 'Engineering', 'Electrical', 8.0, 2024, 'DPS RK Puram', 87.5, 2019, 'Amity School', 90.0, 2017, 'Circuit Design, PLC, Power Systems, MATLAB', 'Delhi, Delhi', 'Noida, Uttar Pradesh', 'Gurugram, Haryana', 'Mr. Sharma', '9876501701', 'Mrs. Sharma', '9876501702', 550000),
(8, 'Yug Rajawat', '2002-06-14', 'Male', 'Manipal Institute', 'B.Tech', 'Engineering', 'Computer Science', 8.3, 2024, 'Manipal School', 88.5, 2019, 'National School', 91.0, 2017, 'Java, Spring Boot, Microservices, Docker, Kubernetes', 'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Mr. Rajawat', '9876501801', 'Mrs. Rajawat', '9876501802', 520000),
(9, 'Yug Rajawat Jr', '2002-04-30', 'Male', 'SRM Chennai', 'B.Tech', 'Engineering', 'Civil', 7.6, 2024, 'Chennai Public School', 84.0, 2019, 'Chennai Model School', 87.0, 2017, 'AutoCAD, Revit, Structural Analysis, Civil 3D', 'Chennai, Tamil Nadu', 'Bangalore, Karnataka', 'Hyderabad, Telangana', 'Mr. Rajawat Sr', '9876501901', 'Mrs. Rajawat Sr', '9876501902', 380000);

-- =====================================================
-- 4. VERIFICATION (All students verified)
-- =====================================================

INSERT INTO verification (user_id, aadhaar_number, aadhaar_age, is_verified, verified_at) VALUES
(1, '123456789001', 22, TRUE, NOW()),
(2, '123456789002', 22, TRUE, NOW()),
(3, '123456789003', 22, TRUE, NOW()),
(4, '123456789004', 22, TRUE, NOW()),
(5, '123456789005', 22, TRUE, NOW()),
(6, '123456789006', 22, TRUE, NOW()),
(7, '123456789007', 22, TRUE, NOW()),
(8, '123456789008', 22, TRUE, NOW()),
(9, '123456789009', 22, TRUE, NOW());

-- =====================================================
-- 5. RESUMES (All students have uploaded resumes)
-- =====================================================

INSERT INTO resumes (profile_id, user_id, file_path, file_name, file_size, mime_type, extracted_skills, uploaded_at) VALUES
(60001, 1, '/uploads/resume/1_resume.pdf', 'siddhant_resume.pdf', 245678, 'application/pdf', '["Java", "Python", "SQL", "React", "Node.js"]', NOW()),
(60002, 2, '/uploads/resume/2_resume.pdf', 'bittu_resume.pdf', 198765, 'application/pdf', '["Python", "JavaScript", "React", "MongoDB", "Express"]', NOW()),
(60003, 3, '/uploads/resume/3_resume.pdf', 'acv_resume.pdf', 223456, 'application/pdf', '["C++", "Embedded Systems", "MATLAB", "Arduino"]', NOW()),
(60004, 4, '/uploads/resume/4_resume.pdf', 'intern_resume.pdf', 267890, 'application/pdf', '["Java", "Python", "Machine Learning", "AI", "Deep Learning"]', NOW()),
(60005, 5, '/uploads/resume/5_resume.pdf', 'raina_resume.pdf', 234567, 'application/pdf', '["Python", "Data Science", "Pandas", "NumPy", "Scikit-learn"]', NOW()),
(60006, 6, '/uploads/resume/6_resume.pdf', 'buried_resume.pdf', 212345, 'application/pdf', '["CAD", "SolidWorks", "AutoCAD", "Manufacturing"]', NOW()),
(60007, 7, '/uploads/resume/7_resume.pdf', 'yug_resume.pdf', 256789, 'application/pdf', '["Circuit Design", "PLC", "Power Systems", "MATLAB"]', NOW()),
(60008, 8, '/uploads/resume/8_resume.pdf', 'yugr_resume.pdf', 245678, 'application/pdf', '["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"]', NOW()),
(60009, 9, '/uploads/resume/9_resume.pdf', 'yugrjr_resume.pdf', 201234, 'application/pdf', '["AutoCAD", "Revit", "Structural Analysis", "Civil 3D"]', NOW());

-- =====================================================
-- 6. ORGANIZATION SECTORS (Link companies to sectors)
-- =====================================================

INSERT INTO organization_sectors (organization_id, sector_id) VALUES
-- TCS - IT/Consulting (sector_id 4)
(60001, 4),
-- Infosys - IT/Consulting (sector_id 4)
(60002, 4),
-- HDFC - Banking & Finance (sector_id 5)
(60003, 5),
-- Tata Steel - Manufacturing (sector_id 9)
(60004, 9),
-- Reliance - Conglomerate (sector_id 1)
(60005, 1);

-- =====================================================
-- 7. JOB POSTINGS (15 jobs from 5 companies)
-- =====================================================
-- NOTE: company_job_postings schema: organization_id, sector_name, role, location, 
-- education_required, skills_required, stipend, duration (VARCHAR), vacancies, 
-- description (TEXT), status (ENUM), created_at, updated_at

-- TCS Jobs (3)
INSERT INTO company_job_postings (organization_id, sector_name, role, location, education_required, skills_required, stipend, duration, vacancies, description, status, created_at) VALUES
(60001, 'IT/Consulting', 'Software Developer Intern', 'Mumbai, Maharashtra', 'B.Tech Computer Science', 'Java, Python, SQL, Spring Boot', 25000, '6 months', 5, 'Full-stack development internship with training on enterprise applications', 'Active', NOW()),
(60001, 'IT/Consulting', 'Data Analyst Intern', 'Pune, Maharashtra', 'B.Tech/B.E.', 'Python, SQL, Data Analysis, Excel', 22000, '4 months', 3, 'Work on data analytics projects for business insights', 'Active', NOW()),
(60001, 'IT/Consulting', 'Cloud Engineer Intern', 'Bangalore, Karnataka', 'B.Tech Computer Science/IT', 'AWS, Docker, Kubernetes, Python', 30000, '6 months', 4, 'Learn cloud infrastructure and DevOps practices', 'Active', NOW());

-- Infosys Jobs (3)
INSERT INTO company_job_postings (organization_id, sector_name, role, location, education_required, skills_required, stipend, duration, vacancies, description, status, created_at) VALUES
(60002, 'IT/Consulting', 'Full Stack Developer Intern', 'Bangalore, Karnataka', 'B.Tech Computer Science', 'React, Node.js, MongoDB, Express', 28000, '6 months', 6, 'Build modern web applications using MERN stack', 'Active', NOW()),
(60002, 'IT/Consulting', 'DevOps Engineer Intern', 'Hyderabad, Telangana', 'B.Tech Computer Science/IT', 'Docker, Kubernetes, Jenkins, Git', 26000, '5 months', 4, 'Learn CI/CD pipelines and automation', 'Active', NOW()),
(60002, 'IT/Consulting', 'Business Analyst Intern', 'Pune, Maharashtra', 'B.Tech/MBA', 'Excel, SQL, Communication, Analysis', 20000, '4 months', 2, 'Support business analysis and requirements gathering', 'Active', NOW());

-- HDFC Bank Jobs (3)
INSERT INTO company_job_postings (organization_id, sector_name, role, location, education_required, skills_required, stipend, duration, vacancies, description, status, created_at) VALUES
(60003, 'Banking & Finance', 'IT Analyst Intern', 'Mumbai, Maharashtra', 'B.Tech Computer Science', 'Java, SQL, Banking Domain Knowledge', 24000, '5 months', 4, 'Work on banking software applications', 'Active', NOW()),
(60003, 'Banking & Finance', 'Risk Analyst Intern', 'Mumbai, Maharashtra', 'B.Tech/B.Com/BBA', 'Excel, Statistics, Risk Management', 20000, '4 months', 3, 'Analyze credit risk and financial data', 'Active', NOW()),
(60003, 'Banking & Finance', 'Digital Banking Intern', 'Bangalore, Karnataka', 'B.Tech/BCA', 'Mobile Apps, UI/UX, Digital Marketing', 22000, '4 months', 2, 'Support digital banking initiatives', 'Active', NOW());

-- Tata Steel Jobs (3)
INSERT INTO company_job_postings (organization_id, sector_name, role, location, education_required, skills_required, stipend, duration, vacancies, description, status, created_at) VALUES
(60004, 'Manufacturing', 'Mechanical Engineer Intern', 'Jamshedpur, Jharkhand', 'B.Tech Mechanical', 'CAD, Manufacturing, Quality Control', 18000, '6 months', 5, 'Work on manufacturing processes and equipment', 'Active', NOW()),
(60004, 'Manufacturing', 'Process Engineer Intern', 'Jamshedpur, Jharkhand', 'B.Tech Chemical/Mechanical', 'Process Design, Safety, Quality', 19000, '5 months', 3, 'Optimize production processes', 'Active', NOW()),
(60004, 'Manufacturing', 'Quality Control Intern', 'Mumbai, Maharashtra', 'B.Tech/Diploma', 'Quality Management, Testing, Documentation', 16000, '4 months', 2, 'Ensure quality standards in production', 'Active', NOW());

-- Reliance Jobs (3)
INSERT INTO company_job_postings (organization_id, sector_name, role, location, education_required, skills_required, stipend, duration, vacancies, description, status, created_at) VALUES
(60005, 'Conglomerate', 'Chemical Engineer Intern', 'Mumbai, Maharashtra', 'B.Tech Chemical', 'Chemical Processes, Safety, Lab Work', 20000, '6 months', 4, 'Work on chemical processes in refinery', 'Active', NOW()),
(60005, 'Conglomerate', 'Electrical Engineer Intern', 'Jamnagar, Gujarat', 'B.Tech Electrical', 'Circuit Design, Power Systems, PLC', 19000, '5 months', 3, 'Maintain electrical systems in plant', 'Active', NOW()),
(60005, 'Conglomerate', 'Project Coordinator Intern', 'Mumbai, Maharashtra', 'B.Tech/MBA', 'Project Management, MS Office, Communication', 22000, '4 months', 2, 'Coordinate multiple projects across teams', 'Active', NOW());

-- =====================================================
-- 8. OPPORTUNITIES (Create opportunities from job postings)
-- =====================================================
-- NOTE: opportunities schema: org_sector_id, role, location, seats, education_required,
-- min_score, skills_required, stipend, duration (VARCHAR), description, created_at

INSERT INTO opportunities (org_sector_id, role, location, seats, min_score, skills_required, stipend, duration, created_at) VALUES
-- TCS opportunities
(1, 'Software Developer Intern', 'Mumbai, Maharashtra', 5, 7.0, 'Java, Python, SQL, Spring Boot', 25000, '6 months', NOW()),
(1, 'Data Analyst Intern', 'Pune, Maharashtra', 3, 6.5, 'Python, SQL, Data Analysis, Excel', 22000, '4 months', NOW()),
(1, 'Cloud Engineer Intern', 'Bangalore, Karnataka', 4, 7.5, 'AWS, Docker, Kubernetes, Python', 30000, '6 months', NOW()),
-- Infosys opportunities
(2, 'Full Stack Developer Intern', 'Bangalore, Karnataka', 6, 7.0, 'React, Node.js, MongoDB, Express', 28000, '6 months', NOW()),
(2, 'DevOps Engineer Intern', 'Hyderabad, Telangana', 4, 7.0, 'Docker, Kubernetes, Jenkins, Git', 26000, '5 months', NOW()),
(2, 'Business Analyst Intern', 'Pune, Maharashtra', 2, 6.5, 'Excel, SQL, Communication, Analysis', 20000, '4 months', NOW()),
-- HDFC opportunities
(3, 'IT Analyst Intern', 'Mumbai, Maharashtra', 4, 7.0, 'Java, SQL, Banking Domain Knowledge', 24000, '5 months', NOW()),
(3, 'Risk Analyst Intern', 'Mumbai, Maharashtra', 3, 6.5, 'Excel, Statistics, Risk Management', 20000, '4 months', NOW()),
(3, 'Digital Banking Intern', 'Bangalore, Karnataka', 2, 7.0, 'Mobile Apps, UI/UX, Digital Marketing', 22000, '4 months', NOW()),
-- Tata Steel opportunities
(4, 'Mechanical Engineer Intern', 'Jamshedpur, Jharkhand', 5, 6.5, 'CAD, Manufacturing, Quality Control', 18000, '6 months', NOW()),
(4, 'Process Engineer Intern', 'Jamshedpur, Jharkhand', 3, 7.0, 'Process Design, Safety, Quality', 19000, '5 months', NOW()),
(4, 'Quality Control Intern', 'Mumbai, Maharashtra', 2, 6.0, 'Quality Management, Testing, Documentation', 16000, '4 months', NOW()),
-- Reliance opportunities
(5, 'Chemical Engineer Intern', 'Mumbai, Maharashtra', 4, 7.0, 'Chemical Processes, Safety, Lab Work', 20000, '6 months', NOW()),
(5, 'Electrical Engineer Intern', 'Jamnagar, Gujarat', 3, 6.5, 'Circuit Design, Power Systems, PLC', 19000, '5 months', NOW()),
(5, 'Project Coordinator Intern', 'Mumbai, Maharashtra', 2, 7.0, 'Project Management, MS Office, Communication', 22000, '4 months', NOW());

-- =====================================================
-- 9. STUDENT PREFERENCES (3 preferences per student)
-- =====================================================
-- NOTE: student_preferences schema: profile_id, opportunity_id (nullable),
-- sector_preference, role_preference, location_preference, created_at

INSERT INTO student_preferences (profile_id, opportunity_id, sector_preference, role_preference, location_preference, created_at) VALUES
-- Student 1 (Siddhant) - CS
(60001, 1, 'IT/Consulting', 'Software Developer Intern', 'Mumbai, Maharashtra', NOW()),
(60001, 4, 'IT/Consulting', 'Full Stack Developer Intern', 'Bangalore, Karnataka', NOW()),
(60001, 3, 'IT/Consulting', 'Cloud Engineer Intern', 'Bangalore, Karnataka', NOW()),
-- Student 2 (Bittu) - CS
(60002, 4, 'IT/Consulting', 'Full Stack Developer Intern', 'Bangalore, Karnataka', NOW()),
(60002, 1, 'IT/Consulting', 'Software Developer Intern', 'Pune, Maharashtra', NOW()),
(60002, 5, 'IT/Consulting', 'DevOps Engineer Intern', 'Hyderabad, Telangana', NOW()),
-- Student 3 (Acv) - Electronics
(60003, 14, 'Conglomerate', 'Electrical Engineer Intern', 'Jamnagar, Gujarat', NOW()),
(60003, 5, 'IT/Consulting', 'DevOps Engineer Intern', 'Hyderabad, Telangana', NOW()),
(60003, 9, 'Banking & Finance', 'Digital Banking Intern', 'Bangalore, Karnataka', NOW()),
-- Student 4 (Intern Match) - CS
(60004, 3, 'IT/Consulting', 'Cloud Engineer Intern', 'Bangalore, Karnataka', NOW()),
(60004, 1, 'IT/Consulting', 'Software Developer Intern', 'Mumbai, Maharashtra', NOW()),
(60004, 4, 'IT/Consulting', 'Full Stack Developer Intern', 'Bangalore, Karnataka', NOW()),
-- Student 5 (Raina) - CS
(60005, 2, 'IT/Consulting', 'Data Analyst Intern', 'Pune, Maharashtra', NOW()),
(60005, 8, 'Banking & Finance', 'Risk Analyst Intern', 'Mumbai, Maharashtra', NOW()),
(60005, 6, 'IT/Consulting', 'Business Analyst Intern', 'Pune, Maharashtra', NOW()),
-- Student 6 (Buried Words) - Mechanical
(60006, 10, 'Manufacturing', 'Mechanical Engineer Intern', 'Jamshedpur, Jharkhand', NOW()),
(60006, 11, 'Manufacturing', 'Process Engineer Intern', 'Jamshedpur, Jharkhand', NOW()),
(60006, 12, 'Manufacturing', 'Quality Control Intern', 'Mumbai, Maharashtra', NOW()),
-- Student 7 (Yug Sharma) - Electrical
(60007, 14, 'Conglomerate', 'Electrical Engineer Intern', 'Jamnagar, Gujarat', NOW()),
(60007, 5, 'IT/Consulting', 'DevOps Engineer Intern', 'Hyderabad, Telangana', NOW()),
(60007, 15, 'Conglomerate', 'Project Coordinator Intern', 'Mumbai, Maharashtra', NOW()),
-- Student 8 (Yug Rajawat) - CS
(60008, 1, 'IT/Consulting', 'Software Developer Intern', 'Mumbai, Maharashtra', NOW()),
(60008, 5, 'IT/Consulting', 'DevOps Engineer Intern', 'Hyderabad, Telangana', NOW()),
(60008, 7, 'Banking & Finance', 'IT Analyst Intern', 'Mumbai, Maharashtra', NOW()),
-- Student 9 (Yug Rajawat Jr) - Civil
(60009, 12, 'Manufacturing', 'Quality Control Intern', 'Mumbai, Maharashtra', NOW()),
(60009, 15, 'Conglomerate', 'Project Coordinator Intern', 'Mumbai, Maharashtra', NOW()),
(60009, 11, 'Manufacturing', 'Process Engineer Intern', 'Jamshedpur, Jharkhand', NOW());

-- =====================================================
-- 10. ALLOCATION SCORES (Pre-calculated scores for matching)
-- =====================================================
-- NOTE: allocation_scores schema: profile_id, opportunity_id, total_score,
-- skills_score, academic_score, preference_score, branch_score, location_score,
-- calculated_at, updated_at

INSERT INTO allocation_scores (profile_id, opportunity_id, total_score, skills_score, academic_score, preference_score, branch_score, location_score, calculated_at) VALUES
-- Student 1 (Siddhant) scores
(60001, 1, 92.5, 95.0, 90.0, 95.0, 100.0, 85.0, NOW()), -- Software Developer Mumbai (Preference 1)
(60001, 4, 89.0, 92.0, 90.0, 90.0, 100.0, 80.0, NOW()), -- Full Stack Bangalore (Preference 2)
(60001, 3, 87.5, 90.0, 90.0, 85.0, 100.0, 80.0, NOW()), -- Cloud Engineer Bangalore (Preference 3)
-- Student 2 (Bittu) scores
(60002, 4, 91.0, 94.0, 88.0, 95.0, 100.0, 85.0, NOW()), -- Full Stack Bangalore (Preference 1)
(60002, 1, 88.5, 90.0, 88.0, 90.0, 100.0, 85.0, NOW()), -- Software Developer Pune (Preference 2)
(60002, 5, 86.0, 88.0, 88.0, 85.0, 100.0, 80.0, NOW()), -- DevOps Hyderabad (Preference 3)
-- Student 3 (Acv) scores
(60003, 14, 82.0, 85.0, 78.0, 90.0, 90.0, 75.0, NOW()), -- Electrical Engineer Jamnagar
(60003, 5, 78.5, 75.0, 78.0, 85.0, 80.0, 80.0, NOW()), -- DevOps Hyderabad
(60003, 9, 76.0, 70.0, 78.0, 80.0, 75.0, 85.0, NOW()), -- Digital Banking Bangalore
-- Student 4 (Intern Match) scores
(60004, 3, 94.0, 98.0, 95.0, 95.0, 100.0, 85.0, NOW()), -- Cloud Engineer Bangalore
(60004, 1, 92.0, 96.0, 95.0, 90.0, 100.0, 85.0, NOW()), -- Software Developer Mumbai
(60004, 4, 91.5, 95.0, 95.0, 88.0, 100.0, 85.0, NOW()), -- Full Stack Bangalore
-- Student 5 (Raina) scores
(60005, 2, 90.0, 93.0, 87.0, 95.0, 100.0, 80.0, NOW()), -- Data Analyst Pune
(60005, 8, 85.0, 82.0, 87.0, 90.0, 95.0, 85.0, NOW()), -- Risk Analyst Mumbai
(60005, 6, 83.5, 80.0, 87.0, 85.0, 95.0, 80.0, NOW()), -- Business Analyst Pune
-- Student 6 (Buried Words) scores
(60006, 10, 79.0, 82.0, 75.0, 90.0, 100.0, 65.0, NOW()), -- Mechanical Engineer Jamshedpur
(60006, 11, 77.5, 80.0, 75.0, 85.0, 95.0, 65.0, NOW()), -- Process Engineer Jamshedpur
(60006, 12, 75.0, 78.0, 75.0, 80.0, 90.0, 70.0, NOW()), -- Quality Control Mumbai
-- Student 7 (Yug Sharma) scores
(60007, 14, 84.0, 88.0, 80.0, 90.0, 95.0, 75.0, NOW()), -- Electrical Engineer Jamnagar
(60007, 5, 80.5, 82.0, 80.0, 85.0, 85.0, 80.0, NOW()), -- DevOps Hyderabad
(60007, 15, 78.0, 75.0, 80.0, 80.0, 80.0, 85.0, NOW()), -- Project Coordinator Mumbai
-- Student 8 (Yug Rajawat) scores
(60008, 1, 89.5, 92.0, 83.0, 95.0, 100.0, 85.0, NOW()), -- Software Developer Mumbai
(60008, 5, 87.0, 90.0, 83.0, 90.0, 95.0, 80.0, NOW()), -- DevOps Hyderabad
(60008, 7, 85.5, 88.0, 83.0, 85.0, 95.0, 85.0, NOW()), -- IT Analyst Mumbai
-- Student 9 (Yug Rajawat Jr) scores
(60009, 12, 74.0, 76.0, 76.0, 85.0, 80.0, 70.0, NOW()), -- Quality Control Mumbai
(60009, 15, 72.5, 74.0, 76.0, 80.0, 75.0, 70.0, NOW()), -- Project Coordinator Mumbai
(60009, 11, 70.0, 70.0, 76.0, 75.0, 75.0, 65.0, NOW()); -- Process Engineer Jamshedpur

-- =====================================================
-- 11. ALLOCATION STATUS (Some students allocated, some waiting)
-- =====================================================
-- NOTE: allocation_status schema: profile_id, opportunity_id, company_name, role,
-- sector, location, student_name, student_email, seats, status, allocation_score,
-- allocated_at, updated_at

INSERT INTO allocation_status (profile_id, opportunity_id, company_name, role, sector, location, student_name, student_email, status, allocation_score, allocated_at) VALUES
-- ALLOCATED Students (will receive emails)
(60001, 1, 'Tata Consultancy Services', 'Software Developer Intern', 'IT/Consulting', 'Mumbai, Maharashtra', 'Siddhant Akhade', 'siddhantakhade1@gmail.com', 'Allocated', 92.5, NOW()),
(60002, 4, 'Infosys Limited', 'Full Stack Developer Intern', 'IT/Consulting', 'Bangalore, Karnataka', 'Bittu Patil', 'bittupatil020206@gmail.com', 'Allocated', 91.0, NOW()),
(60004, 3, 'Tata Consultancy Services', 'Cloud Engineer Intern', 'IT/Consulting', 'Bangalore, Karnataka', 'Intern Match', 'internmatchsih@gmail.com', 'Allocated', 94.0, NOW()),
(60005, 2, 'Tata Consultancy Services', 'Data Analyst Intern', 'IT/Consulting', 'Pune, Maharashtra', 'Raina Shradha', 'rainashradhaa@gmail.com', 'Allocated', 90.0, NOW()),
(60008, 1, 'Tata Consultancy Services', 'Software Developer Intern', 'IT/Consulting', 'Mumbai, Maharashtra', 'Yug Rajawat', 'yugrajawat24@gmail.com', 'Allocated', 89.5, NOW()),
(60006, 10, 'Tata Steel', 'Mechanical Engineer Intern', 'Manufacturing', 'Jamshedpur, Jharkhand', 'Buried Words', 'theburiedwords755@gmail.com', 'Allocated', 79.0, NOW()),
(60007, 14, 'Reliance Industries', 'Electrical Engineer Intern', 'Conglomerate', 'Jamnagar, Gujarat', 'Yug Sharma', 'yug20162016@gmail.com', 'Allocated', 84.0, NOW()),
-- WAITING Students (backup allocations)
(60003, 14, 'Reliance Industries', 'Electrical Engineer Intern', 'Conglomerate', 'Jamnagar, Gujarat', 'Acv Kumar', 'acv12102021@gmail.com', 'Waiting', 82.0, NOW()),
(60009, 12, 'Tata Steel', 'Quality Control Intern', 'Manufacturing', 'Mumbai, Maharashtra', 'Yug Rajawat Jr', 'yugrajawat23@gmail.com', 'Waiting', 74.0, NOW());

-- =====================================================
-- 12. SEAT SUMMARY (Statistics for each opportunity)
-- =====================================================
-- NOTE: seat_summary schema: opportunity_id, company_name, role, total_seats,
-- allocated_seats, waiting_students
-- For simplicity, we'll insert minimal required fields

INSERT INTO seat_summary (opportunity_id, total_seats, allocated_seats, waiting_students) VALUES
(1, 5, 2, 0),  -- TCS Software Developer: 2 allocated out of 5
(2, 3, 1, 0),  -- TCS Data Analyst: 1 allocated out of 3
(3, 4, 1, 0),  -- TCS Cloud Engineer: 1 allocated out of 4
(4, 6, 1, 0),  -- Infosys Full Stack: 1 allocated out of 6
(5, 4, 0, 0),  -- Infosys DevOps: 0 allocated
(6, 2, 0, 0),  -- Infosys Business Analyst: 0 allocated
(7, 4, 0, 0),  -- HDFC IT Analyst: 0 allocated
(8, 3, 0, 0),  -- HDFC Risk Analyst: 0 allocated
(9, 2, 0, 0),  -- HDFC Digital Banking: 0 allocated
(10, 5, 1, 0), -- Tata Steel Mechanical: 1 allocated out of 5
(11, 3, 0, 0), -- Tata Steel Process: 0 allocated
(12, 2, 0, 1), -- Tata Steel Quality: 0 allocated (1 waiting)
(13, 4, 0, 0), -- Reliance Chemical: 0 allocated
(14, 3, 1, 1), -- Reliance Electrical: 1 allocated (1 waiting)
(15, 2, 0, 0); -- Reliance Project: 0 allocated

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT '✅ Mock data inserted successfully!' AS Status;

SELECT 'COMPANIES' AS Category, COUNT(*) AS Count FROM organizations
UNION ALL
SELECT 'STUDENTS', COUNT(*) FROM users
UNION ALL
SELECT 'STUDENT PROFILES', COUNT(*) FROM student_profiles
UNION ALL
SELECT 'VERIFIED STUDENTS', COUNT(*) FROM verification WHERE is_verified = TRUE
UNION ALL
SELECT 'RESUMES UPLOADED', COUNT(*) FROM resumes
UNION ALL
SELECT 'JOB POSTINGS', COUNT(*) FROM company_job_postings
UNION ALL
SELECT 'OPPORTUNITIES', COUNT(*) FROM opportunities
UNION ALL
SELECT 'PREFERENCES', COUNT(*) FROM student_preferences
UNION ALL
SELECT 'ALLOCATED', COUNT(*) FROM allocation_status WHERE status = 'Allocated'
UNION ALL
SELECT 'WAITING', COUNT(*) FROM allocation_status WHERE status = 'Waiting';

-- =====================================================
-- DETAILED VERIFICATION - Check first student profile
-- =====================================================
SELECT 
    'FIRST STUDENT CHECK' AS Test,
    u.user_id,
    u.email,
    sp.profile_id,
    sp.name,
    v.is_verified,
    r.resume_id,
    COUNT(pref.preference_id) as preferences_count
FROM users u
LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
LEFT JOIN verification v ON u.user_id = v.user_id
LEFT JOIN resumes r ON u.user_id = r.user_id
LEFT JOIN student_preferences pref ON sp.profile_id = pref.profile_id
WHERE u.email = 'siddhantakhade1@gmail.com'
GROUP BY u.user_id, u.email, sp.profile_id, sp.name, v.is_verified, r.resume_id;

-- =====================================================
-- VERIFY COMPANY JOB POSTINGS
-- =====================================================
SELECT 
    'COMPANY JOB POSTINGS' AS Test,
    o.organization_id,
    o.name AS company_name,
    o.email,
    COUNT(cjp.job_id) AS jobs_posted
FROM organizations o
LEFT JOIN company_job_postings cjp ON o.organization_id = cjp.organization_id
GROUP BY o.organization_id, o.name, o.email
ORDER BY o.organization_id;

-- =====================================================
-- END OF MOCK DATA SCRIPT
-- =====================================================
