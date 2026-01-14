# 🎯 Quick Reference: Running Allocation

## ⚡ Fastest Way to Run Allocation

### Option 1: Python Script (Easiest)
```cmd
cd my-app-backend
python run_allocation.py
```

### Option 2: API Call (Best for Automation)
```cmd
curl -X POST http://localhost:8000/admin/run-allocation
```

### Option 3: PowerShell (Windows)
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/admin/run-allocation" -Method POST
```

---

## 📊 View Results

### API:
```cmd
curl http://localhost:8000/admin/allocation-statistics
```

### Database:
```sql
SELECT status, COUNT(*) FROM allocation_status GROUP BY status;
```

---

## 🔄 Run Reallocation

### Script:
```cmd
python run_allocation.py --realloc
```

### API:
```cmd
curl -X POST http://localhost:8000/admin/run-reallocation
```

---

## 🧪 Test Everything

```cmd
python test_allocation_api.py
```

---

## ✅ Pre-Check (Before Running)

```cmd
# Ensure backend is running
uvicorn main:app --reload

# Verify data exists
python -c "from match import engine; from sqlalchemy import text; conn = engine.connect(); print('Pending scores:', conn.execute(text('SELECT COUNT(*) FROM allocation_status WHERE status=\"pending\"')).fetchone()[0])"
```

---

## 📝 Common Commands

| Task | Command |
|------|---------|
| **Start Backend** | `uvicorn main:app --reload` |
| **Run Allocation** | `python run_allocation.py` |
| **Run Reallocation** | `python run_allocation.py --realloc` |
| **Test APIs** | `python test_allocation_api.py` |
| **View Stats (API)** | `curl http://localhost:8000/admin/allocation-statistics` |
| **View Stats (DB)** | `SELECT status, COUNT(*) FROM allocation_status GROUP BY status;` |

---

## 🎨 For Developers: Add to Frontend

```javascript
const runAllocation = async () => {
  const response = await fetch('http://localhost:8000/admin/run-allocation', {
    method: 'POST'
  });
  const result = await response.json();
  console.log(result.statistics);
};
```

---

**Quick Start:** Just run `python run_allocation.py` and you're done! 🚀
