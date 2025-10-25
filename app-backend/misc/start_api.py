#!/usr/bin/env python3
"""
Simple script to start the FastAPI server
"""

import subprocess
import sys
import time
import requests
import os

def check_port_available(port=8000):
    """Check if the port is available"""
    try:
        response = requests.get(f"http://localhost:{port}/health", timeout=2)
        return False  # Port is occupied
    except requests.exceptions.RequestException:
        return True  # Port is available

def start_api_server():
    """Start the FastAPI server"""
    
    print("🚀 Starting FastAPI City Boundaries Server")
    print("=" * 45)
    
    # Check if port is available
    if not check_port_available(8000):
        print("⚠️  Port 8000 is already in use!")
        print("   API might already be running at http://localhost:8000")
        print("   Check: http://localhost:8000/docs")
        return
    
    # Get the parent directory (app-backend) to find api.py
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"📂 Working directory: {parent_dir}")
    print("🌐 Starting server on http://localhost:8000")
    print("📖 API docs will be available at http://localhost:8000/docs")
    print("🔧 API schema at http://localhost:8000/openapi.json")
    print("\n💡 Press Ctrl+C to stop the server")
    print("-" * 45)
    
    # Change to parent directory and run uvicorn
    os.chdir(parent_dir)
    
    try:
        # Start the uvicorn server
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "api:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ]
        
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("\n🔧 Try installing dependencies:")
        print("   pip install fastapi uvicorn")

if __name__ == "__main__":
    start_api_server()