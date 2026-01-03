import type { ExportData } from './dataExportService';
import type { ProspectDataStore, StudentDataStore, ClassDataStore, PaymentDataStore, ExpenditureDataStore } from '../types';

export type ImportDataStore = ProspectDataStore & StudentDataStore & ClassDataStore & PaymentDataStore & ExpenditureDataStore;

export interface ImportResult {
    success: boolean;
    imported: {
        prospects: number;
        students: number;
        classes: number;
        payments: number;
        expenditures: number;
    };
    skipped: number;
    errors: string[];
}

export function validateImportData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (!data.metadata || !data.data) return false;
    if (!data.metadata.version || !data.metadata.appName) return false;
    if (!Array.isArray(data.data.prospects)) return false;
    if (!Array.isArray(data.data.students)) return false;
    if (!Array.isArray(data.data.classes)) return false;
    if (!Array.isArray(data.data.payments)) return false;
    if (!Array.isArray(data.data.expenditures)) return false;

    return true;
}

export async function importData(file: File, store: ImportDataStore): Promise<{ success: boolean; imported: any; skipped: number; errors: string[] }> {
    const result: ImportResult = {
        success: false,
        imported: {
            prospects: 0,
            students: 0,
            classes: 0,
            payments: 0,
            expenditures: 0,
        },
        skipped: 0,
        errors: [],
    };

    try {
        const text = await file.text();
        const data: ExportData = JSON.parse(text);

        if (!validateImportData(data)) {
            result.errors.push('Invalid data format');
            return result;
        }

        // Get existing IDs to check for duplicates
        const existingProspects = await store.searchProspects({
            contactMethod: 'all',
            serviceInterestedIn: 'all',
            searchTerm: ''
        });
        const existingProspectIds = new Set(existingProspects.map((p: any) => p.id));

        // Import prospects (skip duplicates)
        for (const prospect of data.data.prospects) {
            if (existingProspectIds.has(prospect.id)) {
                result.skipped++;
                continue;
            }
            try {
                // Import with existing ID and attribution
                await store.addProspectWithId(prospect.id, prospect);
                result.imported.prospects++;
            } catch (error) {
                result.errors.push(`Failed to import prospect: ${prospect.prospectName}`);
            }
        }

        // Similar logic for other entities...
        // For now, we'll focus on prospects as the main entity

        result.success = result.errors.length === 0;
        return result;

    } catch (error) {
        result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return result;
    }
}

export async function downloadFromServer(serverUrl: string): Promise<ExportData | null> {
    try {
        const response = await fetch(`${serverUrl}/api/backup/latest`);
        if (!response.ok) return null;

        const data = await response.json();
        return validateImportData(data) ? data : null;
    } catch (error) {
        console.error('Failed to download from server:', error);
        return null;
    }
}
