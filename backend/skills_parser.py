"""
Enhanced Skills Extraction Module
Parses resumes to automatically extract technical and soft skills
"""

import re
from pdfminer.high_level import extract_text

# Comprehensive skills database
COMPREHENSIVE_SKILLS = {
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'csharp', 'php', 'ruby', 
    'go', 'golang', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 
    'bash', 'powershell', 'dart', 'objective-c',
    
    # Web Technologies
    'html', 'html5', 'css', 'css3', 'react', 'reactjs', 'angular', 'angularjs', 
    'vue', 'vuejs', 'nodejs', 'node.js', 'express', 'expressjs', 'django', 'flask', 
    'spring', 'springboot', 'asp.net', 'laravel', 'jquery', 'bootstrap', 'tailwind',
    'sass', 'less', 'webpack', 'redux', 'next.js', 'nextjs', 'nuxt.js', 'svelte',
    'fastapi', 'graphql',
    
    # Databases
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'cassandra', 
    'oracle', 'sqlite', 'mariadb', 'dynamodb', 'firebase', 'firestore', 
    'elasticsearch', 'neo4j', 'couchdb', 'tidb',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'jenkins', 
    'gitlab', 'github', 'git', 'ci/cd', 'terraform', 'ansible', 'nginx', 'apache', 
    'linux', 'unix', 'devops', 'heroku', 'digitalocean', 'cloudflare',
    
    # Data Science & AI/ML
    'machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 
    'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
    'nlp', 'natural language processing', 'computer vision', 'opencv', 'data science',
    'data analysis', 'data analytics', 'big data', 'hadoop', 'spark', 'pyspark',
    'tableau', 'power bi', 'powerbi', 'data visualization', 'statistics', 
    'ai', 'artificial intelligence', 'data mining', 'predictive modeling',
    
    # Mobile Development
    'android', 'ios', 'react native', 'flutter', 'xamarin', 'mobile development',
    'app development',
    
    # Testing & QA
    'testing', 'unit testing', 'integration testing', 'jest', 'junit', 'selenium', 
    'cypress', 'mocha', 'chai', 'pytest', 'test automation', 'qa', 'quality assurance',
    
    # Design & UI/UX
    'ui', 'ux', 'ui/ux', 'figma', 'adobe xd', 'sketch', 'photoshop', 'illustrator',
    'user interface', 'user experience', 'wireframing', 'prototyping',
    
    # Other Technical
    'rest api', 'restful api', 'api', 'microservices', 'web services', 'websocket',
    'blockchain', 'solidity', 'ethereum', 'smart contracts', 'web3',
    'cybersecurity', 'security', 'penetration testing', 'ethical hacking',
    'networking', 'tcp/ip', 'http', 'https', 'ssl', 'tls',
    'json', 'xml', 'yaml', 'regex', 'data structures', 'algorithms',
    'object oriented programming', 'oop', 'functional programming',
    
    # Soft Skills
    'communication', 'teamwork', 'leadership', 'problem solving', 'analytical thinking',
    'critical thinking', 'time management', 'project management', 'presentation',
    'collaboration', 'adaptability', 'creativity', 'innovation', 'research',
}

# Skill variations and synonyms
SKILL_MAPPINGS = {
    'js': 'javascript',
    'ts': 'typescript',
    'reactjs': 'react',
    'react.js': 'react',
    'node': 'nodejs',
    'node.js': 'nodejs',
    'expressjs': 'express',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'mongo': 'mongodb',
    'postgres': 'postgresql',
    'k8s': 'kubernetes',
    'ml': 'machine learning',
    'dl': 'deep learning',
    'ai': 'artificial intelligence',
    'sklearn': 'scikit-learn',
    'c++': 'cpp',
    'c#': 'csharp',
}


def extract_skills_from_text(text: str) -> list:
    """
    Extract skills from text using comprehensive keyword matching.
    
    Args:
        text: Resume text content
        
    Returns:
        List of unique skills found (title-cased)
    """
    if not text:
        return []
    
    text_lower = text.lower()
    found_skills = set()
    
    # Search for each skill in the comprehensive database
    for skill in COMPREHENSIVE_SKILLS:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower, re.IGNORECASE):
            # Normalize skill using mappings
            normalized = SKILL_MAPPINGS.get(skill, skill)
            found_skills.add(normalized)
    
    # Convert to title case and sort
    skills_list = sorted([skill.title() for skill in found_skills])
    
    return skills_list


def parse_skills_from_resume(file_path: str) -> dict:
    """
    Parse skills from resume PDF file.
    
    Args:
        file_path: Path to resume PDF file
        
    Returns:
        Dictionary with:
        - skills_array: List of skills
        - skills_string: Comma-separated skills
        - count: Number of skills found
    """
    try:
        print(f"\n📄 Parsing skills from: {file_path}")
        
        # Extract text from PDF
        text = extract_text(file_path)
        
        if not text:
            print("⚠️ No text extracted from PDF")
            return {
                "skills_array": [],
                "skills_string": "",
                "count": 0
            }
        
        # Extract skills
        skills_array = extract_skills_from_text(text)
        
        print(f"✅ Found {len(skills_array)} skills")
        
        return {
            "skills_array": skills_array,
            "skills_string": ", ".join(skills_array),
            "count": len(skills_array)
        }
        
    except Exception as e:
        print(f"❌ Error parsing skills from resume: {e}")
        import traceback
        traceback.print_exc()
        return {
            "skills_array": [],
            "skills_string": "",
            "count": 0
        }


# Test function
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
    else:
        test_file = "uploads/resumes/1_resume.pdf"
    
    print("="*70)
    print("Skills Parser Test")
    print("="*70)
    
    result = parse_skills_from_resume(test_file)
    
    print(f"\n📊 Results:")
    print(f"   Total Skills: {result['count']}")
    print(f"\n   Skills Found:")
    for i, skill in enumerate(result['skills_array'], 1):
        print(f"   {i}. {skill}")
    
    print(f"\n   Database Format:")
    print(f"   {result['skills_string']}")
    print("\n" + "="*70)
