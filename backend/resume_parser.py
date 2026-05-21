"""
Enhanced Resume Parser Module
Extracts skills AND education details from resumes
"""

import re
from datetime import datetime
from pdfminer.high_level import extract_text
from skills_parser import extract_skills_from_text, COMPREHENSIVE_SKILLS

# Education-related keywords and patterns
DEGREE_PATTERNS = {
    'btech': r'\bb\.?\s*tech\b|\bbachelor[\'s]*\s+of\s+technology\b',
    'be': r'\bb\.?\s*e\.?\b|\bbachelor[\'s]*\s+of\s+engineer(?:ing)?\b',
    'mtech': r'\bm\.?\s*tech\b|\bmaster[\'s]*\s+of\s+technology\b',
    'me': r'\bm\.?\s*e\.?\b|\bmaster[\'s]*\s+of\s+engineer(?:ing)?\b',
    'bsc': r'\bb\.?\s*sc\.?\b|\bbachelor[\'s]*\s+of\s+science\b',
    'msc': r'\bm\.?\s*sc\.?\b|\bmaster[\'s]*\s+of\s+science\b',
    'bca': r'\bb\.?\s*c\.?\s*a\.?\b|\bbachelor[\'s]*\s+of\s+computer\s+applications?\b',
    'mca': r'\bm\.?\s*c\.?\s*a\.?\b|\bmaster[\'s]*\s+of\s+computer\s+applications?\b',
    'ba': r'\bb\.?\s*a\.?\b(?!\s*engineer)|\bbachelor[\'s]*\s+of\s+arts\b',
    'ma': r'\bm\.?\s*a\.?\b(?!\s*engineer)|\bmaster[\'s]*\s+of\s+arts\b',
    'bba': r'\bb\.?\s*b\.?\s*a\.?\b|\bbachelor[\'s]*\s+of\s+business\s+administration\b',
    'mba': r'\bm\.?\s*b\.?\s*a\.?\b|\bmaster[\'s]*\s+of\s+business\s+administration\b',
    'bcom': r'\bb\.?\s*com\.?\b|\bbachelor[\'s]*\s+of\s+commerce\b',
    'phd': r'\bph\.?\s*d\.?\b|\bdoctor[\'s]*\s+of\s+philosophy\b',
}

BRANCH_PATTERNS = {
    'computer science': r'computer\s+science|cs\b|cse\b',
    'information technology': r'information\s+technology|it\b',
    'electronics': r'electronics\s+(?:and\s+)?(?:communication|telecommunication)|ece\b|entc\b|electronics\b|telecommunication\b',
    'electrical': r'electrical\s+engineering|electrical\s+and\s+electronics|eee\b',
    'mechanical': r'mechanical\s+engineering|mechanical\b',
    'civil': r'civil\s+engineering|civil\b',
    'chemical': r'chemical\s+engineering|chemical\b',
    'biotechnology': r'biotechnology|biotech\b',
    'mathematics': r'mathematics|maths\b',
    'physics': r'physics\b',
    'chemistry': r'chemistry\b',
    'commerce': r'commerce\b',
    'business administration': r'business\s+administration|bba|mba',
    'data science': r'data\s+science',
    'artificial intelligence': r'artificial\s+intelligence|ai\b',
}

# CGPA/Percentage patterns
CGPA_PATTERNS = [
    r'cgpa[\s:]*(\d+\.?\d*)\s*(?:/\s*10)?',
    r'gpa[\s:]*(\d+\.?\d*)\s*(?:/\s*10)?',
    r'(\d+\.?\d*)\s*/\s*10\s+cgpa',
    r'grade[\s:]*(\d+\.?\d*)',
]

PERCENTAGE_PATTERNS = [
    r'(\d{2,3}\.?\d*)%',
    r'percentage[\s:]*(\d{2,3}\.?\d*)',
    r'marks[\s:]*(\d{2,3}\.?\d*)',
]

# School/College patterns
INSTITUTION_PATTERNS = [
    r'(university|institute|college|school)\s+of\s+[\w\s,]+',
    r'[\w\s]+\s+(university|institute|college|school)',
    r'(iit|nit|bits|iiit)\s+[\w]+',
]

# Year patterns
YEAR_PATTERNS = [
    r'\b(19|20)\d{2}\b',  # Years from 1900-2099
    r'\b\d{4}\s*[–-]\s*\d{4}\b',  # Year ranges like 2018-2022 or 2018 – 2022 (both hyphen and en-dash)
]


