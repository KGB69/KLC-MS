import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

dotenv.config();

const toCamel = (obj: any, parentKey: string = ''): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle Date objects - preserve full timestamp for timestamp fields, date-only for date fields
    if (obj instanceof Date) {
        // Fields that should be date-only (YYYY-MM-DD)
        const dateOnlyFields = ['due_date', 'birth_date', 'date_of_birth', 'start_date', 'end_date'];

        if (dateOnlyFields.includes(parentKey.toLowerCase())) {
            // Date-only field - return YYYY-MM-DD
            const year = obj.getFullYear();
            const month = String(obj.getMonth() + 1).padStart(2, '0');
            const day = String(obj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } else {
            // Timestamp field - return full ISO string
            return obj.toISOString();
        }
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => toCamel(item, parentKey));
    }

    // Handle non-object primitives
    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle plain objects
    const n: any = {};
    Object.keys(obj).forEach(k => {
        const camelKey = k.replace(/(_\w)/g, (m: string) => m[1].toUpperCase());
        n[camelKey] = toCamel((obj as any)[k], k); // Pass original snake_case key
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

// Serve static files with cache busting headers
// JavaScript and CSS files have content hashes in their filenames, so they can be cached long-term
app.use(express.static(path.join(__dirname, '../../dist'), {
    maxAge: '1y',  // Cache hashed assets for 1 year
    setHeaders: (res: express.Response, filePath: string) => {
        // HTML files should never be cached - always fetch fresh
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        // Service worker should also not be cached
        else if (filePath.includes('sw.js') || filePath.includes('workbox')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        // Manifest should be short-term cached
        else if (filePath.endsWith('.json')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
        }
    }
}));

// --- Authentication Middleware ---
interface AuthRequest extends Request {
    user?: any;
}

const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;

        // Update session last_active timestamp
        if (user.sessionId) {
            try {
                await query(
                    'UPDATE user_sessions SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
                    [user.sessionId]
                );
            } catch (error) {
                console.error('Failed to update session timestamp:', error);
                // Don't fail the request if timestamp update fails
            }
        }

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
    const { email, password, deviceDetails } = req.body; // Accept optional deviceDetails from client
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Parse device information from user-agent  
        const userAgent = req.headers['user-agent'] || '';

        // Extract browser name and version
        let browser = 'Unknown Browser';
        let browserVersion = '';
        const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
        const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
        const safariMatch = userAgent.match(/Version\/([\d.]+).*Safari/);
        const edgeMatch = userAgent.match(/Edg\/([\d.]+)/);

        if (edgeMatch) {
            browser = 'Edge';
            browserVersion = edgeMatch[1];
        } else if (chromeMatch) {
            browser = 'Chrome';
            browserVersion = chromeMatch[1];
        } else if (firefoxMatch) {
            browser = 'Firefox';
            browserVersion = firefoxMatch[1];
        } else if (safariMatch) {
            browser = 'Safari';
            browserVersion = safariMatch[1];
        }

        // Extract OS name and version
        let os = 'Unknown OS';
        let osVersion = '';
        const windowsMatch = userAgent.match(/Windows NT ([\d.]+)/);
        const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
        const linuxMatch = userAgent.match(/Linux/);
        const androidMatch = userAgent.match(/Android ([\d.]+)/);
        const iosMatch = userAgent.match(/OS ([\d_]+)/);

        if (windowsMatch) {
            os = 'Windows';
            osVersion = windowsMatch[1];
        } else if (macMatch) {
            os = 'macOS';
            osVersion = macMatch[1].replace(/_/g, '.');
        } else if (androidMatch) {
            os = 'Android';
            osVersion = androidMatch[1];
        } else if (iosMatch) {
            os = 'iOS';
            osVersion = iosMatch[1].replace(/_/g, '.');
        } else if (linuxMatch) {
            os = 'Linux';
        }

        const deviceName = `${browser} on ${os}`;
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

        // Create unique session token
        const sessionToken = jwt.sign(
            { id: user.id, username: user.username, timestamp: Date.now() },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create session record with verbose device details
        const sessionResult = await query(
            `INSERT INTO user_sessions (
                user_id, session_token, device_name, browser, os, ip_address, user_agent,
                browser_version, os_version, screen_resolution, timezone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
                user.id,
                sessionToken,
                deviceName,
                browser,
                os,
                ipAddress,
                userAgent,
                browserVersion,
                osVersion,
                deviceDetails?.screenResolution || null,
                deviceDetails?.timezone || null
            ]
        );
        const sessionId = sessionResult.rows[0].id;

        // Create JWT with sessionId
        const token = jwt.sign(
            { id: user.id, username: user.username, sessionId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

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

app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        // Revoke current session
        if (user.sessionId) {
            await query(
                `UPDATE user_sessions 
                 SET is_active = false, revoked_at = CURRENT_TIMESTAMP, revoked_by = $1 
                 WHERE id = $2`,
                [user.id, user.sessionId]
            );
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Logout failed' });
    }
});

// --- Creator Names Autocomplete ---

// GET /api/creator-names - Fetch creator names sorted by usage frequency
app.get('/api/creator-names', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(`
            SELECT created_by_username as name, COUNT(*) as usage_count
            FROM (
                SELECT created_by_username FROM prospects WHERE created_by_username IS NOT NULL AND created_by_username != ''
                UNION ALL
                SELECT created_by_username FROM students WHERE created_by_username IS NOT NULL AND created_by_username != ''
                UNION ALL
                SELECT created_by_username FROM classes WHERE created_by_username IS NOT NULL AND created_by_username != ''
                UNION ALL
                SELECT created_by_username FROM payments WHERE created_by_username IS NOT NULL AND created_by_username != ''
                UNION ALL
                SELECT created_by_username FROM expenditures WHERE created_by_username IS NOT NULL AND created_by_username != ''
                UNION ALL
                SELECT created_by_username FROM communications WHERE created_by_username IS NOT NULL AND created_by_username != ''
            ) combined
            GROUP BY name
            ORDER BY usage_count DESC
            LIMIT 50
        `);

        res.json(toCamel({ names: result.rows }));
    } catch (err) {
        console.error('Error fetching creator names:', err);
        res.status(500).json({ message: 'Failed to fetch creator names' });
    }
});

// --- Session Management Endpoints ---

// GET /api/sessions - List user's active sessions
app.get('/api/sessions', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const currentToken = req.headers['authorization']?.split(' ')[1];
        const result = await query(
            `SELECT id, device_name, browser, os, ip_address, last_active, created_at, 
                    (session_token = $2) as is_current
             FROM user_sessions 
             WHERE user_id = $1 AND is_active = true 
             ORDER BY last_active DESC`,
            [req.user.id, currentToken]
        );
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});

// DELETE /api/sessions/:id - Revoke a specific session
app.delete('/api/sessions/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        // Don't allow revoking current session
        const checkResult = await query('SELECT session_token FROM user_sessions WHERE id = $1', [id]);
        const currentToken = req.headers['authorization']?.split(' ')[1];

        if (checkResult.rows[0]?.session_token === currentToken) {
            return res.status(400).json({ message: 'Cannot revoke current session. Use logout instead.' });
        }

        await query(
            `UPDATE user_sessions 
             SET is_active = false, revoked_at = CURRENT_TIMESTAMP, revoked_by = $1 
             WHERE id = $2 AND user_id = $1`,
            [req.user.id, id]
        );
        res.json({ message: 'Session revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to revoke session' });
    }
});

// DELETE /api/sessions/all-others - Revoke all except current
app.delete('/api/sessions/all-others', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const currentToken = req.headers['authorization']?.split(' ')[1];
        await query(
            `UPDATE user_sessions 
             SET is_active = false, revoked_at = CURRENT_TIMESTAMP, revoked_by = $1 
             WHERE user_id = $1 AND session_token != $2 AND is_active = true`,
            [req.user.id, currentToken]
        );
        res.json({ message: 'All other sessions revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to revoke sessions' });
    }
});

// Admin: GET /api/admin/users
app.get('/api/admin/users', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [req.user.id]);
        if (userCheck.rows[0]?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const result = await query(
            `SELECT u.id, u.username, u.email, u.role, u.created_at,
                    COUNT(s.id) FILTER (WHERE s.is_active = true) as active_sessions
             FROM users u
             LEFT JOIN user_sessions s ON u.id = s.user_id
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Admin: GET /api/admin/users/:userId/sessions
app.get('/api/admin/users/:userId/sessions', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    try {
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [req.user.id]);
        if (userCheck.rows[0]?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const result = await query(
            `SELECT id, device_name, browser, os, ip_address, is_active, last_active, created_at, revoked_at
             FROM user_sessions 
             WHERE user_id = $1 
             ORDER BY last_active DESC`,
            [userId]
        );
        res.json(toCamel(result.rows));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});

// Admin: DELETE /api/admin/sessions/:sessionId
app.delete('/api/admin/sessions/:sessionId', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { sessionId } = req.params;
    try {
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [req.user.id]);
        if (userCheck.rows[0]?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        await query(
            `UPDATE user_sessions 
             SET is_active = false, revoked_at = CURRENT_TIMESTAMP, revoked_by = $1 
             WHERE id = $2`,
            [req.user.id, sessionId]
        );
        res.json({ message: 'Session revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed  to revoke session' });
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
            'INSERT INTO prospects (prospect_name, email, phone, contact_method, date_of_contact, notes, service_interested_in, training_languages, translation_source_language, translation_target_language, translation_total_fee, interpretation_total_fee, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [prospectName, email, phone, contactMethod, dateOfContact, notes, serviceInterestedIn, trainingLanguages, translationSourceLanguage, translationTargetLanguage, req.body.translationTotalFee || 0, req.body.interpretationTotalFee || 0, req.user.id]
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
    const { name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, languageOfStudy, fees } = req.body;
    const datePart = registrationDate.replace(/-/g, '').slice(2);
    try {
        const result = await query(
            'INSERT INTO students (name, email, phone, registration_date, student_id, date_of_birth, nationality, occupation, address, mother_tongue, how_heard_about_us, how_heard_about_us_other, language_of_study, fees, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
            [name, email, phone, registrationDate, `STU-${datePart}-${Date.now().toString().slice(-4)}`, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, languageOfStudy, fees, req.user.id]
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
    const { name, language, level, teacherId, roomNumber, schedule } = req.body;
    const classId = `CLS-${Date.now().toString().slice(-6)}`;
    try {
        await query('BEGIN');
        const result = await query(
            'INSERT INTO classes (class_id, name, language, level, teacher_id, room_number, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [classId, name, language, level, teacherId, roomNumber, req.user.id]
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

app.get('/api/class-schedules', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { start, end } = req.query;

    try {
        const result = await query(`
            SELECT cs.*, c.name as class_name, c.language, c.level, c.teacher_id, c.room_number
            FROM class_schedules cs
            JOIN classes c ON cs.class_id = c.class_id
        `);

        const startDate = new Date(start as string);
        const endDate = new Date(end as string);
        const events: any[] = [];

        result.rows.forEach((schedule: any) => {
            const dayOfWeek = schedule.day_of_week;
            const startTime = schedule.start_time;
            const endTime = schedule.end_time;

            const current = new Date(startDate);
            while (current <= endDate) {
                const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });

                if (dayName === dayOfWeek) {
                    const [startHour, startMin] = startTime.split(':');
                    const eventStart = new Date(current);
                    eventStart.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

                    const [endHour, endMin] = endTime.split(':');
                    const eventEnd = new Date(current);
                    eventEnd.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

                    events.push({
                        id: `${schedule.id}-${current.toISOString().split('T')[0]}`,
                        scheduleId: schedule.id,
                        classId: schedule.class_id,
                        title: schedule.class_name,
                        language: schedule.language,
                        level: schedule.level,
                        teacherId: schedule.teacher_id,
                        roomNumber: schedule.room_number,
                        start: eventStart.toISOString(),
                        end: eventEnd.toISOString(),
                        dayOfWeek: dayOfWeek
                    });
                }

                current.setDate(current.getDate() + 1);
            }
        });

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch class schedules' });
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
    const { name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, fees, languageOfStudy } = req.body;
    console.log('📝 Creating student with data:', { name, howHeardAboutUs, languageOfStudy }); // Debug log
    const studentId = `STU-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
        const result = await query(
            `INSERT INTO students (student_id, name, email, phone, registration_date, date_of_birth, nationality, occupation, address, mother_tongue, how_heard_about_us, how_heard_about_us_other, fees, language_of_study, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [studentId, name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, fees, languageOfStudy, req.user.id]
        );
        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add student' });
    }
});

app.put('/api/students/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, fees, languageOfStudy } = req.body;
    try {
        const result = await query(
            `UPDATE students SET name = $1, email = $2, phone = $3, registration_date = $4, date_of_birth = $5, nationality = $6, occupation = $7, address = $8, mother_tongue = $9, how_heard_about_us = $10, how_heard_about_us_other = $11, fees = $12, language_of_study = $13, modified_by = $14, modified_at = CURRENT_TIMESTAMP
             WHERE id = $15 RETURNING *`,
            [name, email, phone, registrationDate, dateOfBirth, nationality, occupation, address, motherTongue, howHeardAboutUs, howHeardAboutUsOther, fees, languageOfStudy, req.user.id, id]
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
        console.log('Creating follow-up with data:', { prospectId, dueDate, notes, assignedTo, userId: req.user?.id });

        // Validate required fields
        if (!prospectId) {
            return res.status(400).json({ message: 'Prospect ID is required' });
        }
        if (!dueDate) {
            return res.status(400).json({ message: 'Due date is required' });
        }

        // Create follow-up action
        const result = await query(
            'INSERT INTO follow_up_actions (prospect_id, due_date, notes, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
            [prospectId, dueDate, notes, assignedTo || req.user.id]
        );

        // Also create communication entry for dashboard/communications tab
        await query(
            `INSERT INTO communications (type, title, description, prospect_id, assigned_to, due_date, status, priority, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                'prospect-followup',
                notes || 'Follow-up scheduled',
                notes,
                prospectId,
                assignedTo || 'Unassigned',
                dueDate,
                'Pending',
                'medium',
                req.user.id
            ]
        );

        res.status(201).json(toCamel(result.rows[0]));
    } catch (err) {
        console.error('Error creating follow-up:', err);
        console.error('Request body was:', req.body);
        res.status(500).json({ message: 'Failed to add follow-up', error: (err as Error).message });
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

app.delete('/api/followups/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM follow_up_actions WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete follow-up' });
    }
});

app.put('/api/followups/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { dueDate, assignedTo, notes, status, outcome } = req.body;
    try {
        const result = await query(
            'UPDATE follow_up_actions SET due_date = $1, assigned_to = $2, notes = $3, status = $4, outcome = $5 WHERE id = $6 RETURNING *',
            [dueDate, assignedTo, notes, status, outcome, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Follow-up not found' });
        }
        res.json(toCamel(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update follow-up' });
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

// --- Database Migrations ---
const runMigrations = async () => {
    try {
        console.log('Running database migrations...');

        // 1. Add room_number to classes
        await query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_number TEXT');

        // 2. Fix assigned_to in follow_up_actions (change from UUID to TEXT)
        // First drop the FK constraint if it exists
        await query('ALTER TABLE follow_up_actions DROP CONSTRAINT IF EXISTS follow_up_actions_assigned_to_fkey');
        // Then change column type
        await query('ALTER TABLE follow_up_actions ALTER COLUMN assigned_to TYPE TEXT');

        // 3. Ensure fees column exists in students (for balance calculation)
        await query('ALTER TABLE students ADD COLUMN IF NOT EXISTS fees NUMERIC DEFAULT 0');
        await query('UPDATE students SET fees = 0 WHERE fees IS NULL');

        // 4. Ensure fee columns exist in prospects (for balance calculation)
        await query('ALTER TABLE prospects ADD COLUMN IF NOT EXISTS translation_total_fee NUMERIC DEFAULT 0');
        await query('UPDATE prospects SET translation_total_fee = 0 WHERE translation_total_fee IS NULL');

        await query('ALTER TABLE prospects ADD COLUMN IF NOT EXISTS interpretation_total_fee NUMERIC DEFAULT 0');
        await query('UPDATE prospects SET interpretation_total_fee = 0 WHERE interpretation_total_fee IS NULL');

        // 5. Create user_sessions table for device/session management
        await query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_token TEXT NOT NULL UNIQUE,
                device_name TEXT,
                browser TEXT,
                os TEXT,
                ip_address TEXT,
                user_agent TEXT,
                is_active BOOLEAN DEFAULT true,
                last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                revoked_at TIMESTAMP WITH TIME ZONE,
                revoked_by UUID REFERENCES users(id)
            )
        `);
        await query('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)');
        await query('CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active)');
        // Add verbose device tracking columns to user_sessions
        await query(`
            ALTER TABLE user_sessions 
            ADD COLUMN IF NOT EXISTS browser_version TEXT,
            ADD COLUMN IF NOT EXISTS os_version TEXT,
            ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
            ADD COLUMN IF NOT EXISTS timezone TEXT,
            ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 0
        `);

        console.log('✅ Auto-migrations completed successfully');
    } catch (err) {
        console.error('❌ Auto-migration error:', err);
        // Don't exit, might be a transient error
    }
};

// Start server
const startServer = async () => {
    await runMigrations();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

startServer();
