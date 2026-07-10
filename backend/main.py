# main.py

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Path, Request, Query
from db import get_connection
from utils import save_file, check_resume_format, parse_resume, extract_basic_details
from passlib.context import CryptContext
from pdfminer.high_level import extract_text
import os, re, json, random
from dotenv import load_dotenv
load_dotenv()
from fastapi.responses import HTMLResponse
from sqlalchemy import create_engine, text
import uvicorn
import pandas as pd
from typing import Optional
from match import engine, run_reallocation_for_student, process_acceptance_logic, run_allocation
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from twilio.rest import Client
from google.oauth2 import id_token
from google.auth.transport import requests

# --- NEW Pydantic Models for Preferences ---
class LocationModel(BaseModel):
    value: str
    label: str

class RoleModel(BaseModel):
    value: str
    label: str

class SectorModel(BaseModel):
    value: str
    label: str

class PreferenceModel(BaseModel):
    id: int
    sector: Optional[SectorModel] = None
    role: Optional[RoleModel] = None
    location: Optional[LocationModel] = None

class PreferencesRequest(BaseModel):
    preferences: List[PreferenceModel]

class GoogleLoginRequest(BaseModel):
    credential: str
    userType: str

import os

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ssl_cert_path = os.path.join(BASE_DIR, "isrgrootx1.pem")

ssl_args = {
    "ssl_ca": ssl_cert_path
}    

# -------------------------------
# DB CONNECTION
# -------------------------------
engine = create_engine(
    "mysql+pymysql://2p6u58mMBxe8vS4.root:Z9A4YzsaLtwXXHmZ@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/samarthya_db",
    connect_args=ssl_args,
    pool_recycle=280,
    pool_pre_ping=True
)

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
app = FastAPI(title="Student-Org Portal API")

