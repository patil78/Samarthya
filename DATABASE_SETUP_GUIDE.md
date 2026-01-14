# Database Setup Guide

## 🎯 Quick Start

### Step 1: Create Database
```sql
CREATE DATABASE samarthya_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE samarthya_db;
```

### Step 2: Run Setup Script
```bash
# Using MySQL command line
mysql -u your_username -p samarthya_db < DATABASE_SETUP.sql

# OR using MySQL Workbench
# 1. Open MySQL Workbench
# 2. Connect to your database
# 3. File > Run SQL Script
# 4. Select DATABASE_SETUP.sql
# 5. Click Run
```

### Step 3: Verify Setup
```sql
-- Check all tables
SHOW TABLES;

-- Should show 14 tables:
-- admins
-- allocation_scores
-- allocation_status
-- company_job_postings
-- opportunities
-- organization_sectors
-- organizations
-- resumes
-- seat_summary
-- sectors
-- student_preferences
-- student_profiles
-- users
-- verification
```

---

## 📊 Database Structure

### Core Tables (4)
1. **users** - Student accounts
2. **organizations** - Company accounts
3. **admins** - Admin accounts
4. **student_profiles** - Student detailed info

### Job & Matching (5)
5. **company_job_postings** - Job listings
6. **sectors** - Master sector list
7. **organization_sectors** - Company-sector mapping
8. **opportunities** - Extended job details
9. **student_preferences** - Student job preferences

### Allocation (3)
10. **allocation_scores** - Match scores
11. **allocation_status** - Final allocations
12. **seat_summary** - Statistics summary

### Supporting (2)
13. **resumes** - Resume files
14. **verification** - Aadhaar verification

---

## 🔗 Connection Settings

### TiDB Cloud (Current Production)
```python
DB_HOST = "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
DB_PORT = 4000
DB_USER = "2p6u58mMBxe8vS4.root"
DB_PASSWORD = "Z9A4YzsaLtwXXHmZ"
DB_NAME = "samarthya_db"
SSL_CA = "isrgrootx1.pem"
```

### Local MySQL (Development)
```python
DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWORD = "your_password"
DB_NAME = "samarthya_db"
```

Update in `my-app-backend/main.py`:
```python
engine = create_engine(
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
    connect_args=ssl_args if using_tidb else {},
    pool_recycle=3600
)
```

---

## 🔐 Post-Setup Tasks

### 1. Create Admin Account
```bash
cd my-app-backend
python create_admin.py
```

### 2. Populate Master Data (Optional)
The setup script already includes 20 common sectors. To add more:

```sql
INSERT INTO sectors (sector_name, description) VALUES
('Your Sector', 'Description here');
```

### 3. Test Database Connection
```bash
cd my-app-backend
python -c "from main import engine; print('✅ Connected!' if engine else '❌ Failed')"
```

---

## 📈 Database Maintenance

### Backup Database
```bash
# Full backup
mysqldump -u username -p samarthya_db > backup_$(date +%Y%m%d).sql

# Tables only (no data)
mysqldump -u username -p --no-data samarthya_db > schema_backup.sql
```

### Restore Database
```bash
mysql -u username -p samarthya_db < backup_file.sql
```

### Check Database Size
```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'samarthya_db'
ORDER BY (data_length + index_length) DESC;
```

### Optimize Tables
```sql
OPTIMIZE TABLE users, student_profiles, allocation_status;
```

---

## 🐛 Troubleshooting

### Error: "Table doesn't exist"
```sql
-- Check if tables were created
SHOW TABLES;

-- Re-run setup script
SOURCE DATABASE_SETUP.sql;
```

### Error: "Foreign key constraint fails"
```sql
-- Check foreign key constraints
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'samarthya_db' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Temporarily disable foreign key checks (be careful!)
SET FOREIGN_KEY_CHECKS=0;
-- Your operations here
SET FOREIGN_KEY_CHECKS=1;
```

### Error: "Unknown column"
- Column might be misspelled
- Check actual column names: `DESCRIBE table_name;`
- Note: `twelth_pct` has a typo (not `twelfth_pct`)

### Slow Queries
```sql
-- Check indexes
SHOW INDEX FROM student_profiles;

-- Add missing indexes
CREATE INDEX idx_your_column ON your_table(column_name);

-- Analyze query performance
EXPLAIN SELECT * FROM your_table WHERE condition;
```

---

## 📝 Important Notes

1. **Character Set**: Database uses `utf8mb4` for full Unicode support
2. **Typo**: Column `twelth_pct` (not `twelfth_pct`) - maintain for compatibility
3. **Cascade Delete**: Foreign keys set to CASCADE - deleting parent deletes children
4. **Timestamps**: All in UTC - adjust in application if needed
5. **Indexes**: Already optimized for common queries
6. **Admin Security**: Admin accounts created only via backend

---

## 🔄 Migration (From Old to New Database)

If you're migrating from an old database:

```sql
-- 1. Export data from old database
mysqldump -u user -p old_database > old_data.sql

-- 2. Create new database structure
mysql -u user -p samarthya_db < DATABASE_SETUP.sql

-- 3. Import compatible data
mysql -u user -p samarthya_db < old_data.sql

-- 4. Fix any incompatibilities manually
```

---

## ✅ Setup Checklist

- [ ] Database created: `samarthya_db`
- [ ] All 14 tables created successfully
- [ ] Master sectors inserted (20 rows)
- [ ] Foreign keys verified
- [ ] Indexes created
- [ ] Admin account created
- [ ] Backend connection tested
- [ ] First student signup tested
- [ ] First company signup tested
- [ ] Backup strategy in place

---

**Database is ready for production!** 🚀

For detailed schema documentation, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
