import React, { useState, useEffect } from 'react';
import {
    getBackupSettings,
    setBackupSettings,
    getLastBackupDate,
    performAutoBackup,
    BackupInterval
} from '../../services/backupScheduler';
import { ProspectDataStore, StudentDataStore, ClassDataStore, PaymentDataStore, ExpenditureDataStore } from '../../types';

interface BackupSettingsProps {
    prospectStore: ProspectDataStore & StudentDataStore & ClassDataStore & PaymentDataStore & ExpenditureDataStore;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ prospectStore }) => {
    const [enabled, setEnabled] = useState(false);
    const [interval, setInterval] = useState<BackupInterval>('never');
    const [lastBackup, setLastBackup] = useState<string | null>(null);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const settings = getBackupSettings();
        setEnabled(settings.enabled);
        setInterval(settings.interval);
        setLastBackup(settings.lastBackup);
    }, []);

    const handleToggleEnabled = (checked: boolean) => {
        setEnabled(checked);
        setBackupSettings({ enabled: checked });
    };

    const handleIntervalChange = (newInterval: BackupInterval) => {
        setInterval(newInterval);
        setBackupSettings({ interval: newInterval });
    };

    const handleManualBackup = async () => {
        setIsBackingUp(true);
        setMessage(null);
        try {
            const success = await performAutoBackup(prospectStore);
            if (success) {
                const newLastBackup = getLastBackupDate();
                setLastBackup(newLastBackup);
                setMessage('Backup created successfully!');
            } else {
                setMessage('Backup failed. Please try again.');
            }
        } catch (error) {
            setMessage('Backup failed. Please try again.');
        } finally {
            setIsBackingUp(false);
        }
    };

    const formatLastBackup = (date: string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Auto-Backup Settings</h2>

            {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {message}
                </div>
            )}

            <div className="space-y-4">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                        <h3 className="font-semibold text-brand-dark">Enable Auto-Backup</h3>
                        <p className="text-sm text-slate-600">Automatically backup your data on schedule</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => handleToggleEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                </div>

                {/* Backup Interval */}
                <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-brand-dark mb-3">Backup Frequency</h3>
                    <div className="space-y-2">
                        {(['never', 'daily', 'weekly'] as BackupInterval[]).map((freq) => (
                            <label key={freq} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="interval"
                                    value={freq}
                                    checked={interval === freq}
                                    onChange={() => handleIntervalChange(freq)}
                                    disabled={!enabled}
                                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                                />
                                <span className={`text-sm ${!enabled ? 'text-slate-400' : 'text-slate-700'} capitalize`}>
                                    {freq}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Last Backup Info */}
                <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-brand-dark">Last Backup</h3>
                            <p className="text-sm text-slate-600">{formatLastBackup(lastBackup)}</p>
                        </div>
                        <button
                            onClick={handleManualBackup}
                            disabled={isBackingUp}
                            className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isBackingUp ? 'Backing up...' : 'Backup Now'}
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        💡 Auto-backups are saved to your Downloads folder. Keep them safe for disaster recovery!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BackupSettings;
