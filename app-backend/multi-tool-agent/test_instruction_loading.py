#!/usr/bin/env python3
"""
Test script to verify instruction loading functionality
"""

import sys
import os

# Add the parent directory to Python path so we can import utils from app-backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.load_instruction import load_instruction_from_file, load_instruction_from_file_safe

def test_instruction_loading():
    """Test the instruction loading functionality"""
    
    print("🧪 Testing instruction loading...")
    print("=" * 50)
    
    try:
        # Test loading the instruction file
        instruction = load_instruction_from_file("home_insurance_expert.txt")
        print(f"✅ Successfully loaded instruction ({len(instruction)} characters)")
        print(f"📝 First 150 characters:")
        print(f"   {instruction[:150]}...")
        print()
        
        # Test that the instruction contains expected content
        expected_keywords = ["insurance", "weather", "risk", "coverage"]
        found_keywords = [kw for kw in expected_keywords if kw.lower() in instruction.lower()]
        print(f"🔍 Found expected keywords: {', '.join(found_keywords)}")
        
        if len(found_keywords) >= 3:
            print("✅ Instruction content appears valid")
        else:
            print("⚠️  Warning: Instruction may not contain expected content")
        
    except Exception as e:
        print(f"❌ Error loading instruction: {e}")
        
        # Test safe loading with fallback
        print("\n🔄 Testing safe loading with fallback...")
        fallback = "You are a helpful home insurance assistant."
        instruction = load_instruction_from_file_safe("home_insurance_expert.txt", fallback)
        print(f"✅ Using fallback instruction: {instruction[:100]}...")

def test_agent_creation():
    """Test that the agent can be created with the loaded instruction"""
    
    print("\n🤖 Testing agent creation...")
    print("=" * 50)
    
    try:
        # Import and test the agent
        from agent import root_agent, instruction_text
        
        print(f"✅ Agent created successfully!")
        print(f"📋 Agent name: {root_agent.name}")
        print(f"🧠 Model: {root_agent.model}")
        print(f"📝 Instruction length: {len(instruction_text)} characters")
        print(f"🔧 Available tools: {len(root_agent.tools)} tools")
        
        # Print tool names if available
        if hasattr(root_agent, 'tools') and root_agent.tools:
            tool_names = [getattr(tool, '__name__', str(tool)) for tool in root_agent.tools]
            print(f"🛠️  Tool names: {', '.join(tool_names)}")
        
    except Exception as e:
        print(f"❌ Error creating agent: {e}")
        print("💡 Make sure all dependencies are installed and files are in correct locations")

def main():
    """Run all tests"""
    print("🚀 Starting instruction loading tests...\n")
    
    test_instruction_loading()
    test_agent_creation()
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    main()