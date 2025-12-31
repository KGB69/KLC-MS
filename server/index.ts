import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

dotenv.config();

const toCamel = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle Date objects - convert to YYYY-MM-DD format
    if (obj instanceof Date) {
        return obj.toISOString().split('T')[0];
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(toCamel);
    }

    // Handle non-object primitives
    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle plain objects
    const n: any = {};
    Object.keys(obj).forEach(k => {
        const camelKey = k.replace(/(_\w)/g, (m: string) => m[1].toUpperCase());
        n[camelKey] = toCamel((obj as any)[k]);
    });
    return n;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'klc-ms-secret-key-change-me';

app.use(cors());
app.use(express.json());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../../dist')));

// --- Authentication Middleware ---
interface AuthRequest extends Request {
    user?: any;
}

const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- Auth Routes ---

app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role',
            [username, email, passwordHash]
        );
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json(toCamel({ user, token }));
    } catch (err: any) {
        if (err.code === '23505') {
            res.status(400).json({ message: 'Email already registered' });
        } else {
            console.error(err);
            res.status(500).json({ message: 'Registration failed' });
        }
    }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        const { password_hash, ...userWithoutPassword } = user;
        res.json(toCamel({ user: userWithoutPassword, token }));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.post('/api/auth/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        // User is already authenticated via middleware, issue new token
        const user = req.user;
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Token refresh failed' });
    }
});

// --- Prospect Routes ---

app.get('/api/prospects', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query('SELECT * FROM prospects ORDER BY date_of_contact DESC');
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch prospects' });
    }
});

app.post('/api/prospects', authenticateToken, async (req: AuthRequest, res: Response) => {
    const {
        prospectName, email, phone, contactMethod, dateOfContact, notes, serviceInterestedIn,
        trainingLanguages, translationSourceLanguage, translationTargetLanguage
    } = req.body;
    try {
        const result = await query(
            'INSERT INTO prospects (prospect_name, email, phone, contact_method, date_of_contact, notes, service_interested_in, training_languages, translation_source_language, translation_target_language, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [prospectName, email, phone, contactMethod, dateOfContact, notes, serviceInterestedIn, trainingLanguages, translationSourceLanguage, translationTargetLanguage, req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add prospect' });
    }
});

app.get('/api/prospects/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM prospects WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prospect not found' });
        }
        res.json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch prospect' });
    }
});

app.put('/api/prospects/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ message: 'No updates provided' });

    const setClause = keys.map((key, i) => `${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = $${i + 2}`).join(', ');
    const values = keys.map(key => updates[key]);

    try {
        const result = await query(
            `UPDATE prospects SET ${setClause}, modified_by = $1, modified_at = CURRENT_TIMESTAMP WHERE id = $${keys.length + 2} RETURNING *`,
            [req.user.id, ...values, id]
        );
        res.json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update prospect' });
    }
});

app.delete('/api/prospects/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM prospects WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete prospect' });
    }
});

// --- Student Routes ---

app.get('/api/students', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query('SELECT * FROM students ORDER BY name ASC');
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch students' });
    }
});

app.post('/api/students', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, fees } = req.body;
    const datePart = registrationDate.replace(/-/g, '').slice(2);
    try {
        const result = await query(
            'INSERT INTO students (name, email, phone, registration_date, student_id, date_of_birth, nationality, occupation, address, mother_tongue, how_heard_about_us, how_heard_about_us_other, fees, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
            [name, email, phone, registrationDate, `STU-${datePart}-${Date.now().toString().slice(-4)}`, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, fees, req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to register student' });
    }
});

// --- Class Routes ---

app.get('/api/classes', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query('SELECT * FROM classes ORDER BY name ASC');
        const classes = await Promise.all(result.rows.map(async (cls: any) => {
            const schedules = await query('SELECT day_of_week, start_time, end_time FROM class_schedules WHERE class_id = $1', [cls.class_id]);
            const students = await query('SELECT student_id FROM student_enrollments WHERE class_id = $1', [cls.class_id]);
            return {
                ...cls,
                schedule: (schedules.rows as any[]),
                studentIds: (students.rows as any[]).map((r: any) => r.student_id)
            };
        }));
        res.json(toCamel(classes));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch classes' });
    }
});

app.post('/api/classes', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { name, language, level, teacherId, schedule } = req.body;
    const classId = `CLS-${Date.now().toString().slice(-6)}`;
    try {
        await query('BEGIN');
        const result = await query(
            'INSERT INTO classes (class_id, name, language, level, teacher_id, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [classId, name, language, level, teacherId, req.user.id]
        );
        for (const s of schedule) {
            await query('INSERT INTO class_schedules (class_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)', [classId, s.dayOfWeek, s.startTime, s.endTime]);
        }
        await query('COMMIT');
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Failed to add class' });
    }
});

// --- Student Routes ---