def extract_degree(text: str) -> str:
    """Extract degree information from text"""
    text_lower = text.lower()
    
    # Check degrees in specific order (more specific first to avoid false matches)
    degree_order = ['be', 'btech', 'me', 'mtech', 'phd', 'mca', 'bca', 'mba', 'bba', 'msc', 'bsc', 'ma', 'ba', 'bcom']
    
    for degree_name in degree_order:
        pattern = DEGREE_PATTERNS[degree_name]
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            # Return formatted degree name
            if degree_name == 'btech':
                return 'B.Tech'
            elif degree_name == 'be':
                return 'B.E.'
            elif degree_name == 'mtech':
                return 'M.Tech'
            elif degree_name == 'me':
                return 'M.E.'
            elif degree_name == 'bsc':
                return 'B.Sc'
            elif degree_name == 'msc':
                return 'M.Sc'
            elif degree_name == 'bca':
                return 'BCA'
            elif degree_name == 'mca':
                return 'MCA'
            elif degree_name == 'ba':
                return 'B.A.'
            elif degree_name == 'ma':
                return 'M.A.'
            elif degree_name == 'bba':
                return 'BBA'
            elif degree_name == 'mba':
                return 'MBA'
            elif degree_name == 'bcom':
                return 'B.Com'
            elif degree_name == 'phd':
                return 'Ph.D'
    
    return None


def extract_branch(text: str) -> str:
    """Extract branch/specialization from text"""
    text_lower = text.lower()
    
    for branch_name, pattern in BRANCH_PATTERNS.items():
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            return branch_name.title()
    
    return None


def extract_cgpa(text: str) -> float:
    """Extract CGPA from text"""
    text_lower = text.lower()
    
    # Look for CGPA patterns
    for pattern in CGPA_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        for match in matches:
            try:
                cgpa = float(match)
                # Validate CGPA range (0-10)
                if 0 <= cgpa <= 10:
                    return cgpa
            except ValueError:
                continue
    
    return None


def extract_percentage(text: str, context: str = 'degree') -> float:
    """Extract percentage from text with context (10th, 12th, degree)"""
    
    # Define context-specific search areas
    if context == '10th':
        # Look for 10th/SSC/Matriculation section
        pattern = r'(?:10th|ssc|matriculation|secondary)[\s\S]{0,200}'
    elif context == '12th':
        # Look for 12th/HSC/Intermediate section
        pattern = r'(?:12th|hsc|intermediate|higher\s+secondary)[\s\S]{0,200}'
    else:
        # For degree, look in education section
        pattern = r'(?:education|academic|degree)[\s\S]{0,500}'
    
    section_match = re.search(pattern, text, re.IGNORECASE)
    search_text = section_match.group() if section_match else text
    
    # Extract percentage
    for pct_pattern in PERCENTAGE_PATTERNS:
        matches = re.findall(pct_pattern, search_text, re.IGNORECASE)
        for match in matches:
            try:
                percentage = float(match)
                # Validate percentage range (0-100)
                if 0 <= percentage <= 100:
                    return percentage
            except ValueError:
                continue
    
    return None


def extract_graduation_year(text: str) -> int:
    """Extract expected graduation year from text with improved patterns"""
    current_year = datetime.now().year
    years = []
    
    # Priority 1: Look for explicit graduation year mentions
    graduation_patterns = [
        r'(?:expected\s+)?graduation[\s:]+(\d{4})',
        r'graduating\s+in[\s:]+(\d{4})',
        r'graduation\s+year[\s:]+(\d{4})',
        r'expected\s+to\s+graduate[\s:]+(\d{4})',
        r'(?:grad|graduation)[\s:]+[A-Za-z]+\s+(\d{4})',  # "Grad: May 2024"
    ]
    
    for pattern in graduation_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            try:
                year = int(match)
                if 1990 <= year <= current_year + 6:
                    years.append(year)
            except ValueError:
                continue
    
    # If found from explicit mentions, return the most recent
    if years:
        return max(years)
    
    # Priority 2: Find all years in the education section
    edu_section_match = re.search(r'education[\s\S]{0,1000}', text, re.IGNORECASE)
    search_text = edu_section_match.group() if edu_section_match else text[:2000]  # First 2000 chars
    
    # Find all years
    for pattern in YEAR_PATTERNS:
        matches = re.findall(pattern, search_text)
        for match in matches:
            # Handle year ranges
            if '-' in str(match):
                year_parts = str(match).split('-')
                for part in year_parts:
                    part = part.strip()
                    if part.isdigit():
                        year = int(part)
                        if 1990 <= year <= current_year + 6:
                            years.append(year)
            else:
                try:
                    year = int(match)
                    if current_year - 10 <= year <= current_year + 6:  # Within reasonable range
                        years.append(year)
                except ValueError:
                    continue
    
    # Return the most recent/future year (likely graduation year)
    if years:
        # Prefer years in future or recent past (within 2 years)
        future_years = [y for y in years if y >= current_year - 2]
        if future_years:
            return max(future_years)
        return max(years)
    
    return None


