import bcrypt from 'bcryptjs';
import { User, AuthUser, LoginCredentials, RegisterData } from '../types/user';

const DB_NAME = 'CRM_Auth_DB';
const DB_VERSION = 1;
const USERS_STORE = 'users';

class UserStorageService {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(USERS_STORE)) {
                    const store = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
                    store.createIndex('email', 'email', { unique: true });
                    store.createIndex('username', 'username', { unique: false });
                }
            };
        });
    }

    async register(data: RegisterData): Promise<AuthUser> {
        if (!this.db) await this.init();

        // Check if email already exists
        const existingUser = await this.getUserByEmail(data.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Create user
        const user: User = {
            id: crypto.randomUUID(),
            username: data.username,
            email: data.email,
            passwordHash,
            role: 'user',
            createdAt: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([USERS_STORE], 'readwrite');
            const store = transaction.objectStore(USERS_STORE);
            const request = store.add(user);

            request.onsuccess = () => {
                resolve(this.toAuthUser(user));
            };
            request.onerror = () => reject(request.error);
        });
    }

    async login(credentials: LoginCredentials): Promise<AuthUser> {
        if (!this.db) await this.init();

        const user = await this.getUserByEmail(credentials.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        return this.toAuthUser(user);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([USERS_STORE], 'readonly');
            const store = transaction.objectStore(USERS_STORE);
            const index = store.index('email');
            const request = index.get(email);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserById(id: string): Promise<AuthUser | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([USERS_STORE], 'readonly');
            const store = transaction.objectStore(USERS_STORE);
            const request = store.get(id);

            request.onsuccess = () => {
                const user = request.result;
                resolve(user ? this.toAuthUser(user) : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    private toAuthUser(user: User): AuthUser {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
    }
}

export const userStorage = new UserStorageService();
