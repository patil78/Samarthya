#!/usr/bin/env python3
"""
Admin Account Creation Script
This script creates admin accounts securely via the backend.

Usage:
    python create_admin.py

Security Note:
    Admin accounts can ONLY be created through backend methods (not frontend signup)
    This ensures better security and control over admin access.
"""

from main import engine, pwd_context
from sqlalchemy import text
import sys

def create_admin(name, email, password):
    """Create a new admin account"""
    try:
        with engine.connect() as conn:
            # Ensure admins table exists
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
            existing = conn.execute(
                text("SELECT admin_id, name FROM admins WHERE email=:email"),
                {"email": email}
            ).fetchone()
            
            if existing:
                print(f"❌ Admin with email '{email}' already exists!")
                print(f"   Admin Name: {existing[1]}")
                print(f"   Admin ID: {existing[0]}")
                return False
            
            # Hash password and insert
            password_hash = pwd_context.hash(password)
            conn.execute(
                text("INSERT INTO admins (name, email, password_hash) VALUES (:name, :email, :p_hash)"),
                {"name": name, "email": email, "p_hash": password_hash}
            )
            conn.commit()
            
            print(f"✅ Admin account created successfully!")
            print(f"   Name: {name}")
            print(f"   Email: {email}")
            print(f"\n🔐 You can now login at: http://localhost:3000/login")
            print(f"   Select 'Admin' and use the credentials above.")
            return True
            
    except Exception as e:
        print(f"❌ Error creating admin account: {e}")
        import traceback
        traceback.print_exc()
        return False

def list_admins():
    """List all existing admin accounts"""
    try:
        with engine.connect() as conn:
            admins = conn.execute(
                text("SELECT admin_id, name, email, created_at FROM admins ORDER BY created_at DESC")
            ).fetchall()
            
            if not admins:
                print("📋 No admin accounts found.")
                return
            
            print(f"\n📋 Existing Admin Accounts ({len(admins)}):")
            print("=" * 80)
            for admin in admins:
                print(f"ID: {admin[0]} | Name: {admin[1]} | Email: {admin[2]} | Created: {admin[3]}")
            print("=" * 80)
            
    except Exception as e:
        print(f"❌ Error listing admins: {e}")

def interactive_create():
    """Interactive admin creation"""
    print("\n" + "=" * 60)
    print("🔐 ADMIN ACCOUNT CREATION")
    print("=" * 60)
    print("\nThis script will create a new admin account.")
    print("Admin accounts have full access to the system.\n")
    
    name = input("Enter admin name: ").strip()
    if not name:
        print("❌ Name cannot be empty!")
        return
    
    email = input("Enter admin email: ").strip()
    if not email or '@' not in email:
        print("❌ Please enter a valid email address!")
        return
    
    password = input("Enter admin password (min 6 characters): ").strip()
    if len(password) < 6:
        print("❌ Password must be at least 6 characters!")
        return
    
    confirm_password = input("Confirm password: ").strip()
    if password != confirm_password:
        print("❌ Passwords do not match!")
        return
    
    print(f"\n📝 Creating admin account for: {name} ({email})")
    create_admin(name, email, password)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("ADMIN ACCOUNT MANAGEMENT")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "list":
            list_admins()
        
        elif command == "create":
            if len(sys.argv) >= 5:
                # Command line arguments: python create_admin.py create "Name" "email@example.com" "password"
                create_admin(sys.argv[2], sys.argv[3], sys.argv[4])
            else:
                print("Usage: python create_admin.py create \"Name\" \"email\" \"password\"")
        
        elif command == "help":
            print("\nAvailable commands:")
            print("  python create_admin.py              - Interactive mode")
            print("  python create_admin.py list         - List all admins")
            print("  python create_admin.py create \"Name\" \"email\" \"password\"")
            print("\nExamples:")
            print("  python create_admin.py create \"Admin User\" \"admin@example.com\" \"admin123\"")
        
        else:
            print(f"❌ Unknown command: {command}")
            print("Use 'python create_admin.py help' for usage information")
    
    else:
        # Interactive mode
        while True:
            print("\n1. Create new admin account")
            print("2. List existing admins")
            print("3. Exit")
            
            choice = input("\nEnter your choice (1-3): ").strip()
            
            if choice == "1":
                interactive_create()
            elif choice == "2":
                list_admins()
            elif choice == "3":
                print("\n👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1, 2, or 3.")
