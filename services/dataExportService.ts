import { getCurrentUserInfo } from './userAttributionService';
import type { Prospect, Student, Class, Payment, Expenditure } from '../types';

export interface ExportMetadata {
    exportDate: string;
    exportedBy: string;
    exportedByUsername: string;
    version: string;
    appName: string;
}

export interface ExportData {
    metadata: ExportMetadata;
    data: {
        prospects: Prospect[];
        students: Student[];
        classes: Class[];
        payments: Payment[];
        expenditures: Expenditure[];
    };
}

export async function exportAllData(store: any): Promise<ExportData> {
    const userInfo = await getCurrentUserInfo();

    // Get all data from IndexedDB
    const [prospects, students, classes, payments, expenditures] = await Promise.all([
        store.searchProspects({ contactMethod: 'all', serviceInterestedIn: 'all', searchTerm: '' }),
        store.getStudents(),
        store.getClasses(),
        store.getAllPayments(),
        store.getAllExpenditures(),
    ]);

    // Also get completed jobs
    const completedJobs = await store.getCompletedJobs();
    const allProspects = [...prospects, ...completedJobs];

    return {
        metadata: {
            exportDate: new Date().toISOString(),
            exportedBy: userInfo.id,
            exportedByUsername: userInfo.username,
            version: '1.0.0',
            appName: 'Prospect CRM',
        },
        data: {
            prospects: allProspects,
            students,
            classes,
            payments,
            expenditures,
        },
    };
}

export function downloadJSON(data: ExportData, filename?: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function uploadToServer(data: ExportData, serverUrl: string): Promise<boolean> {
    try {
        const response = await fetch(`${serverUrl}/api/backup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to upload to server:', error);
        return false;
    }
}
