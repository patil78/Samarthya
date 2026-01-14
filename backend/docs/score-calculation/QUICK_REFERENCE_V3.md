# 🎯 Score Calculation v3.0 - Quick Reference Card

## At a Glance

```
┌─────────────────────────────────────────────────────────────┐
│  INTERNSHIP ALLOCATION SCORE v3.0 (Total: 100 Points)      │
├─────────────────────────────────────────────────────────────┤
│  ⭐⭐⭐ Skills Match         35 pts (35%)  [HIGHEST]         │
│  📚 Academic Performance    20 pts (20%)  [CGPA capped]    │
│     • CGPA (max at 8.0)     15 pts                          │
│     • Academic Trend         5 pts                          │
│  💡 Preference Ranking      20 pts (20%)                    │
│  🎓 Branch/Qualification    15 pts (15%)                    │
│  📍 Location Preference     10 pts (10%)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔢 Quick Calculations

### CGPA Score (15 points)
```
IF cgpa >= 8.0:
    score = 15.0 (FULL POINTS - CAPPED)
ELSE:
    score = (cgpa / 8.0) × 15.0

Examples:
9.5 → 15.0  (capped)
9.0 → 15.0  (capped)
8.0 → 15.0  (threshold)
7.5 → 14.06
7.0 → 13.13
6.5 → 12.19
6.0 → 11.25
```

### Skills Match (35 points)
```
score = 35 × (matched_skills / required_skills)

Examples:
4/4 skills → 35.0 pts
3/4 skills → 26.25 pts
2/4 skills → 17.5 pts
1/4 skills → 8.75 pts
0/4 skills → 0 pts
No data → 17.5 pts (partial credit)
```

### Preference Rank (20 points)
```
score = 20 × (1 - (rank - 1) × 0.2)

1st → 20 pts
2nd → 16 pts
3rd → 12 pts
4th → 8 pts
5th → 4 pts
```

### Academic Trend (5 points)
```
IF 10th ≤ 12th ≤ Degree: 5 pts (improving)
IF |Degree - 12th| ≤ 5%:  3 pts (consistent)
ELSE:                     1 pt  (declining)
```

---

## ⚡ Key Changes from v2.0

| Component | v2.0 | v3.0 | Change |
|-----------|------|------|--------|
| Skills | 25 pts | **35 pts** | ↑ +40% |
| CGPA Max | 10.0 | **8.0 (capped)** | 🔒 Capped |
| Academic | 25 pts | **20 pts** | ↓ -20% |
| Min Bonus | 5 pts | **Removed** | ❌ Gone |

---

## 🏆 Example Scenarios

### Scenario A: Perfect Match
```
Student: CGPA 8.0, All skills, 1st preference
Score = 15 + 5 + 20 + 35 + 15 + 10 = 100/100 ✅
```

### Scenario B: High CGPA, No Skills
```
Student: CGPA 9.5, No skills, 1st preference
Score = 15 + 5 + 20 + 0 + 15 + 10 = 65/100 ⚠️
```

### Scenario C: 8.0 vs 9.5 CGPA
```
Both get 15/15 for CGPA (capped at 8.0)
Skills make the difference! (35 points)
```

---

## 📊 Score Ranges

| Range | Interpretation | Action |
|-------|---------------|--------|
| 90-100 | Excellent Match | Top priority allocation |
| 80-89 | Strong Match | High priority |
| 70-79 | Good Match | Consider for allocation |
| 60-69 | Moderate Match | Review other options |
| <60 | Weak Match | Low priority |

---

## 🎯 Tips for Students

1. **Focus on Skills** (35%): 
   - Learn job-relevant technologies
   - Build projects, contribute to open source
   - Skills > CGPA beyond 8.0

2. **Target 8.0 CGPA** (15%):
   - No extra benefit above 8.0
   - After 8.0, focus on skills!

3. **Choose Preferences Wisely** (20%):
   - 1st preference: +20 pts
   - 5th preference: +4 pts
   - Difference: 16 points!

4. **Match Your Branch** (15%):
   - Apply to relevant roles
   - CS → Software = +15 pts

5. **Location Matters** (10%):
   - Realistic preferences
   - Same state = +5 pts

---

## 🔍 Disqualification Rules

```
IF student_score < company_min_score:
    DISQUALIFY (score = 0)
    
No bonus points for exceeding minimum (removed in v3.0)
```

---

## 📱 Quick Check

**"Will I get this internship?"**

Calculate your score:
1. CGPA ≥ 8.0? → 15 pts | Else (CGPA/8)×15
2. Trend improving? → 5 pts | Consistent → 3 pts
3. 1st preference? → 20 pts | 2nd → 16 pts...
4. Have all required skills? → 35 pts | Half → 17.5 pts
5. Branch matches? → 15 pts | Related → 12 pts
6. Location matches? → 10 pts | Same state → 5 pts

**Total ≥ 70? Good chance! ✅**
**Total < 60? Need improvement ⚠️**

---

## 💻 For Developers

### Function Call
```python
score = calculate_allocation_score(
    student_data,    # tuple with 21 fields
    opportunity,     # opportunity/job details
    preference_rank  # 1-5
)
```

### Returns
```python
float: 0-100 (or 0 if disqualified)
```

### Key Indices in student_data
```python
[9]  → cgpa
[8]  → skills
[12] → twelth_pct
[15] → tenth_pct
[7]  → branch
[17-19] → location preferences
```

---

## 📞 Quick Help

**Score too low?**
- Improve skills (highest impact: 35 pts)
- Check preference order
- Verify location preferences

**CGPA concerns?**
- 8.0+ is maximum
- Focus on skills after 8.0
- Trend matters (5 pts)

**Skills not matching?**
- Update profile with actual skills
- Upload resume (auto-extract skills)
- Learn in-demand technologies

---

**Version**: 3.0 | **Status**: 🟢 Live | **Updated**: Oct 13, 2025

---

## 🎓 Remember

> **"In v3.0, SKILLS > GRADES"**
> 
> A student with 8.0 CGPA and all required skills  
> will beat a student with 9.8 CGPA and no skills  
> **every single time!**

---

Print this card and keep it handy! 📌