def extract_institution_names(text: str) -> dict:
    """Extract college and school names with improved accuracy"""
    institutions = {
        'college': None,
        'twelth_school': None,
        'tenth_school': None
    }
    
    # Improved patterns for institution extraction
    # Pattern 1: Name followed by institution type
    pattern1 = r'([A-Z][A-Za-z\s,\.&]+(?:University|Institute|College|School)(?:\s+of\s+[A-Za-z\s]+)?)'
    
    # Pattern 2: Institution type preceded by name
    pattern2 = r'([A-Z][A-Za-z\s,\.&-]+(?:,\s*)?(?:University|Institute|College|School))'
    
    # Pattern 3: IIT, NIT, BITS patterns
    pattern3 = r'((?:IIT|NIT|BITS|IIIT|VIT|MIT|DTU|NSIT)\s+[A-Za-z]+)'
    
    all_matches = []
    
    # Find matches using all patterns
    for pattern in [pattern3, pattern1, pattern2]:  # Check IIT/NIT first
        matches = re.findall(pattern, text, re.IGNORECASE)
        all_matches.extend(matches)
    
    # Clean and deduplicate matches
    cleaned_matches = []
    seen = set()
    for match in all_matches:
        # Clean the match
        match = match.strip().strip(',').strip()
        # Remove excessive whitespace
        match = re.sub(r'\s+', ' ', match)
        # Skip if too short or already seen
        if len(match) > 5 and match.lower() not in seen:
            cleaned_matches.append(match)
            seen.add(match.lower())
    
    # Assign matches to fields
    # First match is likely college/university (appears in education section first)
    if len(cleaned_matches) >= 1:
        institutions['college'] = cleaned_matches[0]
    
    # Look specifically for 12th/HSC school
    twelth_pattern = r'(?:12th|HSC|Higher\s+Secondary|Intermediate)[^\n]*\n([A-Z][A-Za-z\s,\.&-]+(?:School|College))'
    twelth_match = re.search(twelth_pattern, text, re.IGNORECASE)
    if twelth_match:
        institutions['twelth_school'] = twelth_match.group(1).strip()
    elif len(cleaned_matches) >= 2:
        institutions['twelth_school'] = cleaned_matches[1]
    
    # Look specifically for 10th/SSC school
    tenth_pattern = r'(?:10th|SSC|Matriculation|Secondary)[^\n]*\n([A-Z][A-Za-z\s,\.&-]+(?:School|College))'
    tenth_match = re.search(tenth_pattern, text, re.IGNORECASE)
    if tenth_match:
        institutions['tenth_school'] = tenth_match.group(1).strip()
    elif len(cleaned_matches) >= 3:
        institutions['tenth_school'] = cleaned_matches[2]
    
    return institutions


def determine_qualification(degree: str) -> str:
    """Determine qualification level (UG/PG/PhD) from degree"""
    if not degree:
        return None
    
    degree_lower = degree.lower()
    
    # Undergraduate
    if any(ug in degree_lower for ug in ['b.tech', 'b.e.', 'b.sc', 'bca', 'b.a.', 'bba', 'b.com', 'bachelor']):
        return 'UG'
    
    # Postgraduate
    if any(pg in degree_lower for pg in ['m.tech', 'm.e.', 'm.sc', 'mca', 'm.a.', 'mba', 'master']):
        return 'PG'
    
    # Doctorate
    if 'ph.d' in degree_lower or 'phd' in degree_lower or 'doctor' in degree_lower:
        return 'PhD'
    
    return None


