#!/usr/bin/env python3
"""
Setup script for Solar Analysis Flask Backend
"""

import os
import subprocess
import sys

def create_env_file():
    """Create .env file if it doesn't exist"""
    if not os.path.exists('.env'):
        print("Creating .env file...")
        with open('.env', 'w') as f:
            f.write("""# Flask Environment Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here_optional
FLASK_ENV=development
FLASK_DEBUG=True
""")
        print("✓ .env file created. Please update it with your actual API keys.")
        return False
    return True

def install_dependencies():
    """Install required Python packages"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("✗ Failed to install dependencies")
        return False

def create_database():
    """Initialize the SQLite database"""
    print("Initializing database...")
    try:
        import sqlite3
        conn = sqlite3.connect('solar_analysis.db')
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create analyses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                address TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                monthly_bill REAL NOT NULL,
                roof_size TEXT,
                panel_type TEXT NOT NULL,
                include_subsidy BOOLEAN NOT NULL,
                analysis_result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✓ Database initialized successfully!")
        return True
    except Exception as e:
        print(f"✗ Failed to initialize database: {e}")
        return False

def check_gemini_api():
    """Check if Gemini API key is configured"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key == 'your_actual_gemini_api_key_here':
        print("⚠️  Gemini API key not configured properly")
        print("   Please update GEMINI_API_KEY in .env file")
        print("   Get your API key from: https://makersuite.google.com/app/apikey")
        return False
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        # Test the API with a simple request
        response = model.generate_content("Hello")
        print("✓ Gemini API key is valid and working!")
        return True
    except Exception as e:
        print(f"✗ Gemini API key validation failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🌞 Solar Analysis Backend Setup")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("✗ Python 3.8+ is required")
        sys.exit(1)
    
    print(f"✓ Python {sys.version.split()[0]} detected")
    
    # Create .env file
    env_exists = create_env_file()
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Initialize database
    if not create_database():
        sys.exit(1)
    
    # Check API configuration
    if env_exists:
        api_valid = check_gemini_api()
    else:
        api_valid = False
        print("⚠️  Please configure your API keys in .env file before running")
    
    print("\n" + "=" * 40)
    print("🎉 Setup Complete!")
    print("\nNext steps:")
    
    if not env_exists or not api_valid:
        print("1. Configure your API keys in .env file:")
        print("   - Get Gemini API key: https://makersuite.google.com/app/apikey")
        print("   - Update GEMINI_API_KEY in .env file")
    
    print("2. Run the backend server:")
    print("   python app.py")
    print("\n3. Update your frontend .env.local:")
    print("   NEXT_PUBLIC_API_URL=http://localhost:5000/api")
    
    print("\n4. Test the API:")
    print("   curl http://localhost:5000/api/health")

if __name__ == "__main__":
    main()