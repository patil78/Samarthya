import os
from pathlib import Path
from pdfminer.high_level import extract_text
import spacy
from transformers import pipeline
import re
import json

# ==============================================================================
# --- FILE HANDLING (CORRECTED) ---
# ==============================================================================

# Get the directory where this utils.py file is located
BASE_DIR = Path(__file__).resolve().parent
# Create the UPLOAD_DIR path relative to this file's location. This is much more reliable.
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

def save_file(content: bytes, user_id: int, category: str) -> str:
    """
    Saves a file in the correct category folder with a unique name.
    Now includes error handling.
    """
    try:
        category_folder = UPLOAD_DIR / category
        category_folder.mkdir(exist_ok=True)
        
        file_path = category_folder / f"{user_id}_{category}.pdf"
        
        with open(file_path, "wb") as f:
            f.write(content)
            
        print(f"✅ File successfully saved to: {file_path}") # Added a success log
        return str(file_path)
    
    except (IOError, PermissionError) as e:
        # This will print a clear error if the file cannot be saved.
        print(f"❌ ERROR: Could not write to path {file_path}. Please check folder permissions.")
        print(f"   Reason: {e}")
        # Re-raise the exception so FastAPI returns a 500 server error to the frontend.
        raise e

# ==============================================================================
# --- RESUME PARSING (Unchanged) ---
# ==============================================================================

def check_resume_format(file_path: str) -> bool:
    # ... (this function is unchanged)
    try:
        text = extract_text(file_path).lower()
    except Exception:
        return False
    required_headings = ["education", "experience", "skills"]
    for heading in required_headings:
        if heading not in text:
            return False
    return True

# ... (The rest of your parsing functions like extract_skills, parse_resume, etc., are unchanged)
# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# HuggingFace NER pipeline for organizations (college/school detection)
ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)

# Skills list (from company dataset)
SKILLS_LIST = [
    "Analytical thinking","Data analysis","Communication skills",
    "Java","Python","SQL","Problem-solving","Teamwork",
    "Excel","Financial modeling","Attention to detail",
    "Technical skills","AutoCAD","GIS","C++",
    "Web development (HTML, CSS, JS)","Operational management",
    "Mechanical engineering","Marketing strategy","Creativity",
    "Digital marketing","Business strategy","Leadership",
    "Retail management","Customer service"
]


def extract_skills(text: str):
    text_lower = text.lower()
    skills_found = [skill for skill in SKILLS_LIST if skill.lower() in text_lower]
    return skills_found


def extract_education(text: str):
    education = []
    try:
        ner_results = ner_pipeline(text)
        for ent in ner_results:
            if ent['entity_group'] == 'ORG':
                education.append({"institution": ent['word']})
    except Exception:
        pass
    degree_patterns = r"(Bachelor|B\.Sc|B\.Tech|BE|Master|M\.Sc|M\.Tech|MBA|UG|PG|Diploma)"
    degrees = re.findall(degree_patterns, text, re.I)
    percent_patterns = r"(\d{1,3}\.\d{1,2}%|\d{1,3}%|\d\.\d{1,2}/10|CGPA\s?\d\.\d{1,2})"
    percentages = re.findall(percent_patterns, text)
    for i, deg in enumerate(degrees):
        if i < len(education):
            education[i]['degree'] = deg
        else:
            education.append({'degree': deg})
    for i, perc in enumerate(percentages):
        if i < len(education):
            education[i]['score'] = perc
        else:
            education.append({'score': perc})
    return education


def parse_resume(file_path: str):
    try:
        text = extract_text(file_path)
    except Exception:
        return {"skills": [], "education": []}
    skills = extract_skills(text)
    education = extract_education(text)
    return {"skills": skills, "education": education}


def extract_basic_details(file_path):
    try:
        text = extract_text(file_path)
    except Exception:
        return {"name": "", "email": "", "mobile": "", "dob": ""}
    name_match = re.search(r"Name[:\-]\s*(.*)", text, re.IGNORECASE)
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    mobile_match = re.search(r"\b\d{10}\b", text)
    dob_match = re.search(r"\b(?:\d{2}[-/]\d{2}[-/]\d{4}|\d{4}-\d{2}-\d{2})\b", text)
    return {
        "name": name_match.group(1).strip() if name_match else "",
        "email": email_match.group(0) if email_match else "",
        "mobile": mobile_match.group(0) if mobile_match else "",
        "dob": dob_match.group(0) if dob_match else ""
    }