def parse_resume(file_path: str) -> dict:
    """
    Comprehensive resume parser - extracts skills AND education details
    
    Args:
        file_path: Path to resume PDF file
        
    Returns:
        Dictionary with:
        - skills_array: List of skills
        - skills_string: Comma-separated skills
        - education: Dictionary with degree, branch, cgpa, etc.
    """
    try:
        print(f"\n📄 Parsing resume from: {file_path}")
        
        # Extract text from PDF
        text = extract_text(file_path)
        
        if not text:
            print("⚠️ No text extracted from PDF")
            return {
                "skills_array": [],
                "skills_string": "",
                "education": {}
            }
        
        print(f"✅ Extracted {len(text)} characters from resume")
        
        # Extract skills
        print("\n🔍 Extracting skills...")
        skills_array = extract_skills_from_text(text)
        print(f"   Found {len(skills_array)} skills")
        
        # Extract education details
        print("\n🎓 Extracting education details...")
        
        degree = extract_degree(text)
        print(f"   Degree: {degree or 'Not found'}")
        
        branch = extract_branch(text)
        print(f"   Branch: {branch or 'Not found'}")
        
        qualification = determine_qualification(degree)
        print(f"   Qualification: {qualification or 'Not found'}")
        
        cgpa = extract_cgpa(text)
        print(f"   CGPA: {cgpa or 'Not found'}")
        
        # Try to convert CGPA from percentage if percentage found
        degree_percentage = extract_percentage(text, 'degree')
        if not cgpa and degree_percentage:
            cgpa = degree_percentage / 10.0  # Convert percentage to CGPA
            print(f"   CGPA (converted from {degree_percentage}%): {cgpa}")
        
        twelth_pct = extract_percentage(text, '12th')
        print(f"   12th Percentage: {twelth_pct or 'Not found'}")
        
        tenth_pct = extract_percentage(text, '10th')
        print(f"   10th Percentage: {tenth_pct or 'Not found'}")
        
        grad_year = extract_graduation_year(text)
        print(f"   Graduation Year: {grad_year or 'Not found'}")
        
        institutions = extract_institution_names(text)
        print(f"   College: {institutions['college'] or 'Not found'}")
        print(f"   12th School: {institutions['twelth_school'] or 'Not found'}")
        print(f"   10th School: {institutions['tenth_school'] or 'Not found'}")
        
        return {
            "skills_array": skills_array,
            "skills_string": ", ".join(skills_array),
            "skills_count": len(skills_array),
            "education": {
                "degree": degree,
                "qualification": qualification,
                "branch": branch,
                "cgpa": cgpa,
                "grad_year": grad_year,
                "college_name": institutions['college'],
                "twelth_pct": twelth_pct,
                "twelth_school": institutions['twelth_school'],
                "tenth_pct": tenth_pct,
                "tenth_school": institutions['tenth_school']
            }
        }
        
    except Exception as e:
        print(f"❌ Error parsing resume: {e}")
        import traceback
        traceback.print_exc()
        return {
            "skills_array": [],
            "skills_string": "",
            "education": {}
        }


# Test function
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
    else:
        test_file = "uploads/resumes/test_resume.pdf"
    
    print("="*80)
    print("🔍 COMPREHENSIVE RESUME PARSER TEST")
    print("="*80)
    
    result = parse_resume(test_file)
    
    print("\n" + "="*80)
    print("📊 EXTRACTION RESULTS")
    print("="*80)
    
    print(f"\n🛠️  SKILLS ({result['skills_count']}):")
    if result['skills_array']:
        for i, skill in enumerate(result['skills_array'][:20], 1):  # Show first 20
            print(f"   {i}. {skill}")
        if len(result['skills_array']) > 20:
            print(f"   ... and {len(result['skills_array']) - 20} more")
    else:
        print("   No skills found")
    
    print(f"\n🎓 EDUCATION DETAILS:")
    edu = result['education']
    print(f"   Degree: {edu.get('degree') or 'Not found'}")
    print(f"   Qualification: {edu.get('qualification') or 'Not found'}")
    print(f"   Branch: {edu.get('branch') or 'Not found'}")
    print(f"   CGPA: {edu.get('cgpa') or 'Not found'}")
    print(f"   Graduation Year: {edu.get('grad_year') or 'Not found'}")
    print(f"   College: {edu.get('college_name') or 'Not found'}")
    print(f"   12th %: {edu.get('twelth_pct') or 'Not found'}")
    print(f"   12th School: {edu.get('twelth_school') or 'Not found'}")
    print(f"   10th %: {edu.get('tenth_pct') or 'Not found'}")
    print(f"   10th School: {edu.get('tenth_school') or 'Not found'}")
    
    print("\n" + "="*80)
    print("✅ PARSING COMPLETE")
    print("="*80)
