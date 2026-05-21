from passlib.hash import sha256_crypt

# Generate hash for 'company123'
company_hash = sha256_crypt.hash('company123')
print(f"Company hash: {company_hash}")

# Generate hash for 'student123'
student_hash = sha256_crypt.hash('student123')
print(f"Student hash: {student_hash}")