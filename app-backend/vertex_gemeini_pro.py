import vertexai
from vertexai.preview.generative_models import GenerativeModel

project_id = "gen-lang-client-0670782423"
location = "us-central1"

vertexai.init(project=project_id, location=location)

model = GenerativeModel("gemini-2.5-pro")
response = model.generate_content('Say hi, I am Vertext AI Gemini 2.5 Pro!')

print(response.text)