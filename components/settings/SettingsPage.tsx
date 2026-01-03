import React, { useState } from 'react';
import { ProspectDataStore, StudentDataStore, ClassDataStore, PaymentDataStore, ExpenditureDataStore } from '../../types';
import { exportAllData, downloadJSON, uploadToServer } from '../../services/dataExportService';
import { importData, downloadFromServer } from '../../services/dataImportService';
import StorageDashboard from './StorageDashboard';
import BackupSettings from './BackupSettings';

interface SettingsPageProps {
    prospectStore: ProspectDataStore & StudentDataStore & ClassDataStore & PaymentDataStore & ExpenditureDataStore;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ prospectStore }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [serverUrl, setServerUrl] = useState('');

    const handleExport = async () => {
        setIsExporting(true);
        setMessage(null);
        try {
            const data = await exportAllData(prospectStore);
            downloadJSON(data);
            setMessage({ type: 'success', text: 'Data exported successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setMessage(null);
        try {
            const result = await importData(file, prospectStore);
            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `Import successful! Imported ${result.imported.prospects} prospects. Skipped ${result.skipped} duplicates.`
                });
            } else {
                setMessage({ type: 'error', text: `Import failed: ${result.errors.join(', ')}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        } finally {
            setIsImporting(false);
            event.target.value = '';
        }
    };

    const handleServerSync = async () => {
        if (!serverUrl) {
            setMessage({ type: 'error', text: 'Please enter a server URL' });
            return;
        }

        setIsExporting(true);
        setMessage(null);
        try {
            const data = await exportAllData(prospectStore);
            const success = await uploadToServer(data, serverUrl);
            if (success) {
                setMessage({ type: 'success', text: 'Data synced to server successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to sync to server' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Server sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        } finally {
            setIsExporting(false);
        }
    };

    const handleServerDownload = async () => {
        if (!serverUrl) {
            setMessage({ type: 'error', text: 'Please enter a server URL' });
            return;
        }

        setIsImporting(true);
        setMessage(null);
        try {
            const data = await downloadFromServer(serverUrl);
            if (data) {
                setMessage({ type: 'success', text: 'Downloaded backup from server. Review and import manually.' });
                downloadJSON(data, 'server-backup.json');
            } else {
                setMessage({ type: 'error', text: 'Failed to download from server' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Server download failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-brand-dark mb-8">Settings</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Export/Import Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Data Backup & Restore</h2>

                <div className="space-y-4">
                    {/* Export */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-brand-dark">Export Data</h3>
                            <p className="text-sm text-slate-600">Download all your CRM data as a JSON file</p>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-brand-primary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? 'Exporting...' : 'Export'}
                        </button>
                    </div>

                    {/* Import */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-brand-dark">Import Data</h3>
                            <p className="text-sm text-slate-600">Restore data from a backup file</p>
                        </div>
                        <label className="bg-brand-secondary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 cursor-pointer">
                            {isImporting ? 'Importing...' : 'Import'}
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                disabled={isImporting}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Server Sync Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Server Sync</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Server URL
                        </label>
                        <input
                            type="url"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            placeholder="https://your-server.com"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">Enter your backup server URL (optional)</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleServerSync}
                            disabled={isExporting || !serverUrl}
                            className="flex-1 bg-brand-primary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Upload to Server
                        </button>
                        <button
                            onClick={handleServerDownload}
                            disabled={isImporting || !serverUrl}
                            className="flex-1 bg-brand-secondary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Download from Server
                        </button>
                    </div>
                </div>
            </div>

            {/* Storage Dashboard */}
            <div className="mb-6">
                <StorageDashboard />
            </div>

            {/* Auto-Backup Settings */}
            <div className="mb-6">
                <BackupSettings prospectStore={prospectStore} />
            </div>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Export your data regularly to prevent data loss</li>
                    <li>• User attribution (who created/modified entries) is preserved in backups</li>
                    <li>• Server sync requires a compatible backend API</li>
                    <li>• Import will skip duplicate entries (same ID)</li>
                </ul>
            </div>
        </div>
    );
};

export default SettingsPage;
