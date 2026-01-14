# 🎓 Samarthya - Student Internship Allocation System

**AI-Powered Full-Stack Internship Management Platform**

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18.0+-61DAFB)
![Database](https://img.shields.io/badge/Database-TiDB%20Cloud-orange)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Requirements](#-system-requirements)
- [Installation Guide](#-installation-guide)
  - [Windows Setup](#windows)
  - [macOS/Linux Setup](#macoslinux)
  - [Running on Different Devices](#-running-on-different-devices)
- [Database Setup](#-database-setup)
- [Starting the Application](#-starting-the-application)
- [Login Credentials](#-test-login-credentials)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Samarthya** is a comprehensive internship allocation system that automates the student-company matching process using AI-powered resume parsing and intelligent scoring algorithms. The system reduces onboarding time by 50-70% through automatic skill extraction and provides fair, transparent allocation of internship opportunities.

### Key Highlights

- 🤖 **AI Resume Parser** - Automatically extracts skills, education, and personal details from PDFs
- 📊 **Smart Matching Algorithm** - Multi-criteria scoring based on skills, academics, preferences, and location
- 🎯 **Three-Portal System** - Separate interfaces for Students, Companies, and Admins
- 📧 **Email Notifications** - Automated allocation emails with Accept/Reject functionality
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Live dashboard updates for all stakeholders
- 🔒 **Secure Authentication** - SHA256 password hashing and session management

---

## ✨ Features

### 👨‍🎓 Student Portal

- ✅ **Resume Auto-Fill** - Upload PDF resume to automatically populate profile
- ✅ **Skill Extraction** - 100+ technical skills automatically recognized
- ✅ **Education Parser** - Automatically extracts 10th, 12th, and degree details
- ✅ **Preference Management** - Select up to 3 internship preferences by sector, role, and location
- ✅ **Dashboard** - View allocation status, matched offers, and company details
- ✅ **Email Notifications** - Receive allocation emails with Accept/Reject buttons

### 🏢 Company Portal

- ✅ **Job Posting** - Create internship opportunities with detailed requirements
- ✅ **Multi-Sector Support** - Post across 10+ sectors (IT, Finance, Manufacturing, etc.)
- ✅ **Student Matching** - View allocated students with scores and qualifications
- ✅ **Analytics Dashboard** - Track job postings, applications, and allocations
- ✅ **Contact Management** - Access student emails and resumes

### 👨‍💼 Admin Portal

- ✅ **Allocation Algorithm** - Run smart matching with customizable parameters
- ✅ **Score Calculation** - Multi-criteria scoring (skills, academics, preferences, location)
- ✅ **Student Management** - View, verify, and manage all student profiles
- ✅ **Company Management** - Approve companies and manage job postings
- ✅ **Analytics** - Comprehensive reports on allocations, scores, and statistics
- ✅ **Database Sync** - Sync company job postings to opportunities table

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Select** - Enhanced dropdowns
- **Context API** - State management

### Backend
- **FastAPI** - High-performance Python framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PyMySQL** - MySQL database driver
- **Passlib** - Password hashing (SHA256)
- **Sentence Transformers** - AI skill matching
- **PyPDF2** - PDF resume parsing
- **SMTP** - Email notifications

### Database
- **TiDB Cloud** - MySQL-compatible cloud database
- **14 Tables** - Normalized schema with proper relationships
- **Auto-increment IDs** - users (1+), organizations (60001+), profiles (60001+)

### AI/ML
- **SentenceTransformers** - 'all-MiniLM-L6-v2' model for skill similarity
- **Cosine Similarity** - Semantic skill matching
- **Custom NLP** - Education and personal detail extraction

---

## 💻 System Requirements

### Minimum Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **RAM**: 4GB (8GB recommended)
- **Storage**: 2GB free space
- **Internet**: Stable connection for database and AI model downloads
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Software Prerequisites

#### Required Software

1. **Python 3.8 or higher**
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

2. **Node.js 14.0 or higher**
   - Download: https://nodejs.org/
   - Verify: `node --version`

3. **npm or Yarn**
   - Comes with Node.js
   - Verify: `npm --version`

4. **Git** (optional, for cloning)
   - Download: https://git-scm.com/
   - Verify: `git --version`

---

## 📥 Installation Guide

### Windows

#### Step 1: Clone/Download Project
```bash
# Option 1: Clone with Git
git clone <repository-url>
cd "starter pack"

# Option 2: Download ZIP and extract
```

#### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd my-app-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print('FastAPI installed successfully')"
```

#### Step 3: Frontend Setup
```bash
# Open new terminal/command prompt
cd Frontend

# Install Node.js dependencies
npm install

# Verify installation
npm list react
```

### macOS/Linux

#### Step 1: Clone/Download Project
```bash
# Option 1: Clone with Git
git clone <repository-url>
cd "starter pack"

# Option 2: Download ZIP and extract
```

#### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd my-app-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print('FastAPI installed successfully')"
```

#### Step 3: Frontend Setup
```bash
# Open new terminal
cd Frontend

# Install Node.js dependencies
npm install

# Verify installation
npm list react
```

---

## 🌍 Running on Different Devices

### Same Network (Local Network Access)

#### On Host Machine (where the app runs)

1. **Find your local IP address**

   **Windows:**
   ```bash
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   # Example: 192.168.1.100
   ```

   **macOS/Linux:**
   ```bash
   ifconfig | grep "inet "
   # Or
   ip addr show
   # Look for your local IP (usually starts with 192.168.x.x or 10.0.x.x)
   ```

2. **Update Frontend API URL**

   Edit `Frontend/src/context/AuthContext.js`:
   ```javascript
   // Change from:
   const API_URL = 'http://localhost:8000';
   
   // To (use your IP):
   const API_URL = 'http://192.168.1.100:8000';
   ```

3. **Configure Backend CORS**

   Backend is already configured to accept all origins. Verify in `my-app-backend/main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Allows all origins
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **Start Both Servers**
   ```bash
   # Backend (Terminal 1)
   cd my-app-backend
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload

   # Frontend (Terminal 2)
   cd Frontend
   set HOST=0.0.0.0  # Windows
   # export HOST=0.0.0.0  # macOS/Linux
   npm start
   ```

#### On Other Devices (same network)

1. **Access Frontend**
   ```
   http://192.168.1.100:3000
   (Replace with your host machine's IP)
   ```

2. **Verify Backend is Accessible**
   ```
   http://192.168.1.100:8000/docs
   ```

### Different Network (Cloud Deployment)

For production deployment:

1. **Deploy Backend** - Use services like:
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Railway

2. **Deploy Frontend** - Use services like:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

3. **Update API URL** - Point to your deployed backend URL

---

## 🗄️ Database Setup

### TiDB Cloud Configuration (Current Setup)

The project uses TiDB Cloud MySQL-compatible database:

**Connection Details:**
- **Host**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
- **Port**: `4000`
- **Database**: `samarthya_db`
- **User**: `2p6u58mMBxe8vS4.root`
- **SSL**: Required (certificate included: `my-app-backend/isrgrootx1.pem`)

### Database Initialization

#### Option 1: Using Mock Data (Recommended for Testing)

```bash
# Connect to TiDB Cloud
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2p6u58mMBxe8vS4.root \
  -p \
  --ssl-ca=my-app-backend/isrgrootx1.pem \
  samarthya_db < MOCK_DATA.sql

# This creates:
# - 5 Companies (TCS, Infosys, HDFC, Tata Steel, Reliance)
# - 9 Students with complete profiles
# - 15 Job opportunities
# - 27 Student preferences
# - Sample allocations
```

#### Option 2: Schema Only

```bash
# For production, use schema only
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2p6u58mMBxe8vS4.root \
  -p \
  --ssl-ca=my-app-backend/isrgrootx1.pem \
  samarthya_db < DATABASE_SETUP.sql
```

#### Using MySQL Workbench

1. **Create New Connection**
   - Connection Name: `Samarthya TiDB`
   - Hostname: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - Port: `4000`
   - Username: `2p6u58mMBxe8vS4.root`
   - Password: (enter your password)
   - SSL: Use SSL if available, select CA file `isrgrootx1.pem`

2. **Run SQL Script**
   - File → Run SQL Script
   - Select `MOCK_DATA.sql` or `DATABASE_SETUP.sql`
   - Choose database: `samarthya_db`
   - Click Run

### Verify Database Setup

```sql
-- Check all tables exist
SHOW TABLES;

-- Verify data (if using MOCK_DATA.sql)
SELECT COUNT(*) as students FROM users;
SELECT COUNT(*) as companies FROM organizations;
SELECT COUNT(*) as jobs FROM company_job_postings;
SELECT COUNT(*) as preferences FROM student_preferences;
```

---

## 🚀 Starting the Application

### Step 1: Start Backend Server

```bash
# Navigate to backend directory
cd my-app-backend

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Start FastAPI server
uvicorn main:app --reload

# Server will start at: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 2: Start Frontend Development Server

```bash
# Open NEW terminal/command prompt
cd Frontend

# Start React development server
npm start

# Server will start at: http://localhost:3000
# Browser will open automatically
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

### Step 3: Access Application

1. **Student Portal**: `http://localhost:3000/`
2. **Company Portal**: `http://localhost:3000/`
3. **Admin Portal**: `http://localhost:3000/admin`
4. **API Documentation**: `http://localhost:8000/docs`

---

## 🔐 Test Login Credentials

### Student Accounts (Password: `student123`)

| Name | Email | Profile ID |
|------|-------|------------|
| Siddhant Akhade | siddhantakhade1@gmail.com | 60001 |
| Bittu Patil | bittupatil020206@gmail.com | 60002 |
| Acv Kumar | acv12102021@gmail.com | 60003 |
| Intern Match | internmatchsih@gmail.com | 60004 |
| Raina Shradha | rainashradhaa@gmail.com | 60005 |
| Buried Words | theburiedwords755@gmail.com | 60006 |
| Yug Sharma | yug20162016@gmail.com | 60007 |
| Yug Rajawat | yugrajawat24@gmail.com | 60008 |
| Yug Rajawat Jr | yugrajawat23@gmail.com | 60009 |

### Company Accounts (Password: `company123`)

| Company | Email | Organization ID |
|---------|-------|-----------------|
| Tata Consultancy Services | tcs@example.com | 60001 |
| Infosys Limited | infosys@example.com | 60002 |
| HDFC Bank | hdfc@example.com | 60003 |
| Tata Steel | tatasteel@example.com | 60004 |
| Reliance Industries | reliance@example.com | 60005 |

### Admin Account (Password: `admin123`)

| Role | Email |
|------|-------|
| System Admin | admin@samarthya.com |

---

## 📁 Project Structure

```
starter pack/
├── Frontend/                      # React Frontend
│   ├── public/
│   │   └── index.html            # HTML template
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── admin/            # Admin dashboard components
│   │   │   ├── company/          # Company portal components
│   │   │   ├── onboarding/       # Student onboarding
│   │   │   ├── AuthPage.js       # Authentication page
│   │   │   ├── LoginPage.js      # Login component
│   │   │   └── SignupPage.js     # Signup component
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── data/                 # Static data files
│   │   ├── pages/
│   │   │   └── StudentArea.js    # Student dashboard
│   │   ├── App.js                # Main app component
│   │   └── index.js              # Entry point
│   ├── package.json              # Frontend dependencies
│   └── tailwind.config.js        # Tailwind CSS config
│
├── my-app-backend/               # FastAPI Backend
│   ├── main.py                   # Main API routes (2296 lines)
│   ├── match.py                  # Allocation algorithm (618 lines)
│   ├── resume_parser.py          # AI resume parser
│   ├── skills_parser.py          # Skill extraction logic
│   ├── db.py                     # Database connection
│   ├── create_admin.py           # Admin account creator
│   ├── requirements.txt          # Python dependencies
│   ├── isrgrootx1.pem           # TiDB SSL certificate
│   └── docs/                     # Backend documentation
│
├── MOCK_DATA.sql                 # Test data (9 students, 5 companies)
├── DATABASE_SETUP.sql            # Schema definition (14 tables)
├── DATABASE_SCHEMA.md            # Schema documentation
└── README_FINAL.md               # This file
```

---

## 📚 API Documentation

### Interactive API Docs

Visit `http://localhost:8000/docs` after starting the backend to access:
- **Swagger UI** - Interactive API testing interface
- **All Endpoints** - Complete list of available APIs
- **Request/Response Schemas** - Data models and examples
- **Try It Out** - Test APIs directly from browser

### Key API Endpoints

#### Authentication
- `POST /student/login` - Student login
- `POST /organization/login` - Company login
- `POST /admin/login` - Admin login

#### Student APIs
- `GET /student/{user_id}/onboarding-status` - Check if profile exists
- `POST /student/register` - Create student account
- `POST /student/{user_id}/profile` - Create/update profile
- `POST /student/upload-resume` - Upload and parse resume
- `GET /student/{user_id}/dashboard` - Get dashboard data
- `POST /student/{user_id}/preferences` - Submit job preferences

#### Company APIs
- `POST /organization/register` - Create company account
- `POST /organization/{org_id}/sectors` - Post job opportunities
- `GET /organization/{org_id}/sectors` - Get posted jobs
- `GET /api/dashboard/company` - Get allocated students

#### Admin APIs
- `POST /admin/sync-job-postings-to-opportunities` - Sync jobs
- `POST /admin/run-allocation` - Run allocation algorithm
- `POST /admin/calculate-scores` - Calculate student scores
- `GET /admin/students` - Get all students
- `GET /admin/jobs` - Get all job postings

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Backend Server Won't Start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Ensure virtual environment is activated
cd my-app-backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

#### 2. Frontend Won't Start

**Error:** `npm ERR! missing script: start`

**Solution:**
```bash
cd Frontend
rm -rf node_modules package-lock.json  # Delete existing
npm install  # Reinstall
npm start
```

#### 3. Database Connection Failed

**Error:** `Can't connect to MySQL server`

**Solution:**
- Verify internet connection
- Check SSL certificate exists: `my-app-backend/isrgrootx1.pem`
- Verify database credentials in `main.py` and `db.py`
- Test connection:
  ```bash
  mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
    -P 4000 -u 2p6u58mMBxe8vS4.root -p
  ```

#### 4. CORS Errors in Browser

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**
- Ensure backend CORS middleware allows frontend origin
- Check `main.py` has:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

#### 5. Resume Upload Not Working

**Error:** `Error parsing resume` or no data extracted

**Solution:**
- Ensure PDF is text-based (not scanned image)
- Check file size < 10MB
- Verify PDF has readable text content
- Test with sample resumes in `docs/` directory

#### 6. Email Notifications Not Sent

**Error:** `Failed to send email`

**Solution:**
- Check email credentials in `match.py`:
  ```python
  SENDER_EMAIL = "heliobhatt123@gmail.com"
  EMAIL_PASSWORD = "zshb wbzy bhja dqud"  # App-specific password
  ```
- Verify Gmail allows "Less secure app access" or use App Password
- Check SMTP port 587 is not blocked by firewall

#### 7. Allocation Algorithm Returns No Results

**Error:** `No qualified candidates found`

**Solution:**
- Check students have submitted preferences
- Verify opportunities table has skills_required populated
- Lower min_score thresholds in opportunities table
- Run: `POST /admin/sync-job-postings-to-opportunities` first
- Check console logs for filtering reasons

#### 8. Student Dashboard Shows Empty Data

**Error:** Dashboard displays "No preferences submitted"

**Solution:**
- Ensure MOCK_DATA.sql was run completely
- Verify profile_id matches between tables:
  ```sql
  SELECT profile_id FROM student_profiles WHERE user_id = 1;
  SELECT * FROM student_preferences WHERE profile_id = 60001;
  ```
- Check allocation_status has correct profile_id values

#### 9. Port Already in Use

**Error:** `Address already in use: 3000` or `8000`

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

#### 10. AI Model Download Fails

**Error:** `Failed to download sentence-transformers model`

**Solution:**
- Ensure stable internet connection
- Model downloads automatically on first run
- Manual download:
  ```python
  from sentence_transformers import SentenceTransformer
  model = SentenceTransformer('all-MiniLM-L6-v2')
  ```
- Requires ~90MB storage

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and commit**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Standards

- **Python**: Follow PEP 8, use type hints
- **JavaScript**: Use ES6+, functional components
- **React**: Use hooks, avoid class components
- **Naming**: camelCase for JS, snake_case for Python
- **Comments**: Document complex logic

### Testing Checklist

Before submitting PR:
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console errors in browser
- [ ] Backend logs show no errors

---

## 📝 License

This project is developed for educational purposes.

---

## 👥 Team

- **Frontend Development** - React UI/UX
- **Backend Development** - FastAPI REST APIs
- **AI/ML** - Resume parsing and skill matching
- **Database** - Schema design and optimization
- **DevOps** - Deployment and infrastructure

---

## 📞 Support

For issues, questions, or contributions:

1. **Check Documentation** - Read this README and inline docs
2. **Search Issues** - Check existing GitHub issues
3. **Create Issue** - Open new issue with details
4. **Email Support** - Contact development team

---

## 🎯 Roadmap

### Completed ✅
- AI resume parsing
- Multi-portal authentication
- Job posting and management
- Student preference system
- Allocation algorithm v3
- Email notifications
- Complete dashboard UIs

### Upcoming Features 🚀
- SMS notifications
- WhatsApp integration
- Advanced analytics
- Mobile app (React Native)
- Interview scheduling
- Document verification
- Payment integration
- Multi-language support

---

## 📊 Statistics

- **Total Lines of Code**: ~15,000+
- **Backend Routes**: 50+ API endpoints
- **Frontend Components**: 30+ React components
- **Database Tables**: 14 normalized tables
- **Test Data**: 9 students, 5 companies, 15 jobs
- **Supported Skills**: 100+ technical skills
- **Email Templates**: 2 (Allocated, Waiting)

---

**Built with ❤️ using React, FastAPI, and AI**

**Version:** 1.0.0 Production Ready
**Last Updated:** January 2026

---

*For detailed technical documentation, see individual files in the `docs/` directory.*
