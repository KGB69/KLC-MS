import { exportAllData, downloadJSON } from './dataExportService';

const BACKUP_SCHEDULE_KEY = 'autoBackupSchedule';
const LAST_BACKUP_KEY = 'lastBackupDate';
const BACKUP_ENABLED_KEY = 'autoBackupEnabled';

export type BackupInterval = 'daily' | 'weekly' | 'never';

export interface BackupSettings {
    enabled: boolean;
    interval: BackupInterval;
    lastBackup: string | null;
}

export function getBackupSettings(): BackupSettings {
    return {
        enabled: localStorage.getItem(BACKUP_ENABLED_KEY) === 'true',
        interval: (localStorage.getItem(BACKUP_SCHEDULE_KEY) as BackupInterval) || 'never',
        lastBackup: localStorage.getItem(LAST_BACKUP_KEY),
    };
}

export function setBackupSettings(settings: Partial<BackupSettings>): void {
    if (settings.enabled !== undefined) {
        localStorage.setItem(BACKUP_ENABLED_KEY, settings.enabled.toString());
    }
    if (settings.interval) {
        localStorage.setItem(BACKUP_SCHEDULE_KEY, settings.interval);
    }
}

export function getLastBackupDate(): string | null {
    return localStorage.getItem(LAST_BACKUP_KEY);
}

function setLastBackupDate(date: string): void {
    localStorage.setItem(LAST_BACKUP_KEY, date);
}

export function shouldBackupNow(): boolean {
    const settings = getBackupSettings();

    if (!settings.enabled || settings.interval === 'never') {
        return false;
    }

    const lastBackup = settings.lastBackup;
    if (!lastBackup) {
        return true; // Never backed up
    }

    const lastBackupDate = new Date(lastBackup);
    const now = new Date();
    const diffMs = now.getTime() - lastBackupDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (settings.interval === 'daily' && diffDays >= 1) {
        return true;
    }

    if (settings.interval === 'weekly' && diffDays >= 7) {
        return true;
    }

    return false;
}

export async function performAutoBackup(store: any): Promise<boolean> {
    try {
        const data = await exportAllData(store);
        downloadJSON(data, `auto-backup-${new Date().toISOString().split('T')[0]}.json`);
        setLastBackupDate(new Date().toISOString());
        return true;
    } catch (error) {
        console.error('Auto-backup failed:', error);
        return false;
    }
}

export function initAutoBackup(store: any): void {
    // Check on app load
    if (shouldBackupNow()) {
        performAutoBackup(store);
    }

    // Check daily
    setInterval(() => {
        if (shouldBackupNow()) {
            performAutoBackup(store);
        }
    }, 24 * 60 * 60 * 1000); // Check every 24 hours
}
