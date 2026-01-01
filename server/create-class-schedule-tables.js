import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createClassScheduleTables() {
    try {
        console.log('🗄️  Creating class schedule tables...');

        // Create class_schedules table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS class_schedules (
        id VARCHAR(255) PRIMARY KEY,
        class_name VARCHAR(255) NOT NULL,
        language VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL,
        
        -- Time
        start_datetime TIMESTAMP NOT NULL,
        end_datetime TIMESTAMP NOT NULL,
        
        -- Assignments
        teacher_id VARCHAR(255) NOT NULL,
        teacher_name VARCHAR(255),
        room VARCHAR(100),
        
        -- Enrollment
        capacity INTEGER DEFAULT 20,
        
        -- Status
        status VARCHAR(50) DEFAULT 'scheduled',
        is_recurring BOOLEAN DEFAULT false,
        recurring_group_id VARCHAR(255),
        
        -- Metadata
        notes TEXT,
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255),
        
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

        console.log('✅ Created class_schedules table');

        // Create class_enrollments table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id VARCHAR(255) PRIMARY KEY,
        class_id VARCHAR(255) NOT NULL,
        student_id VARCHAR(255) NOT NULL,
        enrolled_at TIMESTAMP DEFAULT NOW(),
        attendance_status VARCHAR(50),
        notes TEXT,
        
        FOREIGN KEY (class_id) REFERENCES class_schedules(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        UNIQUE(class_id, student_id)
      );
    `);

        console.log('✅ Created class_enrollments table');

        // Create indexes
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_class_schedules_datetime 
      ON class_schedules(start_datetime, end_datetime);
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_class_schedules_status 
      ON class_schedules(status);
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_class_enrollments_student 
      ON class_enrollments(student_id);
    `);

        console.log('✅ Created indexes');
        console.log('🎉 Class schedule tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

createClassScheduleTables();
