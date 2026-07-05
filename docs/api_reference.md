# REST API Reference

The backend follows strictly typed RESTful conventions utilizing JSON payloads and Bearer Token (JWT) authentication.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user and returns a JWT session token.

*   **Request Body (JSON):**
    ```json
    {
      "email": "doctor@hospital.com",
      "password": "securepassword123"
    }
    ```
*   **Responses:**
    *   `200 OK`: 
        ```json
        {
          "access_token": "eyJhbGciOiJIUzI1...",
          "token_type": "bearer",
          "user": { "id": "uuid", "role": "doctor" }
        }
        ```
    *   `401 Unauthorized`: Invalid credentials.

---

## 2. Doctor Endpoints

### `POST /api/doctor/prescriptions/ai-generate`
Generates a structured prescription draft using the local LLM.

*   **Headers:** `Authorization: Bearer <token>` (Requires `doctor` role)
*   **Request Body (JSON):**
    ```json
    {
      "patient_id": "uuid-1234",
      "diagnosis": "Type 2 Diabetes",
      "symptoms": ["Frequent urination", "Thirst", "Fatigue"],
      "allergies": ["Penicillin"]
    }
    ```
*   **Responses:**
    *   `200 OK`:
        ```json
        {
          "draft_id": "temp-uuid-5678",
          "medications": [
            { "name": "Metformin", "dosage": "500mg", "frequency": "Once daily" }
          ],
          "is_ai_generated": true
        }
        ```
    *   `403 Forbidden`: User is not a doctor.
    *   `503 Service Unavailable`: Local Ollama instance is unreachable.

### `POST /api/doctor/smart-search`
Executes an NLP-to-SQL search against the patient database.

*   **Request Body:** `{"query": "Find patients over 50 with hypertension"}`
*   **Response:** Array of patient profiles (scrubbed of blacklisted patients).

---

## 3. Patient Portal Endpoints

### `POST /api/prescriptions/{id}/share`
Generates a temporary access token for pharmacy verification.

*   **Headers:** `Authorization: Bearer <token>` (Requires `patient` role matching the prescription)
*   **Responses:**
    *   `201 Created`:
        ```json
        {
          "access_token": "PHA-9F8X-2B1A",
          "expires_in_seconds": 600,
          "expires_at": "2026-07-05T18:00:00Z"
        }
        ```

### `POST /api/patient/privacy`
Adds a hospital to the patient's privacy blacklist.

*   **Request Body:** `{"hospital_id": "uuid-hospital-123"}`
*   **Response:** `200 OK` (Success message).

---

## 4. Pharmacy Endpoints

### `POST /api/pharmacy/prescriptions/verify`
Validates a patient's sharing token and retrieves the prescription.

*   **Headers:** `Authorization: Bearer <token>` (Requires `pharmacy` role)
*   **Request Body:** `{"access_token": "PHA-9F8X-2B1A"}`
*   **Responses:**
    *   `200 OK`: Returns full prescription JSON and patient name.
    *   `404 Not Found / 410 Gone`: Token is invalid or expired.
