-- KLC Management System Database Schema

-- Users table for shared accounts
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prospects table
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_method TEXT NOT NULL,
    date_of_contact DATE NOT NULL,
    notes TEXT,
    service_interested_in TEXT NOT NULL,
    status TEXT DEFAULT 'Inquired',
    
    -- Service specific fields (kept flexible for now)
    training_languages TEXT[],
    translation_source_language TEXT,
    translation_target_language TEXT,
    
    -- Completion details
    translation_completion_date DATE,
    document_title TEXT,
    number_of_pages INTEGER,
    translation_rate_per_page NUMERIC,
    translation_total_fee NUMERIC,
    
    interpretation_completion_date DATE,
    subject_of_interpretation TEXT,
    interpretation_duration NUMERIC,
    interpretation_duration_unit TEXT,
    interpretation_rate NUMERIC,
    interpretation_total_fee NUMERIC,
    interpretation_event_date DATE,
    
    -- Attribution
    created_by UUID REFERENCES users(id),
    modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table (for converted prospects or direct registrations)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL, -- e.g., STU-DDMMYY-NNNN
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    registration_date DATE NOT NULL,
    date_of_birth DATE,
    nationality TEXT,
    occupation TEXT,
    address TEXT,
    mother_tongue TEXT,
    how_heard_about_us TEXT,
    how_heard_about_us_other TEXT,
    fees NUMERIC,
    
    -- Attribution
    created_by UUID REFERENCES users(id),
    modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Follow-up Actions
CREATE TABLE IF NOT EXISTS follow_up_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    class_id TEXT PRIMARY KEY, -- e.g., CLS-NNNNNN
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    level TEXT NOT NULL,
    teacher_id TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Class Schedule
CREATE TABLE IF NOT EXISTS class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id TEXT REFERENCES classes(class_id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Student Enrollments
CREATE TABLE IF NOT EXISTS student_enrollments (
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES classes(class_id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, class_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY, -- PAY-NNNNNNNN
    payer_name TEXT NOT NULL,
    client_id UUID, -- Can link to student or prospect id
    payment_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    service TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    balance_currency TEXT,
    payment_method TEXT NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expenditures
CREATE TABLE IF NOT EXISTS expenditures (
    expenditure_id TEXT PRIMARY KEY, -- EXP-NNNNNNNN
    payee_name TEXT NOT NULL,
    expenditure_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Communications/Tasks
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'prospect-followup' or 'general'
    title TEXT NOT NULL,
    description TEXT,
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    assigned_to TEXT NOT NULL, -- Username or 'Everyone'
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'medium',
    outcome TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
