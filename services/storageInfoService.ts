export interface StorageInfo {
    used: number; // bytes
    quota: number; // bytes
    percentage: number; // 0-100
    breakdown: {
        prospects: number;
        students: number;
        classes: number;
        payments: number;
        expenditures: number;
        users: number;
    };
}

export async function getStorageInfo(): Promise<StorageInfo> {
    const breakdown = {
        prospects: 0,
        students: 0,
        classes: 0,
        payments: 0,
        expenditures: 0,
        users: 0,
    };

    // Get storage estimate
    let used = 0;
    let quota = 0;

    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        used = estimate.usage || 0;
        quota = estimate.quota || 0;
    }

    // Get IndexedDB size breakdown (approximate)
    try {
        const dbRequest = indexedDB.open('ProspectCRMDB');

        await new Promise<void>((resolve, reject) => {
            dbRequest.onsuccess = async () => {
                const db = dbRequest.result;

                // Get counts for each store
                const storeNames = ['prospects', 'students', 'classes', 'payments', 'expenditures'];

                for (const storeName of storeNames) {
                    try {
                        const tx = db.transaction(storeName, 'readonly');
                        const store = tx.objectStore(storeName);
                        const countRequest = store.count();

                        await new Promise<void>((res) => {
                            countRequest.onsuccess = () => {
                                const count = countRequest.result;
                                // Rough estimate: 1KB per record
                                breakdown[storeName as keyof typeof breakdown] = count * 1024;
                                res();
                            };
                            countRequest.onerror = () => res();
                        });
                    } catch (e) {
                        // Store might not exist
                    }
                }

                db.close();
                resolve();
            };

            dbRequest.onerror = () => reject();
        });

        // Get users count
        const userDbRequest = indexedDB.open('UserDB');
        await new Promise<void>((resolve) => {
            userDbRequest.onsuccess = async () => {
                const db = userDbRequest.result;
                try {
                    const tx = db.transaction('users', 'readonly');
                    const store = tx.objectStore('users');
                    const countRequest = store.count();

                    await new Promise<void>((res) => {
                        countRequest.onsuccess = () => {
                            breakdown.users = countRequest.result * 512; // Smaller estimate for users
                            res();
                        };
                        countRequest.onerror = () => res();
                    });
                } catch (e) {
                    // Ignore
                }
                db.close();
                resolve();
            };
            userDbRequest.onerror = () => resolve();
        });
    } catch (error) {
        console.error('Error getting storage breakdown:', error);
    }

    const percentage = quota > 0 ? (used / quota) * 100 : 0;

    return {
        used,
        quota,
        percentage,
        breakdown,
    };
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
