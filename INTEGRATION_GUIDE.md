# Home Insurance Agent Integration Guide

This guide shows how to run the integrated home insurance agent with the frontend chat interface.

## Prerequisites

1. **Backend Dependencies**: Make sure you have installed the Python requirements:
   ```bash
   cd app-backend
   pip install -r requirements.txt
   ```

2. **Frontend Dependencies**: Make sure you have installed the Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. **Google ADK Setup**: Ensure you have proper Google ADK credentials configured.

## Running the System

### Step 1: Start the Backend API

In the `app-backend` directory, start the FastAPI server:

```bash
cd app-backend
python3 chat_api.py
```

Or use the startup script:
```bash
./start_chat_api.sh
```

The API will start on `http://localhost:8000`. You can test it at:
- Health check: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

### Step 2: Start the Frontend

In the `frontend` directory, start the React development server:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` or `http://localhost:5173` (depending on your setup).

### Step 3: Test the Integration

1. Open your browser to the frontend URL
2. Navigate to the chat interface
3. Start chatting with the Home Insurance Expert!

## How It Works

1. **User Input**: User types a message in the frontend chat interface
2. **API Call**: Frontend sends a POST request to `/chat` endpoint with the user's message
3. **Agent Processing**: The backend loads your Google ADK agent and processes the message
4. **Response**: Agent's response is sent back to the frontend and displayed in the chat

## API Endpoints

- `POST /chat`: Send a message to the home insurance agent
  ```json
  {
    "message": "I live in Miami, what insurance do I need?"
  }
  ```

- `GET /health`: Check if the service is running
  ```json
  {
    "status": "healthy",
    "agent": "home_insurance_expert"
  }
  ```

## Troubleshooting

### Backend Issues

1. **Import Errors**: Run `python3 test_agent_import.py` to test if the agent can be imported
2. **Port Conflicts**: Make sure port 8000 is not already in use
3. **Dependencies**: Ensure all requirements are installed: `pip install -r requirements.txt`

### Frontend Issues

1. **CORS Errors**: The backend is configured to allow requests from localhost:3000 and localhost:5173
2. **Connection Errors**: Make sure the backend is running on port 8000
3. **Dependencies**: Run `npm install` to ensure all packages are installed

### Agent Issues

1. **Google ADK Credentials**: Ensure your Google credentials are properly configured
2. **Model Access**: Make sure you have access to the Gemini model specified in the agent
3. **Function Tools**: If using custom functions, ensure they don't conflict with the model

## Customizing the Agent

To modify the agent behavior:

1. Edit `multi-tool-agent/agent.py` to change the agent configuration
2. Update `multi-tool-agent/instructions/home_insurance_expert.txt` to modify the agent's instructions
3. Add custom tools by uncommenting and fixing the function definitions in `agent.py`

## Adding Custom Functions

To enable your custom location functions (currently commented out):

1. Ensure the `api.py` file exports the required functions and response models
2. Uncomment the function definitions in `agent.py`
3. Test the agent import: `python3 test_agent_import.py`
4. Restart the API server

The custom functions that can be enabled are:
- `findCityBoundary(city: str)` - Get city boundary coordinates
- `findCity(lat: float, lon: float)` - Reverse geocode coordinates to city name  
- `findNearbyCities(lat: float, lon: float, radius_km: int)` - Find nearby cities

## Notes

- The agent currently uses only Google Search as a tool
- Custom location functions are commented out but can be enabled
- The system handles errors gracefully and provides fallback responses
- All API calls include proper error handling and CORS support