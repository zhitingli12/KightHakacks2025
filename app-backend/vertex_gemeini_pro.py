import json
import vertexai
from vertexai.preview.generative_models import GenerativeModel

project_id = "gen-lang-client-0670782423"
location = "us-central1"

vertexai.init(project=project_id, location=location)

model = GenerativeModel("gemini-2.0-flash")
response = model.generate_content('Say hi, I am Vertext AI Gemini 2.0 Flash!')
def extract_property_info(raw_html: str):
    prompt = (
        "Extract property information from the following HTML or text. "
        "Return compact JSON with keys: address, city, zip, year_built. "
        "If a value is missing, omit it."
    )
    resp = model.generate_content([prompt, raw_html])  # <— pass string directly
    txt = resp.text.strip()
    # strip triple-backticks if model returned a fenced block
    if txt.startswith("```"):
        txt = txt.strip("`").strip()
        if txt.lower().startswith("json"):
            txt = txt[4:].strip()
    try:
        return json.loads(txt)
    except Exception:
        # fall back to raw text if the model didn't return valid JSON
        return {"raw_text": resp.text}

if __name__ == "__main__":
    sample = "<p>123 Main St, Orlando FL 32801 — Built 2004</p>"
    print(extract_property_info(sample))