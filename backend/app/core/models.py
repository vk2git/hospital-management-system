"""
SQL table definitions for HMS v2.
Uses raw SQL via asyncpg — no ORM.
All IDs are UUIDs via gen_random_uuid().
"""

SCHEMA_SQL = """
-- ═══════════════════════════════════════════════════════════════════════
--  ENUMS
-- ═══════════════════════════════════════════════════════════════════════
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'staff', 'pharmacy', 'hospital_admin', 'head_of_staff', 'head_of_doctor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE request_type AS ENUM ('password_reset', 'account_deletion');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════════════
--  CORE USERS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    first_name      VARCHAR(150) NOT NULL,
    last_name       VARCHAR(150) NOT NULL DEFAULT '',
    phone           VARCHAR(20),
    role            user_role NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);


-- ═══════════════════════════════════════════════════════════════════════
--  HOSPITALS & TENANCY
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hospitals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_hospitals (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, hospital_id)
);

CREATE INDEX IF NOT EXISTS idx_user_hospitals_user ON user_hospitals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hospitals_hospital ON user_hospitals(hospital_id);

CREATE TABLE IF NOT EXISTS patient_hospital_privacy (
    patient_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    PRIMARY KEY (patient_id, hospital_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_hospital_privacy_patient ON patient_hospital_privacy(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_hospital_privacy_hospital ON patient_hospital_privacy(hospital_id);


-- ═══════════════════════════════════════════════════════════════════════
--  PROFILES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization      VARCHAR(100) NOT NULL DEFAULT 'General',
    qualification       VARCHAR(255) DEFAULT '',
    experience_years    INTEGER NOT NULL DEFAULT 0,
    consultation_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,
    available_days      TEXT[] NOT NULL DEFAULT '{"MON","TUE","WED","THU","FRI"}',
    slot_duration_min   INTEGER NOT NULL DEFAULT 30
);

CREATE TABLE IF NOT EXISTS patient_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth       DATE,
    gender              VARCHAR(20),
    blood_group         VARCHAR(5),
    address             TEXT,
    emergency_contact   VARCHAR(20),
    insurance_id        VARCHAR(100)
);


-- ═══════════════════════════════════════════════════════════════════════
--  APPOINTMENTS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    time_slot       TIME NOT NULL,
    duration_min    INTEGER NOT NULL DEFAULT 30,
    status          appointment_status NOT NULL DEFAULT 'scheduled',
    reason          TEXT,
    notes           TEXT,
    share_medical_summary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);


-- ═══════════════════════════════════════════════════════════════════════
--  MEDICAL RECORDS & PRESCRIPTIONS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS medical_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
    diagnosis       TEXT,
    symptoms        TEXT,
    notes           TEXT,
    ai_summary      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);

CREATE TABLE IF NOT EXISTS prescriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id       UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    patient_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id               UUID REFERENCES users(id) ON DELETE SET NULL,
    medications             JSONB NOT NULL DEFAULT '[]',
    instructions            TEXT,
    is_ai_generated         BOOLEAN NOT NULL DEFAULT FALSE,
    pharmacy_access_token   VARCHAR(255),
    pharmacy_access_expires TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_pharmacy_token ON prescriptions(pharmacy_access_token);


-- ═══════════════════════════════════════════════════════════════════════
--  PAYMENTS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
    amount          DECIMAL(10,2) NOT NULL,
    status          payment_status NOT NULL DEFAULT 'pending',
    method          VARCHAR(50),
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);


-- ═══════════════════════════════════════════════════════════════════════
--  NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(50),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);


-- ═══════════════════════════════════════════════════════════════════════
--  ADMIN — ACCOUNT REQUESTS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS account_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            request_type NOT NULL,
    status          request_status NOT NULL DEFAULT 'pending',
    admin_notes     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_account_requests_status ON account_requests(status);


-- ═══════════════════════════════════════════════════════════════════════
--  STAFF MANAGEMENT
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_title      VARCHAR(100) NOT NULL,
    department      VARCHAR(100),
    shift           VARCHAR(50),
    is_head         BOOLEAN NOT NULL DEFAULT FALSE,
    invited_by      UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS staff_invitations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    role_title      VARCHAR(100) NOT NULL,
    department      VARCHAR(100),
    invited_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON staff_invitations(email);


-- ═══════════════════════════════════════════════════════════════════════
--  PHARMACY
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_name   VARCHAR(255) NOT NULL,
    generic_name    VARCHAR(255),
    category        VARCHAR(100),
    quantity        INTEGER NOT NULL DEFAULT 0,
    unit_price      DECIMAL(10,2),
    reorder_level   INTEGER NOT NULL DEFAULT 10,
    expiry_date     DATE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);




-- ═══════════════════════════════════════════════════════════════════════
--  MIGRATIONS
-- ═══════════════════════════════════════════════════════════════════════
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='share_medical_summary') THEN
        ALTER TABLE appointments ADD COLUMN share_medical_summary BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

"""
