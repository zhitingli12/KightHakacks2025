import os
from typing import Optional

def load_instruction_from_file(filename: str, instructions_dir: str = "instructions") -> str:
    """
    Load instruction content from a text file.
    
    Args:
        filename (str): Name of the instruction file (e.g., "home_insurance_expert.txt")
        instructions_dir (str): Directory containing instruction files
        
    Returns:
        str: The instruction content
        
    Raises:
        FileNotFoundError: If the instruction file doesn't exist
    """
    # Get the directory of the current file (utils directory in app-backend)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Go to the multi-tool-agent directory, then to instructions
    app_backend_dir = os.path.dirname(current_dir)
    multi_tool_agent_dir = os.path.join(app_backend_dir, "multi-tool-agent")
    instructions_path = os.path.join(multi_tool_agent_dir, instructions_dir)
    file_path = os.path.join(instructions_path, filename)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read().strip()
            
        if not content:
            raise ValueError(f"Instruction file is empty: {file_path}")
            
        return content
        
    except FileNotFoundError:
        raise FileNotFoundError(f"Instruction file not found: {file_path}")
    except Exception as e:
        raise Exception(f"Error loading instruction file {file_path}: {str(e)}")

def load_instruction_from_file_safe(filename: str, default_instruction: str = "", instructions_dir: str = "instructions") -> str:
    """
    Load instruction from file with fallback to default.
    
    Args:
        filename (str): Name of the instruction file
        default_instruction (str): Fallback if file loading fails
        instructions_dir (str): Directory containing instruction files
        
    Returns:
        str: The instruction content or default
    """
    try:
        return load_instruction_from_file(filename, instructions_dir)
    except Exception as e:
        print(f"Warning: Could not load instruction file '{filename}': {e}")
        return default_instruction