# AI Features & Integration Deep Dive

The integration of Generative AI into healthcare requires a meticulous approach to safety, privacy, and accuracy. We utilize a locally hosted **Ollama** instance running the **Qwen 14B** model to completely eliminate the risk of patient data leaking to third-party cloud providers (like OpenAI or Anthropic).

## 1. NLP to SQL Patient Search
Doctors can query complex data sets using natural language without knowing SQL. 

**Workflow:**
1.  **Doctor Input:** "Show me all patients diagnosed with Type 2 Diabetes in the last 30 days."
2.  **Prompt Engineering:** The backend constructs a prompt containing the user's request and a minimized, read-only representation of the database schema (table names, column names, relationships).
3.  **LLM Execution:** Qwen 14B translates this into:
    ```sql
    SELECT p.* FROM patient_profiles p 
    JOIN medical_records m ON p.id = m.patient_id 
    WHERE m.diagnosis ILIKE '%Type 2 Diabetes%' 
    AND m.created_at >= NOW() - INTERVAL '30 days';
    ```
4.  **Validation & Privacy Firewall:** Before execution, the backend parses the SQL to ensure no destructive commands (`DROP`, `DELETE`, `INSERT`) are present. It then injects privacy filters:
    ```sql
    -- Backend automatically injects:
    AND p.id NOT IN (SELECT patient_id FROM patient_hospital_privacy WHERE hospital_id = $1)
    ```

## 2. Chronological Medical Summarization
Reading through years of scattered patient records is time-consuming. The AI summarizer aggregates these records into a cohesive brief.

**Prompt Strategy:**
We utilize a **Chain-of-Thought (CoT)** prompting strategy. The LLM is instructed to first extract key diagnoses, then map out a timeline of symptoms, and finally generate a concise summary.

**Example AI Output:**
> **Patient Summary:** 45-year-old male. First presented with elevated blood pressure in 2021. Diagnosed with Hypertension (2021) and early-stage Type 2 Diabetes (2023). Currently prescribed Metformin (500mg) and Lisinopril (10mg). Recent visits show stable glucose levels but ongoing complaints of mild neuropathy.

## 3. AI-Generated Prescription Drafts
To streamline administrative tasks, the LLM processes symptoms and a diagnosis to output a structured JSON prescription.

**Structured Output Enforcement:**
The LLM is prompted with strict JSON schemas. If the output fails `pydantic` validation in the backend, the backend automatically issues a correction prompt to the LLM or falls back to a manual entry form.

```json
{
  "diagnosis": "Acute Bronchitis",
  "medications": [
    {
      "name": "Azithromycin",
      "dosage": "250mg",
      "frequency": "2 tablets on day 1, 1 tablet daily for 4 days",
      "duration": "5 days"
    },
    {
      "name": "Albuterol Inhaler",
      "dosage": "90mcg/actuation",
      "frequency": "1-2 puffs every 4-6 hours as needed for shortness of breath",
      "duration": "As needed"
    }
  ],
  "lifestyle_recommendations": "Rest, increase fluid intake, use a humidifier."
}
```

## 4. RAG-Powered AI Chatbot
The patient-facing support bot uses Retrieval-Augmented Generation (RAG). 

Instead of relying on the model's base training, the backend retrieves specific hospital documents (markdown files containing schedules, doctor bios, and fee structures) and injects them into the context window. This ensures the bot always provides up-to-date, hospital-specific information and refuses to answer non-medical or off-topic questions.

## 5. Clinical Safety & Human-In-The-Loop (HITL)
AI in healthcare is an assistive tool, not a replacement for medical judgment.
*   **Audit Trails:** Every AI generation is logged in the database with an `is_ai_generated = TRUE` flag and the exact prompt used.
*   **UI Banners:** The frontend strictly enforces the rendering of an orange `<AIBanner />` component above any AI content, legally discharging liability and prompting doctor verification.
