"""
Ollama client — async wrapper for local LLM (qwen3:14b).

Provides:
- ask_ai: general chat (chatbot, summaries)
- generate_prescription_ai: AI prescription from diagnosis
- smart_search_patients: NLP query → SQL → results
- medical_record_summary: summarise patient records with caution
- pharmacy_inventory_forecast: predict inventory needs
"""

import json
import httpx
from datetime import datetime

OLLAMA_BASE = "http://localhost:11434"
MODEL = "qwen3:14b"
TIMEOUT = 120.0  # seconds


async def _generate(prompt: str, system: str = "", temperature: float = 0.3) -> str:
    """Core Ollama generate call."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            f"{OLLAMA_BASE}/api/generate",
            json={
                "model": MODEL,
                "prompt": prompt,
                "system": system,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": 2048,
                },
            },
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()


async def ask_ai(prompt: str, system_prompt: str = "") -> str:
    """Chat completion for chatbot."""
    return await _generate(
        prompt=prompt,
        system=system_prompt,
        temperature=0.5,
    )


async def medical_record_summary(records: list[dict]) -> str:
    """Generate an AI summary of patient medical records with caution."""
    records_text = "\n".join([
        f"- Date: {r.get('created_at', 'N/A')}, "
        f"Diagnosis: {r.get('diagnosis', 'N/A')}, "
        f"Symptoms: {r.get('symptoms', 'N/A')}, "
        f"Notes: {r.get('notes', 'N/A')}"
        for r in records
    ])

    system = """You are a medical AI assistant. Summarise the patient's medical history concisely.
    CRITICAL: You MUST include the following exact phrase at the beginning of your summary:
    "CAUTION: This is an AI-generated summary. Please verify details with a qualified healthcare professional."
    """

    prompt = f"Patient Records:\n{records_text}\n\nProvide a brief chronological summary."
    return await _generate(prompt=prompt, system=system, temperature=0.1)


async def generate_prescription_ai(diagnosis: str, symptoms: str, patient_info: str) -> dict:
    """Generate a prescription (medications list) based on diagnosis and symptoms."""
    system = """You are an AI assisting a doctor in prescribing medication.
    Given the diagnosis and symptoms, suggest a list of medications and general instructions.
    You MUST output valid JSON ONLY with this structure:
    {
      "medications": [
        {"name": "string", "dosage": "string", "frequency": "string", "duration": "string"}
      ],
      "instructions": "string"
    }
    """

    prompt = f"Diagnosis: {diagnosis}\nSymptoms: {symptoms}\nPatient Info: {patient_info}"
    response_text = await _generate(prompt=prompt, system=system, temperature=0.2)

    try:
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx+1]
            return json.loads(json_str)
        return {"medications": [], "instructions": response_text}
    except Exception:
        return {"medications": [], "instructions": "Error parsing AI response. " + response_text}


async def smart_search_patients(query: str, doctor_id: str, db) -> dict:
    """
    Convert a natural language search (e.g. "patients with diabetes last month")
    into a structured SQL query/filter for the doctor's patients.
    """
    system = """You are an SQL generator for a PostgreSQL database.
    Schema context for 'users' (u), 'appointments' (a), 'medical_records' (mr):
    u.id, u.email, u.first_name, u.last_name, u.role ('patient')
    a.patient_id, a.doctor_id, a.date, a.time_slot
    mr.patient_id, mr.diagnosis, mr.symptoms
    
    The query must ALWAYS filter by a.doctor_id = $1 (the logged-in doctor).
    Only return a valid PostgreSQL SELECT statement. No markdown formatting, no explanations.
    """
    
    prompt = f"Write a SQL query to find patients matching: '{query}'. Remember a.doctor_id = $1"
    sql_query = await _generate(prompt=prompt, system=system, temperature=0.0)

    # Basic safety clean
    sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
    
    if not sql_query.lower().startswith("select"):
        raise ValueError("AI failed to generate a SELECT query")

    # Execute the query
    try:
        rows = await db.fetch(sql_query, doctor_id)
        results = [dict(r) for r in rows]
        # Convert objects to strings for JSON
        for row in results:
            for k, v in row.items():
                row[k] = str(v) if v is not None else None
        return {"results": results, "interpreted_query": sql_query}
    except Exception as e:
        return {"results": [], "interpreted_query": f"Query failed: {str(e)}"}


async def pharmacy_inventory_forecast(inventory: list[dict], recent_prescriptions: list[dict]) -> dict:
    """Predict which items might run low based on recent prescription trends."""
    system = """You are a pharmacy inventory analyst.
    Given the current inventory and recent prescriptions, identify up to 5 items that are likely to run out soon.
    Output ONLY valid JSON:
    {
      "forecast": [
        {"medicine_name": "string", "reason": "string", "suggested_reorder_amount": int}
      ],
      "ai_available": true,
      "message": "AI analysis complete"
    }
    """
    
    inv_summary = [{"name": i["medicine_name"], "qty": i["quantity"]} for i in inventory]
    presc_summary = []
    for p in recent_prescriptions:
        meds = p.get("medications", [])
        if isinstance(meds, str):
            try:
                meds = json.loads(meds)
            except:
                pass
        if isinstance(meds, list):
            for m in meds:
                if isinstance(m, dict) and "name" in m:
                    presc_summary.append(m["name"])

    prompt = f"Inventory: {json.dumps(inv_summary)}\nRecent prescribed drugs: {json.dumps(presc_summary)}"
    response_text = await _generate(prompt=prompt, system=system, temperature=0.1)

    try:
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx+1]
            return json.loads(json_str)
        return {"ai_available": False, "message": "Failed to parse AI output"}
    except Exception:
        return {"ai_available": False, "message": "Failed to parse AI output"}