# Allow frontend to access backend
origins = [
    "http://localhost:3000", 
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import the correct get_connection from db.py (mysql.connector version)
# The db.get_connection() is already imported at the top, so we can use it directly

# NOTE: /admin/run-allocation is defined later in this file (async version with full
# statistics, logging, and error handling). Do not add a duplicate route here.

# =======================
# DATABASE PING
# =======================
@app.get("/ping-db")
def ping_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return {"db_time": result[0]}

# =======================
# STUDENT SIGNUP / LOGIN
# =======================
@app.post("/student/signup")
def student_signup(email: str = Form(...), mobile: str = Form(...), password: str = Form(...)):
    with engine.connect() as conn:
        existing_user = conn.execute(
            text("SELECT user_id FROM users WHERE email=:email OR mobile=:mobile"),
            {"email": email, "mobile": mobile}
        ).fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        password_hash = pwd_context.hash(password)
        conn.execute(
            text("INSERT INTO users (email, password_hash, mobile) VALUES (:email, :p_hash, :mobile)"),
            {"email": email, "p_hash": password_hash, "mobile": mobile}
        )
        conn.commit()
    return {"message": "Student registered successfully"}

@app.post("/auth/google")
def google_auth(req: GoogleLoginRequest):
    try:
        # Note: We pass requests.Request() to google-auth to fetch Google public keys and verify signature.
        # We don't enforce checking the Client ID here to allow generic developer credentials.
        idinfo = id_token.verify_oauth2_token(req.credential, requests.Request())
        
        email = idinfo['email']
        name = idinfo.get('name', '')
    except Exception as e:
        print("Google token verification failed:", e)
        raise HTTPException(status_code=400, detail="Invalid Google token")

    user_type = req.userType
    with engine.connect() as conn:
        if user_type == 'student':
            # Check if student user exists in database
            row = conn.execute(
                text("SELECT user_id, mobile FROM users WHERE email=:email"),
                {"email": email}
            ).fetchone()
            
            if not row:
                # First time Google login - auto register student
                random_pass = str(random.randint(100000, 999999))
                password_hash = pwd_context.hash(random_pass)
                conn.execute(
                    text("INSERT INTO users (email, password_hash, mobile) VALUES (:email, :p_hash, NULL)"),
                    {"email": email, "p_hash": password_hash}
                )
                conn.commit()
                # Fetch new user details
                row = conn.execute(
                    text("SELECT user_id, mobile FROM users WHERE email=:email"),
                    {"email": email}
                ).fetchone()

            return {
                "message": "Login successful",
                "user_id": row[0],
                "mobile": row[1] or "",
                "name": name
            }

        elif user_type == 'admin':
            row = conn.execute(
                text("SELECT admin_id, name FROM admins WHERE email=:email"),
                {"email": email}
            ).fetchone()
            if not row:
                raise HTTPException(status_code=400, detail="This Google account is not registered as an Admin.")
            return {
                "message": "Login successful",
                "admin_id": row[0],
                "name": row[1]
            }

        else: # company
            row = conn.execute(
                text("SELECT organization_id, name FROM organizations WHERE email=:email"),
                {"email": email}
            ).fetchone()
            if not row:
                raise HTTPException(status_code=400, detail="This Google account is not registered as an Organization.")
            return {
                "message": "Login successful",
                "organization_id": row[0],
                "name": row[1]
            }

@app.post("/student/login")
def student_login(email: str = Form(...), password: str = Form(...)):
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT user_id, password_hash, mobile FROM users WHERE email=:email"),
            {"email": email}
        ).fetchone()

    if not row or not pwd_context.verify(password, row[1]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return {
    "message": "Login successful",
    "user_id": row[0],
    "mobile": row[2]
}
# =======================
# ORGANIZATION SIGNUP / LOGIN
# =======================
@app.post("/organization/signup")
def organization_signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    with engine.connect() as conn:
        existing_org = conn.execute(
            text("SELECT organization_id FROM organizations WHERE email=:email"),
            {"email": email}
        ).fetchone()
        if existing_org:
            raise HTTPException(status_code=400, detail="Email already registered")

        password_hash = pwd_context.hash(password)
        conn.execute(
            text("INSERT INTO organizations (name, email, password_hash) VALUES (:name, :email, :p_hash)"),
            {"name": name, "email": email, "p_hash": password_hash}
        )
        conn.commit()
    return {"message": "Organization registered successfully"}

@app.post("/organization/login")
def organization_login(email: str = Form(...), password: str = Form(...)):
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT organization_id, password_hash FROM organizations WHERE email=:email"),
            {"email": email}
        ).fetchone()

    if not row or not pwd_context.verify(password, row[1]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return {"message": "Login successful", "organization_id": row[0]}

# =======================
# ADMIN SIGNUP / LOGIN
# =======================
@app.post("/admin/signup")
def admin_signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    with engine.connect() as conn:
        # Check if admin table exists, if not create it
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS admins (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()
        
        # Check if admin already exists
        existing_admin = conn.execute(
            text("SELECT admin_id FROM admins WHERE email=:email"),
            {"email": email}
        ).fetchone()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Admin already exists")

        password_hash = pwd_context.hash(password)
        conn.execute(
            text("INSERT INTO admins (name, email, password_hash) VALUES (:name, :email, :p_hash)"),
            {"name": name, "email": email, "p_hash": password_hash}
        )
        conn.commit()
    return {"message": "Admin registered successfully"}

@app.post("/admin/login")
def admin_login(email: str = Form(...), password: str = Form(...)):
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT admin_id, password_hash, name FROM admins WHERE email=:email"),
            {"email": email}
        ).fetchone()

    if not row or not pwd_context.verify(password, row[1]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return {"message": "Login successful", "admin_id": row[0], "name": row[2]}

# =======================
# ORGANIZATION SECTORS CRUD
# =======================
@app.post("/organization/{org_id}/sectors")
def add_sector(org_id: int, sector_name: str = Form(...), location: str = Form(None),
               role: str = Form(None), stipend: float = Form(None), vacancies: int = Form(None),
               education_required: str = Form(None), duration: str = Form(None), min_score: float = Form(None),
               skills_required: str = Form(None), description: str = Form(None)):
    try:
        print(f"\n--- POST /organization/{org_id}/sectors ---")
        print(f"Received data: sector={sector_name}, role={role}, location={location}")
        print(f"stipend={stipend}, vacancies={vacancies}, education={education_required}")
        print(f"duration={duration}, min_score={min_score}")
        print(f"skills_required={skills_required}, description={description}")
        
        conn = get_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        cursor = conn.cursor()
        
        # Check if organization exists
        cursor.execute("SELECT organization_id FROM organizations WHERE organization_id=%s", (org_id,))
        org_result = cursor.fetchone()
        print(f"Organization check result: {org_result}")
        
        if not org_result:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail=f"Organization with ID {org_id} not found")
        
        # Insert directly into company_job_postings table (new simplified table)
        cursor.execute("""
            INSERT INTO company_job_postings 
            (organization_id, sector_name, role, location, stipend, vacancies, 
             education_required, duration, min_score, skills_required, description, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Active')
        """, (org_id, sector_name, role, location, stipend, vacancies, 
              education_required, duration, min_score, skills_required, description))
        
        job_id = cursor.lastrowid
        conn.commit()
        print(f"✅ Successfully created job posting with ID: {job_id}")
        
        cursor.close()
        conn.close()
        
        return {
            "message": "Job posted successfully",
            "job_id": job_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in add_sector: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/organization/{org_id}/sectors")
def list_sectors(org_id: int):
    print(f"\n--- GET /organization/{org_id}/sectors ---")
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    # Fetch from company_job_postings table
    cursor.execute("""
        SELECT 
            job_id,
            organization_id,
            sector_name,
            role,
            location,
            stipend,
            vacancies,
            education_required,
            duration,
            min_score,
            skills_required,
            description,
            status,
            created_at,
            updated_at
        FROM company_job_postings 
        WHERE organization_id=%s
        ORDER BY created_at DESC
    """, (org_id,))
    rows = cursor.fetchall()
    print(f"Found {len(rows)} job postings for organization {org_id}")
    if rows:
        print(f"First job: {rows[0].get('role', 'N/A')} - {rows[0].get('sector_name', 'N/A')}")
    cursor.close()
    conn.close()
    return {"sectors": rows}

@app.put("/organization/sectors/{sector_id}")
def update_sector(sector_id: int, sector_name: str = Form(None), location: str = Form(None),
                  role: str = Form(None), stipend: float = Form(None), vacancies: int = Form(None),
                  education_required: str = Form(None), duration: str = Form(None), min_score: float = Form(None),
                  skills_required: str = Form(None), description: str = Form(None)):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if job posting exists (sector_id is actually job_id in new table)
    cursor.execute("SELECT job_id FROM company_job_postings WHERE job_id=%s", (sector_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if sector_name is not None:
        update_fields.append("sector_name=%s")
        update_values.append(sector_name)
    if location is not None:
        update_fields.append("location=%s")
        update_values.append(location)
    if role is not None:
        update_fields.append("role=%s")
        update_values.append(role)
    if stipend is not None:
        update_fields.append("stipend=%s")
        update_values.append(stipend)
    if vacancies is not None:
        update_fields.append("vacancies=%s")
        update_values.append(vacancies)
    if education_required is not None:
        update_fields.append("education_required=%s")
        update_values.append(education_required)
    if duration is not None:
        update_fields.append("duration=%s")
        update_values.append(duration)
    if min_score is not None:
        update_fields.append("min_score=%s")
        update_values.append(min_score)
    if skills_required is not None:
        update_fields.append("skills_required=%s")
        update_values.append(skills_required)
    if description is not None:
        update_fields.append("description=%s")
        update_values.append(description)
    
    if update_fields:
        update_values.append(sector_id)
        query = f"UPDATE company_job_postings SET {', '.join(update_fields)} WHERE job_id=%s"
        cursor.execute(query, tuple(update_values))
        conn.commit()
    
    cursor.close()
    conn.close()
    return {"message": "Job posting updated successfully"}

@app.delete("/organization/{org_id}/sectors/{sector_id}")
def delete_sector(org_id: int, sector_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if job posting belongs to the organization (sector_id is actually job_id)
    cursor.execute("""
        SELECT job_id FROM company_job_postings 
        WHERE job_id=%s AND organization_id=%s
    """, (sector_id, org_id))
    
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Job posting not found or unauthorized")
    
    # Delete the job posting
    cursor.execute("DELETE FROM company_job_postings WHERE job_id=%s", (sector_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Job posting deleted successfully"}

# =======================
# COMPANY JOB POSTINGS TO OPPORTUNITIES SYNC
# =======================
@app.post("/admin/sync-job-postings-to-opportunities")
def sync_job_postings_to_opportunities():
    """
    Syncs company_job_postings to the opportunities table for allocation.
    This creates opportunities that students can be matched against.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        print("\n--- Syncing Company Job Postings to Opportunities ---")
        
        # Get all active job postings from company_job_postings
        cursor.execute("""
            SELECT 
                cjp.job_id,
                cjp.organization_id,
                cjp.sector_name,
                cjp.role,
                cjp.location,
                cjp.stipend,
                cjp.vacancies,
                cjp.education_required,
                cjp.duration,
                cjp.min_score,
                cjp.skills_required,
                cjp.description,
                o.name as org_name
            FROM company_job_postings cjp
            JOIN organizations o ON cjp.organization_id = o.organization_id
            WHERE cjp.status = 'Active'
        """)
        
        job_postings = cursor.fetchall()
        print(f"Found {len(job_postings)} active job postings")
        
        synced_count = 0
        
        for job in job_postings:
            # Get or create sector
            cursor.execute("SELECT sector_id FROM sectors WHERE sector_name = %s", (job['sector_name'],))
            sector_row = cursor.fetchone()
            
            if sector_row:
                sector_id = sector_row['sector_id']
            else:
                cursor.execute("INSERT INTO sectors (sector_name) VALUES (%s)", (job['sector_name'],))
                sector_id = cursor.lastrowid
            
            # Get or create organization_sector link
            cursor.execute("""
                SELECT org_sector_id FROM organization_sectors 
                WHERE organization_id = %s AND sector_id = %s
            """, (job['organization_id'], sector_id))
            
            org_sector_row = cursor.fetchone()
            
            if org_sector_row:
                org_sector_id = org_sector_row['org_sector_id']
            else:
                cursor.execute("""
                    INSERT INTO organization_sectors (organization_id, sector_id) 
                    VALUES (%s, %s)
                """, (job['organization_id'], sector_id))
                org_sector_id = cursor.lastrowid
            
            # Check if opportunity already exists for this org_sector and role/location
            cursor.execute("""
                SELECT opportunity_id FROM opportunities 
                WHERE org_sector_id = %s AND role = %s AND location = %s
            """, (org_sector_id, job['role'], job['location']))
            
            existing = cursor.fetchone()
            
            if not existing:
                # Create new opportunity
                cursor.execute("""
                    INSERT INTO opportunities (
                        org_sector_id, role, location, seats, education_required,
                        min_score, skills_required, stipend, duration, description
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    org_sector_id, job['role'], job['location'], job['vacancies'],
                    job['education_required'], job['min_score'], job['skills_required'],
                    job['stipend'], job['duration'], job['description']
                ))
                print(f"   ✅ Created opportunity for job_id {job['job_id']} - {job['role']} at {job['org_name']}")
                synced_count += 1
            else:
                print(f"   ⏭️  Opportunity already exists for {job['role']} at {job['location']}")
        
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"\n✅ Successfully synced {synced_count} job postings to opportunities")
        
        return {
            "message": "Job postings synced successfully",
            "synced_count": synced_count,
            "job_postings_processed": len(job_postings)
        }
        
    except Exception as e:
        print(f"❌ Error syncing job postings: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error syncing job postings: {str(e)}")

@app.get("/student/{profile_id}/resume")
def get_student_resume(profile_id: int):
    from fastapi.responses import FileResponse
    import os
    
    # Check if student exists
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM student_profiles WHERE profile_id=%s", (profile_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    
    user_id = row['user_id']
    
    # Check for resume file
    resume_path = f"uploads/resume/{user_id}_resume.pdf"
    
    if not os.path.exists(resume_path):
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return FileResponse(
        path=resume_path,
        media_type='application/pdf',
        filename=f"student_{profile_id}_resume.pdf"
    )

@app.get("/student/{user_id}/parse-resume-skills")
def parse_resume_skills(user_id: int):
    """
    Parse skills from student's uploaded resume.
    Returns array of skills for frontend display/editing.
    """
    from skills_parser import parse_skills_from_resume
    import os
    
    print(f"\n🔍 Parsing skills for user_id: {user_id}")
    
    # Check for resume file
    resume_path = f"uploads/resume/{user_id}_resume.pdf"
    
    if not os.path.exists(resume_path):
        print(f"❌ Resume not found at {resume_path}")
        raise HTTPException(status_code=404, detail="Resume not found. Please upload resume first.")
    
    # Parse skills from resume
    result = parse_skills_from_resume(resume_path)
    
    print(f"✅ Parsed {result['count']} skills: {result['skills_string']}")
    
    return {
        "success": True,
        "user_id": user_id,
        "skills": result['skills_array'],
        "count": result['count'],
        "message": f"Successfully extracted {result['count']} skills from resume"
    }

# =======================
# STUDENT VERIFICATION
# =======================
@app.post("/verify/aadhaar/{user_id}")
async def verify_aadhaar(user_id: int, aadhaar_number: str = Form(...), aadhaar_age: int = Form(...)):
    if len(aadhaar_number) != 12 or aadhaar_age < 21:
        raise HTTPException(status_code=400, detail="Aadhaar not eligible")

    conn = get_connection()
    cursor = conn.cursor()
    status = True  # Boolean instead of string "PASSED"

    cursor.execute("SELECT verification_id FROM verification WHERE user_id=%s", (user_id,))
    row = cursor.fetchone()
    if row:
        cursor.execute(
            "UPDATE verification SET aadhaar_number=%s, aadhaar_age=%s, is_verified=%s WHERE user_id=%s",
            (aadhaar_number, aadhaar_age, status, user_id)
        )
    else:
        cursor.execute(
            "INSERT INTO verification (user_id, aadhaar_number, aadhaar_age, is_verified) VALUES (%s,%s,%s,%s)",
            (user_id, aadhaar_number, aadhaar_age, status)
        )
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Aadhaar verification successful", "status": "verified"}

def calculate_age(dob_str: str) -> int:
    dob = datetime.strptime(dob_str, "%Y-%m-%d")
    today = datetime.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

# --- Personal Details Endpoint (Updated to handle Aadhaar and Age) ---
@app.post("/student/{user_id}/personal-details")
async def submit_personal_details(
    user_id: int,
    aadhaar_number: str = Form(...), # ✅ Added
    dob: str = Form(...),            # ✅ Added
    fullName: str = Form(...),
    studentMobile: str = Form(...),
    fatherName: str = Form(...),
    fatherMobile: str = Form(...),
    motherName: str = Form(...),
    motherMobile: str = Form(...),
    annualIncome: str = Form(...),
    incomeCertificate: UploadFile = File(...)
):
    try:
        # Calculate age from Date of Birth
        age = calculate_age(dob)
        
        # Sanitize income string
        sanitized_income = annualIncome.replace(",", "")

        with engine.connect() as conn:
            existing_record = conn.execute(
                text("SELECT verification_id FROM verification WHERE user_id = :user_id"),
                {"user_id": user_id}
            ).fetchone()

            if existing_record:
                # If record exists, UPDATE it with verification information only
                conn.execute(
                    text("""
                        UPDATE verification 
                        SET 
                            aadhaar_number = :aadhaar_number,
                            aadhaar_age = :aadhaar_age,
                            is_verified = TRUE,
                            verified_at = NOW()
                        WHERE user_id = :user_id
                    """),
                    {
                        "user_id": user_id,
                        "aadhaar_number": aadhaar_number,
                        "aadhaar_age": age,
                    }
                )
            else:
                # If no record exists, INSERT verification information
                conn.execute(
                    text("""
                        INSERT INTO verification 
                        (user_id, aadhaar_number, aadhaar_age, is_verified, verified_at)
                        VALUES 
                        (:user_id, :aadhaar_number, :aadhaar_age, TRUE, NOW())
                    """),
                    {
                        "user_id": user_id,
                        "aadhaar_number": aadhaar_number,
                        "aadhaar_age": age,
                    }
                )
            
            # Update or insert family details in student_profiles
            profile_check = conn.execute(
                text("SELECT profile_id FROM student_profiles WHERE user_id = :user_id"),
                {"user_id": user_id}
            ).fetchone()
            
            if profile_check:
                # Update existing profile with family details
                conn.execute(
                    text("""
                        UPDATE student_profiles
                        SET 
                            name = :name,
                            dob = :dob,
                            father_name = :father_name,
                            mother_name = :mother_name,
                            father_mobile = :father_mobile,
                            mother_mobile = :mother_mobile,
                            annual_income = :annual_income
                        WHERE user_id = :user_id
                    """),
                    {
                        "user_id": user_id,
                        "name": fullName,
                        "dob": dob,
                        "father_name": fatherName,
                        "mother_name": motherName,
                        "father_mobile": fatherMobile,
                        "mother_mobile": motherMobile,
                        "annual_income": sanitized_income,
                    }
                )
            else:
                # Create new profile with family details
                conn.execute(
                    text("""
                        INSERT INTO student_profiles
                        (user_id, name, dob, father_name, mother_name, father_mobile, mother_mobile, annual_income)
                        VALUES
                        (:user_id, :name, :dob, :father_name, :mother_name, :father_mobile, :mother_mobile, :annual_income)
                    """),
                    {
                        "user_id": user_id,
                        "name": fullName,
                        "dob": dob,
                        "father_name": fatherName,
                        "mother_name": motherName,
                        "father_mobile": fatherMobile,
                        "mother_mobile": motherMobile,
                        "annual_income": sanitized_income,
                    }
                )
            conn.commit()
        return {"message": "Personal details saved and verified successfully!"}
    except Exception as e:
        print(f"ERROR in personal-details endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# RESUME UPLOAD & PARSING
# =======================
# @app.post("/upload/resume/{user_id}")
# async def upload_resume(user_id: int, file: UploadFile = File(...)):
#     try:
#         with engine.connect() as conn:
#             # Verification check
#             row = conn.execute(text("SELECT is_verified FROM verification WHERE user_id = :uid"), {"uid": user_id}).fetchone()
#             if not row or not row[0]:  # Check for boolean TRUE
#                 raise HTTPException(status_code=403, detail="Aadhaar & Personal details not verified yet")

#             content = await file.read()
#             file_path = save_file(content, user_id, "resume") 

            

#             parsed_data = parse_resume(file_path)
#             skills_json = json.dumps(parsed_data.get("skills", []))
            
#             # Get or create student profile
#             profile_row = conn.execute(
#                 text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
#                 {"uid": user_id}
#             ).fetchone()
            
#             if not profile_row:
#                 # Create a basic profile if it doesn't exist
#                 conn.execute(
#                     text("INSERT INTO student_profiles (user_id) VALUES (:uid)"),
#                     {"uid": user_id}
#                 )
#                 conn.commit()
#                 profile_row = conn.execute(
#                     text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
#                     {"uid": user_id}
#                 ).fetchone()
            
#             profile_id = profile_row[0]
#             file_name = file.filename or f"resume_{user_id}.pdf"
#             file_size = len(content)

#             conn.execute(
#                 text("""
#                     INSERT INTO resumes (user_id, profile_id, file_path, file_name, file_size, extracted_skills, uploaded_at)
#                     VALUES (:uid, :profile_id, :path, :file_name, :file_size, :skills, NOW())
#                 """),
#                 {
#                     "uid": user_id, 
#                     "profile_id": profile_id,
#                     "path": file_path, 
#                     "file_name": file_name,
#                     "file_size": file_size,
#                     "skills": skills_json
#                 }
#             )
#             conn.commit()

#             autofill = extract_basic_details(file_path)

#             return {
#                 "message": "Resume uploaded & parsed successfully",
#                 "autofill": autofill,
#                 "parsed_skills": parsed_data.get("skills", []),
#                 "parsed_education": parsed_data.get("education", [])
#             }
#     except HTTPException as he:
#         raise he
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

#this is the extra vala code
@app.post("/upload/resume/{user_id}")
async def upload_resume(user_id: int, file: UploadFile = File(...)):
    try:
        with engine.connect() as conn:

            # -----------------------------
            # 1. GET REGISTERED EMAIL
            # -----------------------------
            user_row = conn.execute(
                text("SELECT email FROM users WHERE user_id = :uid"),
                {"uid": user_id}
            ).fetchone()

            if not user_row:
                raise HTTPException(status_code=404, detail="User not found")

            registered_email = user_row[0].lower().strip()

            # -----------------------------
            # 2. GET PROFILE NAME
            # -----------------------------
            profile_row = conn.execute(
                text("SELECT profile_id, name FROM student_profiles WHERE user_id = :uid"),
                {"uid": user_id}
            ).fetchone()

            if not profile_row:
                raise HTTPException(
                    status_code=400,
                    detail="Please fill personal details first"
                )

            profile_id = profile_row[0]
            profile_name = (profile_row[1] or "").lower().strip()

            # -----------------------------
            # 3. SAVE FILE
            # -----------------------------
            content = await file.read()
            file_path = save_file(content, user_id, "resume")

            # -----------------------------
            # 4. EXTRACT DETAILS
            # -----------------------------
            basic_details = extract_basic_details(file_path)

            resume_name = (basic_details.get("name") or "").lower().strip()
            resume_email = (basic_details.get("email") or "").lower().strip()

            # -----------------------------
            # 5. VALIDATION
            # -----------------------------
            if not resume_name or not resume_email:
                raise HTTPException(
                    status_code=400,
                    detail="Resume must contain name and email"
                )

            # EMAIL CHECK
            if resume_email != registered_email:
                raise HTTPException(
                    status_code=400,
                    detail="❌ Resume email does not match registered email"
                )

            # NAME CHECK (FIRST NAME MATCH)
            if profile_name.split()[0] not in resume_name:
                raise HTTPException(
                    status_code=400,
                    detail="❌ Resume name does not match your profile name"
                )

            # -----------------------------
            # 6. PARSE RESUME
            # -----------------------------
            parsed_data = parse_resume(file_path)

            # Convert skills list → string
            skills_text = ", ".join(parsed_data.get("skills", []))

            # -----------------------------
            # 7. SAVE TO DATABASE
            # -----------------------------
            conn.execute(
    text("""
        INSERT INTO resumes 
        (user_id, profile_id, file_path, file_name, file_size, extracted_skills, uploaded_at)
        VALUES (:uid, :pid, :path, :file_name, :file_size, :skills, NOW())
    """),
    {
        "uid": user_id,
        "pid": profile_id,
        "path": file_path,
        "file_name": file.filename,
        "file_size": len(content),
        "skills": skills_text
    }
)

            conn.commit()

            # -----------------------------
            # 8. RETURN RESPONSE
            # -----------------------------
            return {
                "message": "✅ Resume Verified Successfully",
                "autofill": basic_details,
                "parsed_skills": parsed_data.get("skills", []),
                "parsed_education": parsed_data.get("education", [])
            }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# STUDENT PROFILE
# =======================
@app.post("/student/profile/{user_id}")
async def create_student_profile(
    user_id: int, 
    # --- Basic Info ---
    name: str = Form(...), 
    dob: str = Form(None),
    
    # --- Degree Info ---
    college_name: str = Form(None), 
    degree: str = Form(None),
    qualification: str = Form(None),
    branch: str = Form(None),
    skills: str = Form(None),  # NEW: Skills field (comma-separated)
    cgpa: float = Form(None), 
    grad_year: int = Form(None),

    # --- 12th Info ---
    twelfth_school: str = Form(None), 
    twelfth_pct: float = Form(None), 
    twelfth_year: int = Form(None),

    # --- 10th Info ---
    tenth_school: str = Form(None), 
    tenth_pct: float = Form(None), 
    tenth_year: int = Form(None),
    
    # --- Location Preferences ---
    location_pref1: str = Form(None),
    location_pref2: str = Form(None),
    location_pref3: str = Form(None)
):
    try:
        with engine.connect() as conn:
            # Check if a profile for this user already exists
            profile_row = conn.execute(
                text("SELECT profile_id FROM student_profiles WHERE user_id = :user_id"), 
                {"user_id": user_id}
            ).fetchone()

            # Note the corrected spelling: 'twelth_school', 'twelth_pct', 'twelth_year'
            params = {
                "user_id": user_id, "name": name, "dob": dob, "college_name": college_name, 
                "degree": degree, "qualification": qualification, "branch": branch, "skills": skills,
                "cgpa": cgpa, "grad_year": grad_year, 
                "twelth_school": twelfth_school, "twelth_pct": twelfth_pct, "twelth_year": twelfth_year,
                "tenth_school": tenth_school, "tenth_pct": tenth_pct, "tenth_year": tenth_year,
                "location_pref1": location_pref1, "location_pref2": location_pref2, "location_pref3": location_pref3
            }

            if profile_row:
                # If it exists, UPDATE the profile
                profile_id = profile_row[0]
                params["profile_id"] = profile_id
                conn.execute(
                    text("""
                        UPDATE student_profiles SET 
                        name=:name, dob=:dob, college_name=:college_name, degree=:degree, qualification=:qualification,
                        branch=:branch, skills=:skills, cgpa=:cgpa, grad_year=:grad_year,
                        twelth_school=:twelth_school, twelth_pct=:twelth_pct, twelth_year=:twelth_year,
                        tenth_school=:tenth_school, tenth_pct=:tenth_pct, tenth_year=:tenth_year,
                        location_pref1=:location_pref1, location_pref2=:location_pref2, location_pref3=:location_pref3
                        WHERE profile_id = :profile_id
                    """),
                    params
                )
            else:
                # If it doesn't exist, INSERT a new profile
                result = conn.execute(
                    text("""
                        INSERT INTO student_profiles (
                            user_id, name, dob, college_name, degree, qualification, branch, skills, cgpa, grad_year,
                            twelth_school, twelth_pct, twelth_year, tenth_school, tenth_pct, tenth_year,
                            location_pref1, location_pref2, location_pref3
                        ) VALUES (
                            :user_id, :name, :dob, :college_name, :degree, :qualification, :branch, :skills, :cgpa, :grad_year,
                            :twelth_school, :twelth_pct, :twelth_year, :tenth_school, :tenth_pct, :tenth_year,
                            :location_pref1, :location_pref2, :location_pref3
                        )
                    """),
                    params
                )
                profile_id = result.lastrowid
            
            conn.commit()
        
        return {"message": "Student profile saved successfully", "profile_id": profile_id}
    except Exception as e:
        print(f"ERROR saving profile: {e}")
        raise HTTPException(status_code=500, detail=f"Database error while saving profile: {e}")

@app.get("/student/{user_id}/onboarding-status")
def get_onboarding_status(user_id: int):
    """Checks if a student has completed their profile onboarding."""
    with engine.connect() as conn:
        profile = conn.execute(
            text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
            {"uid": user_id}
        ).fetchone()
        
        # If a profile exists, onboarding is considered complete.
        is_complete = profile is not None
        return {"onboarding_complete": is_complete}


@app.get("/student/{user_id}/dashboard")
def get_student_dashboard_data(user_id: int):
    """Fetches all necessary data for the student's application dashboard."""
    with engine.connect() as conn:
        # 1. Get the student's profile_id from their user_id
        profile_row = conn.execute(
            text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
            {"uid": user_id}
        ).fetchone()

        if not profile_row:
            # If the student hasn't completed onboarding, return empty lists.
            return {"preferences": [], "offers": []}
        
        profile_id = profile_row[0]

        # 2. Get the student's actual submitted preferences from the database
        preferences_query = text("""
            SELECT 
                s.sector_name,
                o.role,
                o.location
            FROM student_preferences sp
            JOIN opportunities o ON sp.opportunity_id = o.opportunity_id
            JOIN organization_sectors os ON o.org_sector_id = os.org_sector_id
            JOIN sectors s ON os.sector_id = s.sector_id
            WHERE sp.profile_id = :pid
            ORDER BY sp.preference_id
        """)
        preferences_result = conn.execute(preferences_query, {"pid": profile_id}).fetchall()
        
        # Format the preferences into the structure the frontend expects
        preferences = [
            {
                "sector": {"label": row[0], "value": row[0]},
                "role": {"label": row[1], "value": row[1]},
                "location": {"label": row[2], "value": row[2]}
            } for row in preferences_result
        ]

               # 3. Get the student's matched offers from the allocation table
        offers_query = text("""
            SELECT 
                org.name as company_name,
                ast.role, 
                ast.sector,
                op.stipend,
                ast.location
            FROM allocation_status ast
            JOIN opportunities op ON ast.opportunity_id = op.opportunity_id
            JOIN organization_sectors os ON op.org_sector_id = os.org_sector_id
            JOIN organizations org ON os.organization_id = org.organization_id
            WHERE ast.profile_id = :pid AND ast.status = 'Allocated'
        """)
        offers_result = conn.execute(offers_query, {"pid": profile_id}).fetchall()
        
        # Format the offers for the frontend
        offers = [
            {
                "id": i + 1,  # Add unique ID for React keys
                "company": row[0],
                "role": {"label": row[1], "value": row[1]},
                "sector": {"label": row[2], "value": row[2]},
                "location": {"label": row[4], "value": row[4]} if row[4] else {"label": "Location TBD", "value": ""},
                "salary": f"₹{int(row[3])}/mo" if row[3] else "N/A",
                "logo": f"https://via.placeholder.com/40?text={row[0][0]}"
            } for i, row in enumerate(offers_result)
        ]

    return {"preferences": preferences, "offers": offers}

# =======================
# NEW: STUDENT PREFERENCES ENDPOINT
# =======================
@app.post("/student/{user_id}/preferences")
async def save_student_preferences(user_id: int, request: PreferencesRequest):
    print("\n--- Received request for /student/{user_id}/preferences ---")
    print(f"User ID: {user_id}")
    print(f"Incoming Preferences Data: {request.preferences}")

    try:
        with engine.connect() as conn:
            # First, get the student's profile_id from their user_id.
            profile_row = conn.execute(
                text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
                {"uid": user_id}
            ).fetchone()
            
            if not profile_row:
                print(f"❌ ERROR: Student profile not found for user_id {user_id}")
                raise HTTPException(status_code=404, detail="Student profile not found. Please complete previous steps.")
            
            profile_id = profile_row[0]
            print(f"Found profile_id: {profile_id}")

            # Clear any existing preferences for this student.
            conn.execute(
                text("DELETE FROM student_preferences WHERE profile_id = :pid"),
                {"pid": profile_id}
            )
            print(f"Cleared existing preferences for profile_id: {profile_id}")

            # Loop through the submitted preferences and insert them.
            saved_count = 0
            for idx, pref in enumerate(request.preferences):
                if pref.sector and pref.role and pref.location:
                    print(f"Processing preference {idx+1}: {pref.sector.label}, {pref.role.label}, {pref.location.label}")
                    # Find the corresponding opportunity_id from the database.
                    opportunity_row = conn.execute(
                        text("""
                            SELECT o.opportunity_id 
                            FROM opportunities o
                            JOIN organization_sectors os ON o.org_sector_id = os.org_sector_id
                            JOIN sectors s ON os.sector_id = s.sector_id
                            WHERE s.sector_name = :sector_name 
                            AND o.role = :role_name 
                            AND o.location = :location_name
                            LIMIT 1
                        """),
                        {
                            "sector_name": pref.sector.label,
                            "role_name": pref.role.label,
                            "location_name": pref.location.label
                        }
                    ).fetchone()

                    if opportunity_row:
                        # If opportunity exists, save with opportunity_id
                        opportunity_id = opportunity_row[0]
                        print(f"✅ Found matching opportunity_id: {opportunity_id}. Inserting...")
                        conn.execute(
                            text("""
                                INSERT INTO student_preferences 
                                (profile_id, opportunity_id, sector_preference, role_preference, location_preference) 
                                VALUES (:pid, :oid, :sector, :role, :location)
                            """),
                            {
                                "pid": profile_id,
                                "oid": opportunity_id,
                                "sector": pref.sector.label,
                                "role": pref.role.label,
                                "location": pref.location.label
                            }
                        )
                        saved_count += 1
                    else:
                        # If no opportunity exists, save the preference anyway with NULL opportunity_id
                        print(f"⚠️ No matching opportunity found. Saving preference as pending...")
                        conn.execute(
                            text("""
                                INSERT INTO student_preferences 
                                (profile_id, opportunity_id, sector_preference, role_preference, location_preference) 
                                VALUES (:pid, NULL, :sector, :role, :location)
                            """),
                            {
                                "pid": profile_id,
                                "sector": pref.sector.label,
                                "role": pref.role.label,
                                "location": pref.location.label
                            }
                        )
                        saved_count += 1
            
            conn.commit()
            print(f"✅ Successfully saved {saved_count} out of {len(request.preferences)} preferences")

        # 🆕 AUTO-TRIGGER SCORE CALCULATION
        print(f"\n🔄 Auto-calculating scores for profile_id {profile_id}...")
        try:
            calculate_student_scores(profile_id)
            print(f"✅ Scores calculated successfully for profile_id {profile_id}")
            calculation_message = "Allocation scores calculated automatically."
        except Exception as calc_error:
            print(f"⚠️ Warning: Score calculation failed: {calc_error}")
            import traceback
            traceback.print_exc()
            calculation_message = f"Warning: Score calculation failed - {str(calc_error)}"
            # Don't fail the entire request if score calculation fails

        return {
            "message": f"Preferences saved successfully! ({saved_count} preferences)", 
            "count": saved_count,
            "score_calculation": calculation_message
        }
    except Exception as e:
        print(f"❌ ERROR saving preferences: {e}")
        raise HTTPException(status_code=500, detail=f"Database error while saving preferences: {e}")  
    
# =======================
# GET STUDENT PREFERENCES
# =======================
@app.get("/student/{user_id}/preferences")
async def get_student_preferences(user_id: int):
    """
    Retrieve saved preferences for a student
    """
    print(f"\n--- GET request for /student/{user_id}/preferences ---")
    
    try:
        with engine.connect() as conn:
            # Get the student's profile_id
            profile_row = conn.execute(
                text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
                {"uid": user_id}
            ).fetchone()
            
            if not profile_row:
                print(f"No profile found for user_id {user_id}")
                return {"preferences": []}
            
            profile_id = profile_row[0]
            
            # Get all preferences for this student
            # Updated query to handle both cases: with and without opportunity_id
            preferences_rows = conn.execute(
                text("""
                    SELECT 
                        COALESCE(s.sector_name, sp.sector_preference) as sector_name,
                        COALESCE(o.role, sp.role_preference) as role,
                        COALESCE(o.location, sp.location_preference) as location
                    FROM student_preferences sp
                    LEFT JOIN opportunities o ON sp.opportunity_id = o.opportunity_id
                    LEFT JOIN organization_sectors os ON o.org_sector_id = os.org_sector_id
                    LEFT JOIN sectors s ON os.sector_id = s.sector_id
                    WHERE sp.profile_id = :pid
                    ORDER BY sp.preference_id
                """),
                {"pid": profile_id}
            ).fetchall()
            
            # Format the preferences to match the frontend structure
            preferences = []
            for row in preferences_rows:
                preferences.append({
                    "sector": {"value": row[0], "label": row[0]},
                    "role": {"value": row[1], "label": row[1]},
                    "location": {"value": row[2], "label": row[2]}
                })
            
            print(f"Found {len(preferences)} preferences for user_id {user_id}")
            return {"preferences": preferences}
            
    except Exception as e:
        print(f"Error fetching preferences: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching preferences: {e}")    

# =======================
# DROPDOWN DATA ENDPOINTS FOR PREFERENCES
# =======================

@app.get("/api/sectors")
async def get_all_sectors():
    """
    Get all available sectors that have opportunities/jobs
    """
    try:
        print("\n--- GET /api/sectors ---")
        with engine.connect() as conn:
            # First check if we have any opportunities at all
            total_opps = conn.execute(text("SELECT COUNT(*) FROM opportunities")).fetchone()[0]
            print(f"Total opportunities in database: {total_opps}")
            
            # Check organization_sectors
            org_sectors = conn.execute(text("SELECT COUNT(*) FROM organization_sectors")).fetchone()[0]
            print(f"Total organization_sectors: {org_sectors}")
            
            # Check sectors table
            all_sectors = conn.execute(text("SELECT * FROM sectors")).fetchall()
            print(f"All sectors in database: {[row[1] for row in all_sectors]}")
            
            sectors_rows = conn.execute(
                text("""
                    SELECT DISTINCT s.sector_name 
                    FROM sectors s
                    JOIN organization_sectors os ON s.sector_id = os.sector_id
                    JOIN opportunities o ON os.org_sector_id = o.org_sector_id
                    ORDER BY s.sector_name
                """)
            ).fetchall()
            
            print(f"Sectors with opportunities: {[row[0] for row in sectors_rows]}")
            sectors = [{"value": row[0], "label": row[0]} for row in sectors_rows]
            
            return {"sectors": sectors}
    except Exception as e:
        print(f"Error fetching sectors: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/roles")
async def get_roles_by_sector(sector: str = Query(...)):
    """
    Get all available roles for a specific sector
    """
    try:
        with engine.connect() as conn:
            roles_rows = conn.execute(
                text("""
                    SELECT DISTINCT o.role
                    FROM opportunities o
                    JOIN organization_sectors os ON o.org_sector_id = os.org_sector_id
                    JOIN sectors s ON os.sector_id = s.sector_id
                    WHERE s.sector_name = :sector_name
                    ORDER BY o.role
                """),
                {"sector_name": sector}
            ).fetchall()
            
            roles = [{"value": row[0], "label": row[0]} for row in roles_rows]
            
            return {"roles": roles}
    except Exception as e:
        print(f"Error fetching roles: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching roles: {e}")

@app.get("/api/locations")
async def get_locations_by_sector_and_role(
    sector: str = Query(...), 
    role: str = Query(...)
):
    """
    Get all available locations for a specific sector and role combination
    """
    try:
        with engine.connect() as conn:
            locations_rows = conn.execute(
                text("""
                    SELECT DISTINCT o.location
                    FROM opportunities o
                    JOIN organization_sectors os ON o.org_sector_id = os.org_sector_id
                    JOIN sectors s ON os.sector_id = s.sector_id
                    WHERE s.sector_name = :sector_name 
                    AND o.role = :role_name
                    ORDER BY o.location
                """),
                {"sector_name": sector, "role_name": role}
            ).fetchall()
            
            locations = [{"value": row[0], "label": row[0]} for row in locations_rows]
            
            return {"locations": locations}
    except Exception as e:
        print(f"Error fetching locations: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching locations: {e}")

# =======================
# GET MATCHED OFFERS FOR STUDENT
# =======================
@app.get("/student/{user_id}/matched-offers")
async def get_student_matched_offers(user_id: int):
    """
    Get all matched offers (allocated/waiting) for a student based on allocation results
    """
    print(f"\n--- GET request for /student/{user_id}/matched-offers ---")
    
    try:
        with engine.connect() as conn:
            # Get the student's profile_id
            profile_row = conn.execute(
                text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
                {"uid": user_id}
            ).fetchone()
            
            if not profile_row:
                print(f"No profile found for user_id {user_id}")
                return {"offers": []}
            
            profile_id = profile_row[0]
            
            # Get all allocated/waiting offers for this student
            offers_rows = conn.execute(
                text("""
                    SELECT 
                        als.opportunity_id,
                        als.company_name,
                        als.role,
                        als.sector,
                        als.allocation_score,
                        als.status,
                        o.location,
                        o.stipend,
                        o.duration
                    FROM allocation_status als
                    LEFT JOIN opportunities o ON als.opportunity_id = o.opportunity_id
                    WHERE als.profile_id = :pid
                    AND als.status IN ('Allocated', 'Waiting', 'Accepted')
                    ORDER BY 
                        CASE als.status
                            WHEN 'Accepted' THEN 1
                            WHEN 'Allocated' THEN 2
                            WHEN 'Waiting' THEN 3
                        END,
                        als.allocation_score DESC
                """),
                {"pid": profile_id}
            ).fetchall()
            
            # Format the offers
            offers = []
            for row in offers_rows:
                offers.append({
                    "id": row[0],
                    "company": row[1],
                    "role": row[2],
                    "sector": row[3],
                    "score": round(row[4], 2),
                    "status": row[5],
                    "location": row[6] or "Not specified",
                    "salary": f"₹{row[7]:,}/mo" if row[7] else "Not specified",
                    "duration": f"{row[8]} months" if row[8] else "Not specified"
                })
            
            print(f"Found {len(offers)} matched offers for user_id {user_id}")
            return {"offers": offers}
            
    except Exception as e:
        print(f"Error fetching matched offers: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching matched offers: {e}")

# =======================
# SCORE CALCULATION FUNCTIONS
# =======================
def calculate_allocation_score(student_data, opportunity, preference_rank):
    """
    Enhanced allocation score calculation - VERSION 3.0
    Higher score = Better match
    
    Score Components (Total: 100 points):
    - Skills Match: 35 points (MOST IMPORTANT - increased from 25)
    - Academic Performance: 20 points (CGPA: 15 [capped at 8.0] + Academic Trend: 5)
    - Preference Ranking: 20 points (Student's priority)
    - Branch/Qualification Match: 15 points (Relevant education)
    - Location Preference: 10 points (Practical consideration)
    - Min Score Bonus: REMOVED (was 5 points)
    
    Key Changes in v3.0:
    - Skills now 35% (was 25%) - Skills-first hiring
    - CGPA capped at 8.0 (full 15 points for 8.0+)
    - Academic reduced to 20% (was 25%)
    - Removed min score bonus complexity
    """
    score = 0.0
    breakdown = {}
    
    # ===== 1. ACADEMIC PERFORMANCE (20 points) - UPDATED =====
    try:
        # CGPA Score (15 points) - NEW: Capped at 8.0
        cgpa = float(student_data[9] if student_data[9] else 0)  # Index 9 is cgpa column
        
        # NEW LOGIC: 8.0 CGPA is the maximum threshold
        if cgpa >= 8.0:
            cgpa_score = 15.0  # Full points for 8.0+
            print(f"   ℹ️ CGPA: {cgpa:.2f} (≥8.0) → Full 15.0/15 points")
        else:
            # Proportional scoring for CGPA < 8.0
            cgpa_score = (cgpa / 8.0) * 15.0
            print(f"   ℹ️ CGPA: {cgpa:.2f} (<8.0) → {cgpa_score:.2f}/15 points")
        score += cgpa_score
        breakdown['cgpa'] = cgpa_score
        
        # Academic Consistency/Trend (5 points) - UNCHANGED
        tenth_pct = float(student_data[15] if student_data[15] else 0)  # Index 15 is tenth_pct
        twelfth_pct = float(student_data[12] if student_data[12] else 0)  # Index 12 is twelth_pct
        cgpa_percentage = cgpa * 10  # Convert CGPA to percentage scale
        
        if tenth_pct > 0 and twelfth_pct > 0:
            # Check if grades are improving or consistent
            if cgpa_percentage >= twelfth_pct >= tenth_pct:
                academic_trend = 5  # Improving trend
                print(f"   ℹ️ Academic Trend: Improving (10th:{tenth_pct}% → 12th:{twelfth_pct}% → Degree:{cgpa_percentage:.1f}%) → 5/5")
            elif abs(cgpa_percentage - twelfth_pct) < 5:
                academic_trend = 3  # Consistent
                print(f"   ℹ️ Academic Trend: Consistent → 3/5")
            else:
                academic_trend = 1  # Declining
                print(f"   ℹ️ Academic Trend: Declining → 1/5")
            score += academic_trend
            breakdown['academic_trend'] = academic_trend
        else:
            academic_trend = 2  # Partial credit for missing data
            breakdown['academic_trend'] = academic_trend
            score += academic_trend
            print(f"   ℹ️ Academic Trend: Missing data → 2/5 (partial credit)")
            
    except (ValueError, TypeError, IndexError) as e:
        cgpa_score = 7.5  # 50% of 15 points
        academic_trend = 2
        breakdown['cgpa'] = cgpa_score
        breakdown['academic_trend'] = academic_trend
        score += cgpa_score + academic_trend
        print(f"   ⚠️ Warning: Could not parse academic data: {e}")
    
    # ===== 2. PREFERENCE RANKING (20 points) - UNCHANGED =====
    preference_score = 20 * (1 - (preference_rank - 1) * 0.2)
    preference_score = max(0, preference_score)
    score += preference_score
    breakdown['preference'] = preference_score
    print(f"   ℹ️ Preference Rank {preference_rank}: {preference_score:.2f}/20")
    
    # ===== 3. SKILLS MATCH (35 points) - INCREASED FROM 25 =====
    try:
        # Get student skills from profile (index 8 in student_profiles after branch)
        student_skills = (student_data[8] if len(student_data) > 8 and student_data[8] else "").lower()
        
        # Check if opportunity has skills_required (for opportunities from company_job_postings)
        # Note: Old opportunities table doesn't have this field
        opportunity_skills = ""
        if hasattr(opportunity, 'skills_required'):
            opportunity_skills = (opportunity.skills_required or "").lower()
        elif len(opportunity) > 7:  # Check if tuple has skills_required field
            opportunity_skills = (opportunity[7] if opportunity[7] else "").lower()
        
        if student_skills and opportunity_skills:
            # Parse skills (comma-separated or space-separated)
            required_set = set(skill.strip() for skill in opportunity_skills.replace(',', ' ').split() if skill.strip())
            student_set = set(skill.strip() for skill in student_skills.replace(',', ' ').split() if skill.strip())
            
            # Calculate overlap
            matched_skills = required_set & student_set
            total_required = len(required_set)
            
            if total_required > 0:
                skills_score = 35 * (len(matched_skills) / total_required)  # CHANGED: 25 → 35
                breakdown['skills'] = skills_score
                breakdown['skills_matched'] = len(matched_skills)
                breakdown['skills_required'] = total_required
                print(f"   🎯 Skills Match: {len(matched_skills)}/{total_required} matched → {skills_score:.2f}/35 ({', '.join(matched_skills) if matched_skills else 'none'})")
            else:
                skills_score = 17.5  # CHANGED: 12.5 → 17.5 (50% of 35)
                breakdown['skills'] = skills_score
                print(f"   ℹ️ No required skills specified → {skills_score:.2f}/35 (partial credit)")
        else:
            # If no skills data, give partial credit (50%)
            skills_score = 17.5  # CHANGED: 12.5 → 17.5 (50% of 35)
            breakdown['skills'] = skills_score
            if not student_skills:
                print(f"   ⚠️ No student skills data available → {skills_score:.2f}/35 (partial credit)")
            if not opportunity_skills:
                print(f"   ℹ️ No job skills requirements specified → {skills_score:.2f}/35 (partial credit)")
        
        score += skills_score
        
    except (IndexError, TypeError) as e:
        skills_score = 17.5  # CHANGED: 12.5 → 17.5 (50% of 35)
        breakdown['skills'] = skills_score
        score += skills_score
        print(f"   ⚠️ Warning: Could not check skills match: {e} → {skills_score:.2f}/35 (partial credit)")
    
    # ===== 4. BRANCH/QUALIFICATION MATCH (15 points) - UNCHANGED =====
    try:
        student_branch = (student_data[7] if student_data[7] else "").lower()  # Index 7 is branch
        student_qual = (student_data[5] if student_data[5] else "").lower()   # Index 5 is degree
        
        # For opportunities from old system, we don't have education_required
        # Give partial points based on qualification level
        branch_score = 7.5  # Give 50% credit for now
        breakdown['branch'] = branch_score
        score += branch_score
        
        # TODO: When using company_job_postings:
        # job_education = opportunity.education_required
        # Exact branch match: 15 points
        # Engineering match: 10 points  
        # Qualification level match: 5 points
        
    except (IndexError, TypeError) as e:
        breakdown['branch'] = 0
        print(f"   Warning: Could not check branch match: {e}")
    
    # ===== 5. LOCATION PREFERENCE (10 points) =====
    try:
        location_pref_indices = [17, 18, 19]  # location_pref1, location_pref2, location_pref3
        student_locations = []
        for idx in location_pref_indices:
            if idx < len(student_data) and student_data[idx]:
                # Handle case where value might not be a string (e.g., datetime object)
                loc_value = student_data[idx]
                if isinstance(loc_value, str):
                    student_locations.append(loc_value.strip())
        
        opportunity_location = (opportunity[2] if len(opportunity) > 2 else "").strip()  # opportunity[2] is location
        
        if opportunity_location and opportunity_location in student_locations:
            location_score = 10  # Exact match
        elif opportunity_location and any(
            loc and loc.split(',')[-1].strip() == opportunity_location.split(',')[-1].strip() 
            for loc in student_locations
        ):
            location_score = 5  # Same state/region
        else:
            location_score = 0
        
        score += location_score
        breakdown['location'] = location_score
        
    except (IndexError, TypeError) as e:
        breakdown['location'] = 0
        print(f"   ⚠️ Warning: Could not check location match: {e}")
    
    # ===== 6. MIN SCORE BONUS - REMOVED IN v3.0 =====
    # Previous versions had 5-point bonus for exceeding min_score
    # Now removed for simplicity - direct cutoff is used instead
    # If company has min_score requirement, check after calculation
    
    # Print detailed breakdown
    print(f"   📊 Score Breakdown: CGPA={breakdown.get('cgpa', 0):.1f}/15 + Trend={breakdown.get('academic_trend', 0):.1f}/5 + " +
          f"Pref={breakdown['preference']:.1f}/20 + Skills={breakdown['skills']:.1f}/35 + " +
          f"Branch={breakdown.get('branch', 0):.1f}/15 + Location={breakdown['location']:.1f}/10")
    print(f"   ➡️ TOTAL SCORE: {score:.2f}/100")
    
    # DISQUALIFICATION CHECK (if company has min_score requirement)
    # This replaces the old bonus system with direct cutoff
    min_score_required = 0
    if hasattr(opportunity, 'min_score'):
        min_score_required = opportunity.min_score or 0
    elif len(opportunity) > 8:  # Check if tuple has min_score field
        min_score_required = opportunity[8] if opportunity[8] else 0
    
    if min_score_required > 0 and score < min_score_required:
        print(f"   ❌ DISQUALIFIED: Score {score:.2f} < Required {min_score_required}")
        return 0  # Mark as ineligible
    
    return round(score, 2)


def calculate_student_scores(profile_id: int):
    """
    Calculate allocation scores for a student based on their profile and preferences.
    This is called after student completes onboarding.
    """
    print(f"\n--- Calculating scores for profile_id: {profile_id} ---")
    
    try:
        with engine.connect() as conn:
            # Get student profile data with explicitly named columns
            student_data = conn.execute(
                text("""
                    SELECT sp.profile_id, sp.user_id, sp.name, sp.dob, sp.college_name, 
                           sp.degree, sp.qualification, sp.branch, sp.skills, sp.cgpa, sp.grad_year,
                           sp.twelth_school, sp.twelth_pct, sp.twelth_year, 
                           sp.tenth_school, sp.tenth_pct, sp.tenth_year,
                           sp.location_pref1, sp.location_pref2, sp.location_pref3,
                           u.email
                    FROM student_profiles sp
                    JOIN users u ON sp.user_id = u.user_id
                    WHERE sp.profile_id = :pid
                """),
                {"pid": profile_id}
            ).fetchone()
            
            if not student_data:
                print(f"❌ No student profile found for profile_id: {profile_id}")
                return
            
            # Get student preferences
            preferences = conn.execute(
                text("""
                    SELECT 
                        sp.preference_id,
                        sp.opportunity_id,
                        sp.sector_preference,
                        sp.role_preference,
                        sp.location_preference
                    FROM student_preferences sp
                    WHERE sp.profile_id = :pid
                    ORDER BY sp.preference_id
                """),
                {"pid": profile_id}
            ).fetchall()
            
            if not preferences:
                print(f"⚠️ No preferences found for profile_id: {profile_id}")
                return
            
            print(f"Found {len(preferences)} preferences to process")
            
            # Clear any existing allocation scores for this student (status = 'pending')
            conn.execute(
                text("DELETE FROM allocation_status WHERE profile_id = :pid AND status = 'pending'"),
                {"pid": profile_id}
            )
            conn.commit()
            print(f"Cleared existing pending allocation scores")
            
            # Calculate score for each preference
            scores_inserted = 0
            for pref_rank, pref in enumerate(preferences, start=1):
                opportunity_id = pref[1]
                
                # If preference has opportunity_id, calculate score
                if opportunity_id:
                    # Get opportunity details
                    opportunity = conn.execute(
                        text("""
                            SELECT 
                                o.opportunity_id,
                                o.role,
                                o.location,
                                o.stipend,
                                o.duration,
                                s.sector_name,
                                org.name
                            FROM opportunities o
                            JOIN organization_sectors os ON o.org_sector_id = os.org_sector_id
                            JOIN sectors s ON os.sector_id = s.sector_id
                            JOIN organizations org ON os.organization_id = org.organization_id
                            WHERE o.opportunity_id = :oid
                        """),
                        {"oid": opportunity_id}
                    ).fetchone()
                    
                    if opportunity:
                        # Calculate the score
                        score = calculate_allocation_score(
                            student_data=student_data,
                            opportunity=opportunity,
                            preference_rank=pref_rank
                        )
                        
                        # Insert into allocation_status table
                        conn.execute(
                            text("""
                                INSERT INTO allocation_status 
                                (profile_id, student_name, student_email, opportunity_id, role, company_name, 
                                 sector, allocation_score, status, seats)
                                VALUES (:pid, :name, :email, :oid, :role, :company, 
                                        :sector, :score, 'Not Allocated', 0)
                            """),
                            {
                                "pid": profile_id,
                                "name": student_data[2],  # Adjust index based on your table
                                "email": student_data[-1],  # Last column is email from JOIN
                                "oid": opportunity_id,
                                "role": opportunity[1],
                                "company": opportunity[6],
                                "sector": opportunity[5],
                                "score": score
                            }
                        )
                        conn.commit()
                        scores_inserted += 1
                        print(f"✅ Inserted score {score:.2f} for opportunity_id {opportunity_id} (preference rank {pref_rank})")
                
                # If preference has no opportunity_id, try to find matching opportunities
                else:
                    sector = pref[2]
                    role = pref[3]
                    location = pref[4]
                    
                    if sector and role and location:
                        # Find opportunities matching this preference
                        matching_opportunities = conn.execute(
                            text("""
                                SELECT 
                                    o.opportunity_id,
                                    o.role,
                                    o.location,
                                    o.stipend,
                                    o.duration,
                                    s.sector_name,
                                    org.name
                                FROM opportunities o
                                JOIN organization_sectors os ON o.org_sector_id = os.org_sector_id
                                JOIN sectors s ON os.sector_id = s.sector_id
                                JOIN organizations org ON os.organization_id = org.organization_id
                                WHERE s.sector_name = :sector
                                AND o.role = :role
                                AND o.location = :location
                            """),
                            {"sector": sector, "role": role, "location": location}
                        ).fetchall()
                        
                        for opportunity in matching_opportunities:
                            score = calculate_allocation_score(
                                student_data=student_data,
                                opportunity=opportunity,
                                preference_rank=pref_rank
                            )
                            
                            # Insert into allocation_status table
                            conn.execute(
                                text("""
                                    INSERT INTO allocation_status 
                                    (profile_id, student_name, student_email, opportunity_id, role, company_name, 
                                     sector, allocation_score, status, seats)
                                    VALUES (:pid, :name, :email, :oid, :role, :company, 
                                            :sector, :score, 'Not Allocated', 0)
                                """),
                                {
                                    "pid": profile_id,
                                    "name": student_data[2],
                                    "email": student_data[-1],
                                    "oid": opportunity[0],
                                    "role": opportunity[1],
                                    "company": opportunity[6],
                                    "sector": opportunity[5],
                                    "score": score
                                }
                            )
                            conn.commit()
                            scores_inserted += 1
                            print(f"✅ Inserted score {score:.2f} for opportunity_id {opportunity[0]} (preference rank {pref_rank})")
            
            print(f"\n✅ Successfully calculated and inserted {scores_inserted} allocation scores for profile_id {profile_id}")
            
    except Exception as e:
        print(f"❌ Error calculating scores: {e}")
        import traceback
        traceback.print_exc()
        raise


@app.post("/student/{user_id}/calculate-scores")
async def trigger_score_calculation(user_id: int):
    """
    Manually trigger score calculation for a student.
    Useful for recalculating scores after preference updates.
    """
    print(f"\n--- Manual score calculation triggered for user_id: {user_id} ---")
    
    try:
        with engine.connect() as conn:
            # Get profile_id from user_id
            profile_row = conn.execute(
                text("SELECT profile_id FROM student_profiles WHERE user_id = :uid"),
                {"uid": user_id}
            ).fetchone()
            
            if not profile_row:
                raise HTTPException(status_code=404, detail="Student profile not found")
            
            profile_id = profile_row[0]
            
            # Calculate scores
            calculate_student_scores(profile_id)
            
            return {
                "message": "Scores calculated successfully",
                "profile_id": profile_id,
                "user_id": user_id
            }
            
    except Exception as e:
        print(f"Error in trigger_score_calculation: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating scores: {e}")

# =======================
# GET STUDENT DATA
# =======================
@app.get("/student/data/{user_id}")
def get_student_data(user_id: int = Path(...)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM verification WHERE user_id=%s", (user_id,))
    verification = cursor.fetchone()
    cursor.execute("SELECT * FROM student_profiles WHERE user_id=%s", (user_id,))
    profile = cursor.fetchone()
    cursor.execute("SELECT * FROM resumes WHERE user_id=%s ORDER BY uploaded_at DESC LIMIT 1", (user_id,))
    resume = cursor.fetchone()
    cursor.close()
    conn.close()
    return {"verification": verification, "profile": profile, "resume": resume}

# =======================
# RESPOND TO ALLOCATION
# =======================
def create_html_response(message: str) -> HTMLResponse:
    html_content = f"""
        <html>
        <head>
            <title>Internship Response</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #f4f4f9; }}
                .container {{ background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: inline-block; }}
                h2 {{ color: #333; }}
                p {{ color: #555; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>{message}</h2>
                <p>You can now close this window.</p>
            </div>
        </body>
        </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

@app.get("/api/respond", response_class=HTMLResponse)
async def respond(profile_id: int = Query(...), opportunity_id: int = Query(...), response: str = Query(...)):
    if response not in ["Accepted", "Rejected"]:
        return create_html_response("❌ Invalid response provided.")
    try:
        if response == "Accepted":
            process_acceptance_logic(profile_id, opportunity_id)
            message = "✅ Thank you! You have ACCEPTED the internship offer. All your other offers/waitlists have been deactivated."
        elif response == "Rejected":
            run_reallocation_for_student(profile_id, opportunity_id)
            message = "✅ You have REJECTED the offer. The seat has been freed, and the next eligible student will be notified."
        return create_html_response(message)
    except Exception as e:
        print(f"Error processing response: {e}")
        return create_html_response(f"❌ An error occurred. Please contact support. Error: {str(e)}")

# ==================================
# COMPANY DASHBOARD DATA ENDPOINT
# ==================================
@app.get("/api/dashboard/company")
def get_company_dashboard(email: str = Query(...)):
    try:
        with engine.connect() as conn:
            org_id_result = conn.execute(
                text("SELECT organization_id FROM organizations WHERE email = :email"),
                {"email": email}
            ).fetchone()
        if not org_id_result:
            raise HTTPException(status_code=404, detail="Organization not found.")
        organization_id = org_id_result[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database lookup error: {e}")

    query = text("""
        SELECT
            ast.role,
            ast.sector AS sector,
            op.stipend,
            ast.student_name,
            ast.profile_id AS student_id,
            ast.student_email AS email,
            ast.status
        FROM allocation_status ast
        JOIN opportunities op ON ast.opportunity_id = op.opportunity_id
        JOIN organization_sectors os ON op.org_sector_id = os.org_sector_id
        WHERE os.organization_id = :org_id
        AND ast.status IN ('Allocated', 'Waiting', 'Accepted')
        ORDER BY ast.status DESC, ast.allocation_score DESC;
    """)

    try:
        with engine.connect() as conn:
            result_df = pd.read_sql(query, conn, params={"org_id": organization_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if result_df.empty:
        return {"message": "No active allocations or waitlist students found.", "data": []}

    return result_df.to_dict(orient="records")


# ==========================
# AADHAAR OTP VERIFICATION (TWILIO)
# ==========================

# ------------------ Twilio Credentials ------------------
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "YOUR_TWILIO_ACCOUNT_SID_PLACEHOLDER")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "YOUR_TWILIO_AUTH_TOKEN_PLACEHOLDER")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+18314803237")

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# ------------------ Mock Database ------------------
# ⚠️ TWILIO TRIAL: Destination numbers must be verified at console.twilio.com → Verified Caller IDs
# Add your own verified Indian mobile number below for testing.
mock_db = {
    "123456789012": {
        "name": "Shradha Raina",
        "mobile": "+918713826112",   # Must be verified in Twilio console
        "dob": "2002-05-15"
    },
    "987654321098": {
        "name": "Priya Verma",
        "mobile": "+917597474850",   # Must be verified in Twilio console
        "dob": "1997-09-20"
    },
    "477509063796": {
        "name": "Siddhant Akhade",
        "mobile": "+919769306483",   # Must be verified in Twilio console
        "dob": "2002-09-20"
    },
    "477509063798": {
        "name": "Siddhant Akhade",
        "mobile": "+918779441134",   # Must be verified in Twilio console
        "dob": "2000-09-20"
    },
    # ✅ ADD YOUR OWN VERIFIED NUMBER HERE FOR TESTING
    "111122223333": {
        "name": "Aastha",
        "mobile": "+917227913579",  
        "dob": "2003-01-01"         
    },
}

# ------------------ OTP Store ------------------
otp_store = {}

# ------------------ Models ------------------
class SendOtpRequest(BaseModel):
    aadhaar: str

class VerifyOtpRequest(BaseModel):
    aadhaar: str
    otp: str

# ------------------ Helper Functions ------------------
def send_twilio_otp(mobile: str, otp: str):
    message = twilio_client.messages.create(
        body=f"Your OTP for Aadhaar verification is {otp}. It is valid for 2 minutes.",
        from_=TWILIO_PHONE_NUMBER,
        to=mobile
    )
    return message.sid

# ------------------ API ROUTES ------------------

@app.post("/send-otp")
def send_otp(req: SendOtpRequest):
    if req.aadhaar not in mock_db:
        raise HTTPException(status_code=404, detail="Aadhaar not found in DB")

    otp = str(random.randint(100000, 999999))
    otp_store[req.aadhaar] = {"otp": otp, "expires": datetime.now() + timedelta(minutes=2)}

    mobile = mock_db[req.aadhaar]['mobile']

    # ✅ Always print OTP to console as dev fallback
    print(f"\n{'='*40}")
    print(f"🔐 OTP for Aadhaar {req.aadhaar}: {otp}")
    print(f"📱 Sending to: {mobile}")
    print(f"{'='*40}\n")

    try:
        sid = send_twilio_otp(mobile, otp)
        print(f"✅ Twilio SMS sent successfully. SID: {sid}")
        return {"message": f"✅ OTP sent to {mobile[-4:].rjust(len(mobile), '*')}", "sid": sid}
    except Exception as e:
        print(f"❌ Twilio failed: {e}")
        # In development, return success but note Twilio failure
        return {"message": f"⚠️ SMS delivery failed (Twilio error). Check server console for OTP. Error: {str(e)}"}

@app.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    if req.aadhaar not in otp_store:
        raise HTTPException(status_code=400, detail="No OTP generated for this Aadhaar")

    otp_data = otp_store[req.aadhaar]

    if datetime.now() > otp_data["expires"]:
        del otp_store[req.aadhaar]
        raise HTTPException(status_code=400, detail="OTP expired. Please request again.")

    if otp_data["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="❌ Invalid OTP")

    dob = mock_db[req.aadhaar]["dob"]
    age = calculate_age(dob)

    del otp_store[req.aadhaar]

    if 21 <= age <= 24:
        return {"message": f"✅ Aadhaar verified. Student is ELIGIBLE (Age {age})."}
    else:
        return {"message": f"❌ Aadhaar verified but NOT ELIGIBLE (Age {age})."}





# =======================
# ALLOCATION ALGORITHM ENDPOINTS
# =======================

@app.post("/admin/run-allocation")
async def trigger_allocation():
    """
    Triggers the allocation algorithm to assign students to opportunities.
    This should be run after students have submitted preferences and scores are calculated.
    
    The allocation algorithm will:
    1. Fetch all students with pending allocation scores
    2. Rank students by score for each opportunity
    3. Assign students to opportunities based on available seats
    4. Create waitlists for oversubscribed opportunities
    5. Send email notifications to students
    6. Update allocation_status and seat_summary tables
    """
    print("\n" + "=" * 60)
    print("🎯 STARTING ALLOCATION ALGORITHM")
    print("=" * 60)
    
    try:
        # Import and run the allocation function from match.py
        from match import run_allocation
        
        # Run the allocation
        result = run_allocation()
        
        print("\n" + "=" * 60)
        print("✅ ALLOCATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        
        # Fetch summary statistics
        with engine.connect() as conn:
            stats = conn.execute(text("""
                SELECT 
                    status,
                    COUNT(*) as count
                FROM allocation_status
                GROUP BY status
            """)).fetchall()
            
            stats_dict = {row[0]: row[1] for row in stats}
        
        return {
            "message": "Allocation completed successfully",
            "statistics": stats_dict,
            "details": result if result else "Allocation process completed"
        }
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ ALLOCATION FAILED")
        print("=" * 60)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Allocation failed: {str(e)}")


@app.post("/admin/run-reallocation")
async def trigger_full_reallocation():
    """
    Triggers reallocation for all opportunities.
    This promotes waiting students to allocated status when seats become available.
    Run this after students reject offers or to clean up the allocation state.
    """
    print("\n" + "=" * 60)
    print("♻️ STARTING FULL REALLOCATION")
    print("=" * 60)
    
    try:
        from match import run_reallocation
        
        result = run_reallocation()
        
        print("\n" + "=" * 60)
        print("✅ REALLOCATION COMPLETED")
        print("=" * 60)
        
        # Fetch updated statistics
        with engine.connect() as conn:
            stats = conn.execute(text("""
                SELECT 
                    status,
                    COUNT(*) as count
                FROM allocation_status
                GROUP BY status
            """)).fetchall()
            
            stats_dict = {row[0]: row[1] for row in stats}
        
        return {
            "message": "Reallocation completed successfully",
            "statistics": stats_dict,
            "details": result if result else "Reallocation process completed"
        }
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ REALLOCATION FAILED")
        print("=" * 60)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Reallocation failed: {str(e)}")


@app.post("/admin/run-reallocation/{opportunity_id}")
async def trigger_opportunity_reallocation(opportunity_id: int):
    """
    Triggers reallocation for a specific opportunity.
    Use this when a student rejects an offer for a particular role.
    
    Args:
        opportunity_id: The ID of the opportunity to reallocate
    """
    print(f"\n♻️ --- Starting Reallocation for Opportunity {opportunity_id} ---")
    
    try:
        from match import run_reallocation
        
        result = run_reallocation(specific_opportunity_id=opportunity_id)
        
        print(f"✅ Reallocation completed for opportunity {opportunity_id}")
        
        # Fetch statistics for this opportunity
        with engine.connect() as conn:
            stats = conn.execute(text("""
                SELECT 
                    status,
                    COUNT(*) as count
                FROM allocation_status
                WHERE opportunity_id = :oid
                GROUP BY status
            """), {"oid": opportunity_id}).fetchall()
            
            stats_dict = {row[0]: row[1] for row in stats}
            
            # Get opportunity details
            opp_details = conn.execute(text("""
                SELECT op.role, o.name as company_name
                FROM opportunities op
                JOIN organization_sectors os ON op.org_sector_id = os.org_sector_id
                JOIN organizations o ON os.organization_id = o.organization_id
                WHERE op.opportunity_id = :oid
            """), {"oid": opportunity_id}).fetchone()
        
        return {
            "message": f"Reallocation completed for opportunity {opportunity_id}",
            "opportunity": {
                "id": opportunity_id,
                "role": opp_details[0] if opp_details else "Unknown",
                "company": opp_details[1] if opp_details else "Unknown"
            },
            "statistics": stats_dict,
            "details": result if result else "Reallocation process completed"
        }
        
    except Exception as e:
        print(f"❌ Error running reallocation for opportunity {opportunity_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Reallocation failed: {str(e)}")


@app.get("/admin/allocation-statistics")
async def get_allocation_statistics():
    """
    Get comprehensive statistics about the current allocation state.
    Shows breakdowns by status, opportunity, and overall metrics.
    """
    try:
        with engine.connect() as conn:
            # Overall status breakdown
            status_stats = conn.execute(text("""
                SELECT 
                    status,
                    COUNT(*) as count
                FROM allocation_status
                GROUP BY status
            """)).fetchall()
            
            # Opportunity-wise breakdown
            opportunity_stats = conn.execute(text("""
                SELECT 
                    company_name,
                    role,
                    seats,
                    SUM(CASE WHEN status = 'Allocated' THEN 1 ELSE 0 END) as allocated,
                    SUM(CASE WHEN status = 'Waiting' THEN 1 ELSE 0 END) as waiting,
                    SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted
                FROM allocation_status
                GROUP BY company_name, role, seats
                ORDER BY company_name, role
            """)).fetchall()
            
            # Seat utilization
            seat_utilization = conn.execute(text("""
                SELECT 
                    SUM(seats) as total_seats,
                    SUM(CASE WHEN status = 'Allocated' THEN 1 ELSE 0 END) as filled_seats,
                    SUM(CASE WHEN status = 'Waiting' THEN 1 ELSE 0 END) as waiting_students
                FROM allocation_status
            """)).fetchone()
        
        return {
            "status_breakdown": {row[0]: row[1] for row in status_stats},
            "opportunities": [
                {
                    "company": row[0],
                    "role": row[1],
                    "total_seats": row[2],
                    "allocated": row[3],
                    "waiting": row[4],
                    "accepted": row[5],
                    "utilization_percentage": round((row[3] / row[2] * 100) if row[2] > 0 else 0, 2)
                }
                for row in opportunity_stats
            ],
            "overall": {
                "total_seats": seat_utilization[0] if seat_utilization else 0,
                "filled_seats": seat_utilization[1] if seat_utilization else 0,
                "waiting_students": seat_utilization[2] if seat_utilization else 0,
                "utilization_percentage": round((seat_utilization[1] / seat_utilization[0] * 100) if seat_utilization and seat_utilization[0] > 0 else 0, 2)
            }
        }
        
    except Exception as e:
        print(f"❌ Error fetching allocation statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")

# =======================
# ADMIN DATA ENDPOINTS
# =======================
@app.get("/admin/students")
async def get_all_students():
    """Get all registered students with their profile information"""
    try:
        with engine.connect() as conn:
            students = conn.execute(text("""
                SELECT 
                    u.user_id,
                    u.email,
                    u.mobile,
                    sp.name,
                    sp.dob,
                    sp.skills,
                    sp.degree,
                    sp.cgpa,
                    sp.tenth_pct,
                    sp.twelth_pct,
                    (SELECT GROUP_CONCAT(CONCAT(sector_preference, ' - ', role_preference) SEPARATOR ', ')
                     FROM student_preferences 
                     WHERE profile_id IN (SELECT profile_id FROM student_profiles WHERE user_id = u.user_id)
                     LIMIT 1) as top_preference
                FROM users u
                LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
                ORDER BY u.user_id DESC
            """)).fetchall()
            
            return {
                "students": [
                    {
                        "id": row[0],
                        "email": row[1],
                        "mobile": row[2],
                        "fullName": row[3],
                        "dob": str(row[4]) if row[4] else None,
                        "skills": row[5],
                        "degree": row[6],
                        "cgpa": float(row[7]) if row[7] else None,
                        "percentage_10th": float(row[8]) if row[8] else None,
                        "percentage_12th": float(row[9]) if row[9] else None,
                        "topPreference": row[10]
                    }
                    for row in students
                ],
                "total": len(students)
            }
    except Exception as e:
        print(f"❌ Error fetching students: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch students: {str(e)}")

@app.get("/admin/jobs")
async def get_all_jobs():
    """Get all job postings from companies"""
    try:
        with engine.connect() as conn:
            jobs = conn.execute(text("""
                SELECT 
                    cjp.job_id,
                    o.name as company_name,
                    o.email as company_email,
                    cjp.sector_name,
                    cjp.role,
                    cjp.location,
                    cjp.stipend,
                    cjp.vacancies,
                    cjp.education_required,
                    cjp.duration,
                    cjp.min_score,
                    cjp.skills_required,
                    cjp.description,
                    cjp.status,
                    cjp.created_at
                FROM company_job_postings cjp
                JOIN organizations o ON cjp.organization_id = o.organization_id
                ORDER BY cjp.created_at DESC
            """)).fetchall()
            
            return {
                "jobs": [
                    {
                        "job_id": row[0],
                        "companyName": row[1],
                        "companyEmail": row[2],
                        "sector": row[3],
                        "role": row[4],
                        "location": row[5],
                        "stipend": float(row[6]) if row[6] else None,
                        "vacancies": row[7],
                        "educationRequired": row[8],
                        "duration": row[9],
                        "minScore": float(row[10]) if row[10] else None,
                        "skills": row[11],
                        "description": row[12],
                        "status": row[13],
                        "createdAt": str(row[14]) if row[14] else None
                    }
                    for row in jobs
                ],
                "total": len(jobs)
            }
    except Exception as e:
        print(f"❌ Error fetching jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
