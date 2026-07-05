# Database Design & Schema Details

The application utilizes **PostgreSQL 15+** due to its robust JSONB support, advanced indexing capabilities, and unparalleled reliability.

## 1. Schema Definitions & Table Details

### `users` (Core Authentication)
Manages login credentials and global roles.
*   `id` (UUID, Primary Key)
*   `email` (VARCHAR, Unique, Indexed)
*   `password_hash` (VARCHAR)
*   `user_role` (ENUM: 'admin', 'hospital_admin', 'doctor', 'patient', 'pharmacy', 'staff')
*   `is_active` (BOOLEAN, Default: TRUE)
*   `created_at`, `updated_at` (TIMESTAMP)

### `hospitals` (Multi-Tenancy)
*   `id` (UUID, Primary Key)
*   `name` (VARCHAR)
*   `address`, `contact_number` (VARCHAR)
*   `subscription_tier` (ENUM: 'basic', 'premium', 'enterprise')

### `user_hospitals` (Mapping Table)
Links a user to one or more hospitals.
*   `user_id` (UUID, Foreign Key -> `users`)
*   `hospital_id` (UUID, Foreign Key -> `hospitals`)
*   *Composite Primary Key (user_id, hospital_id)*

### `medical_records`
Stores the clinical history of patients.
*   `id` (UUID, Primary Key)
*   `patient_id` (UUID, Foreign Key -> `users`)
*   `doctor_id` (UUID, Foreign Key -> `users`)
*   `hospital_id` (UUID, Foreign Key -> `hospitals`)
*   `diagnosis` (TEXT)
*   `symptoms` (JSONB) - Allows flexible querying.
*   `doctor_notes` (TEXT)
*   `is_ai_summarized` (BOOLEAN)

### `prescriptions`
*   `id` (UUID, Primary Key)
*   `record_id` (UUID, Foreign Key -> `medical_records`)
*   `medication_data` (JSONB) - Contains the structured drug list.
*   `pharmacy_access_token` (VARCHAR, Nullable, Indexed) - For the 10-minute temp access.
*   `token_expires_at` (TIMESTAMP)
*   `is_ai_generated` (BOOLEAN)

## 2. Performance Optimization & Indexing

To maintain sub-millisecond queries under load, we utilize strategic indexing:
1.  **B-Tree Indexes:** Applied to all Foreign Keys (`hospital_id`, `patient_id`, `doctor_id`) to speed up `JOIN` operations.
2.  **GIN (Generalized Inverted Index):** Applied to `JSONB` columns (like `medication_data` and `symptoms`) to allow blazing-fast document searches (e.g., finding all prescriptions containing "Metformin" nested inside the JSON).
3.  **Partial Indexes:** Applied to the `pharmacy_access_token` column, indexing only rows where `token_expires_at > NOW()`. This keeps the index tiny and ultra-fast for token verification.

## 3. Database Security
*   **Prepared Statements:** The `asyncpg` driver natively uses parameterized queries, making SQL injection mathematically impossible.
*   **Cascade Deletions:** Handled carefully. Deleting a hospital cascades to `user_hospitals`, but users remain intact in the system. Deleting a patient is heavily restricted and requires manual `admin` approval via the `account_requests` table to prevent catastrophic data loss.