app.get('/api/students', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(`
            SELECT s.*, u1.username as created_by_username, u2.username as modified_by_username 
            FROM students s
            LEFT JOIN users u1 ON s.created_by = u1.id
            LEFT JOIN users u2 ON s.modified_by = u2.id
            ORDER BY s.name ASC
        `);
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch students' });
    }
});

app.post('/api/students', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howTheyHeardAboutUs, howTheyHeardAboutUsOther, fees, languageOfStudy } = req.body;
    console.log('📝 Creating student with data:', { name, howTheyHeardAboutUs, languageOfStudy }); // Debug log
    const studentId = `STU-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
        const result = await query(
            `INSERT INTO students (student_id, name, email, phone, registration_date, date_of_birth, nationality, occupation, address, mother_tongue, how_heard_about_us, how_heard_about_us_other, fees, language_of_study, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [studentId, name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howTheyHeardAboutUs, howTheyHeardAboutUsOther, fees, languageOfStudy, req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add student' });
    }
});

app.put('/api/students/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howTheyHeardAboutUs, howTheyHeardAboutUsOther, fees, languageOfStudy } = req.body;
    try {
        const result = await query(
            `UPDATE students SET name = $1, email = $2, phone = $3, registration_date = $4, date_of_birth = $5, nationality = $6, occupation = $7, address = $8, mother_tongue = $9, how_heard_about_us = $10, how_heard_about_us_other = $11, fees = $12, language_of_study = $13, modified_by = $14, modified_at = CURRENT_TIMESTAMP
             WHERE id = $15 RETURNING *`,
            [name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howTheyHeardAboutUs, howTheyHeardAboutUsOther, fees, languageOfStudy, req.user.id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update student' });
    }
});

// --- Finance Routes ---

app.get('/api/payments', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query('SELECT * FROM payments ORDER BY payment_date DESC');
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch payments' });
    }
});

app.post('/api/payments', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { payerName, clientId, paymentDate, amount, currency, service, paymentMethod, notes } = req.body;
    const paymentId = `PAY-${Date.now()}`;
    try {
        const result = await query(
            'INSERT INTO payments (payment_id, payer_name, client_id, payment_date, amount, currency, service, payment_method, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [paymentId, payerName, clientId, paymentDate, amount, currency, service, paymentMethod, notes, req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add payment' });
    }
});

app.get('/api/expenditures', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query('SELECT * FROM expenditures ORDER BY expenditure_date DESC');
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch expenditures' });
    }
});

app.post('/api/expenditures', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { payeeName, expenditureDate, amount, currency, description, category, paymentMethod } = req.body;
    const expenditureId = `EXP-${Date.now()}`;
    try {
        const result = await query(
            'INSERT INTO expenditures (expenditure_id, payee_name, expenditure_date, amount, currency, description, category, payment_method, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [expenditureId, payeeName, expenditureDate, amount, currency, description, category, paymentMethod, req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add expenditure' });
    }
});

// --- Followup Routes ---

app.get('/api/followups', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { prospectId } = req.query;
    try {
        const result = await query('SELECT * FROM follow_up_actions WHERE prospect_id = $1 ORDER BY due_date ASC', [prospectId]);
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch follow-ups' });
    }
});

app.post('/api/followups', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { prospectId, dueDate, notes, assignedTo } = req.body;
    try {
        const result = await query(
            'INSERT INTO follow_up_actions (prospect_id, due_date, notes, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
            [prospectId, dueDate, notes, assignedTo || req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add follow-up' });
    }
});

// --- DELETE Routes ---

app.delete('/api/payments/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM payments WHERE payment_id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete payment' });
    }
});

app.delete('/api/expenditures/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM expenditures WHERE expenditure_id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete expenditure' });
    }
});

// --- Communication Routes ---

app.get('/api/communications', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(`
            SELECT c.*, u.username as created_by_username 
            FROM communications c 
            LEFT JOIN users u ON c.created_by = u.id 
            ORDER BY c.due_date ASC
        `);
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch communications' });
    }
});

app.post('/api/communications', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { type, title, description, prospectId, assignedTo, dueDate, priority } = req.body;
    try {
        const result = await query(
            `INSERT INTO communications (type, title, description, prospect_id, assigned_to, due_date, priority, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [type, title, description, prospectId || null, assignedTo, dueDate, priority, req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add communication' });
    }
});

app.put('/api/communications/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, outcome, title, description, dueDate, priority, assignedTo } = req.body;
    try {
        const result = await query(
            `UPDATE communications SET status = COALESCE($1, status), outcome = COALESCE($2, outcome), 
             title = COALESCE($3, title), description = COALESCE($4, description), 
             due_date = COALESCE($5, due_date), priority = COALESCE($6, priority),
             assigned_to = COALESCE($7, assigned_to)
             WHERE id = $8 RETURNING *`,
            [status, outcome, title, description, dueDate, priority, assignedTo, id]
        );
        res.json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update communication' });
    }
});

app.delete('/api/communications/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM communications WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete communication' });
    }
});

// --- Catch-all to serve React's index.html (SPA support) ---
app.get(/^\/(?!api).*/, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
