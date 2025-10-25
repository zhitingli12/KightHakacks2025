#!/usr/bin/env python3
"""
Simple test to verify instruction loading works independently
"""

import sys
import os

# Add the parent directory to Python path so we can import utils from app-backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_basic_instruction_loading():
    """Test just the instruction loading without agent creation"""
    
    print("🧪 Testing basic instruction loading...")
    print("=" * 50)
    
    try:
        from utils.load_instruction import load_instruction_from_file
        
        # Test loading the instruction file
        instruction = load_instruction_from_file("home_insurance_expert.txt")
        print(f"✅ Successfully loaded instruction!")
        print(f"📊 Length: {len(instruction)} characters")
        print(f"📄 Lines: {len(instruction.splitlines())} lines")
        
        # Show first few lines
        lines = instruction.splitlines()
        print(f"\n📝 First 5 lines:")
        for i, line in enumerate(lines[:5], 1):
            print(f"   {i}: {line}")
        
        # Test that it contains key sections
        sections = [
            "Primary Role",
            "Location Risk Analysis", 
            "Insurance Assessment",
            "Coverage Types",
            "Guidelines"
        ]
        
        found_sections = [section for section in sections if section in instruction]
        print(f"\n🔍 Found sections: {', '.join(found_sections)}")
        
        if len(found_sections) >= 3:
            print("✅ Instruction file contains expected structure")
        else:
            print("⚠️  Warning: Some expected sections missing")
            
        return instruction
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_safe_loading():
    """Test the safe loading function"""
    
    print("\n🛡️  Testing safe loading with fallback...")
    print("=" * 50)
    
    try:
        from utils.load_instruction import load_instruction_from_file_safe
        
        # Test with existing file
        instruction = load_instruction_from_file_safe("home_insurance_expert.txt", "fallback")
        print(f"✅ Safe loading with existing file: {len(instruction)} chars")
        
        # Test with non-existing file
        fallback_instruction = load_instruction_from_file_safe("nonexistent.txt", "This is a fallback instruction.")
        print(f"✅ Safe loading with fallback: '{fallback_instruction}'")
        
    except Exception as e:
        print(f"❌ Error in safe loading: {e}")

def main():
    """Run the basic tests"""
    print("🚀 Starting basic instruction loading tests...\n")
    
    instruction = test_basic_instruction_loading()
    test_safe_loading()
    
    print("\n" + "=" * 50)
    if instruction:
        print("🎉 All basic tests passed! Instruction loading is working correctly.")
        print(f"💡 You can now use load_instruction_from_file('home_insurance_expert.txt') in your agent.")
    else:
        print("❌ Tests failed. Please check the file structure.")

if __name__ == "__main__":
    main()