import React, { useState, useEffect } from 'react';
import { getStorageInfo, formatBytes, StorageInfo } from '../../services/storageInfoService';

const StorageDashboard: React.FC = () => {
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageInfo();
    }, []);

    const loadStorageInfo = async () => {
        setIsLoading(true);
        try {
            const info = await getStorageInfo();
            setStorageInfo(info);
        } catch (error) {
            console.error('Failed to load storage info:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Storage Usage</h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Loading storage info...</p>
                </div>
            </div>
        );
    }

    if (!storageInfo) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Storage Usage</h2>
                <p className="text-slate-600">Storage information unavailable</p>
            </div>
        );
    }

    const { used, quota, percentage, breakdown } = storageInfo;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-brand-dark">Storage Usage</h2>
                <button
                    onClick={loadStorageInfo}
                    className="text-sm text-brand-primary hover:text-sky-700 font-medium"
                >
                    Refresh
                </button>
            </div>

            {/* Overall Usage */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">
                        {formatBytes(used)} of {formatBytes(quota)} used
                    </span>
                    <span className="font-semibold text-brand-dark">
                        {percentage.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-brand-primary'
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Breakdown */}
            <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Storage Breakdown</h3>
                <div className="space-y-2">
                    {Object.entries(breakdown).map(([key, bytes]) => (
                        <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 capitalize">{key}</span>
                            <span className="font-medium text-slate-800">{formatBytes(bytes as number)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warning */}
            {percentage > 80 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                        ⚠️ Storage is running low. Consider exporting and archiving old data.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StorageDashboard;
