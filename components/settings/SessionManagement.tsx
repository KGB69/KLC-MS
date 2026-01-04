import React, { useState, useEffect } from 'react';
import { UserSession } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface SessionManagementProps {
    dataStore: any; // ApiProspectDataStore has session methods not in interface
}

const SessionManagement: React.FC<SessionManagementProps> = ({ dataStore }) => {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await dataStore.getSessions();
            setSessions(data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
            setError('Failed to load active sessions');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to revoke this session? The device will be logged out immediately.')) {
            return;
        }

        try {
            await dataStore.revokeSession(sessionId);
            await fetchSessions(); // Refresh list
        } catch (err) {
            console.error('Failed to revoke session:', err);
            alert('Failed to revoke session');
        }
    };

    const handleRevokeAllOthers = async () => {
        if (!confirm('This will log out all other devices. Continue?')) {
            return;
        }

        try {
            await dataStore.revokeAllOtherSessions();
            await fetchSessions(); // Refresh list
        } catch (err) {
            console.error('Failed to revoke sessions:', err);
            alert('Failed to revoke sessions');
        }
    };

    const getDeviceIcon = (deviceName: string) => {
        const name = deviceName.toLowerCase();
        if (name.includes('mobile') || name.includes('android') || name.includes('ios')) {
            return '📱';
        }
        if (name.includes('tablet') || name.includes('ipad')) {
            return '💻';
        }
        return '🖥️';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Sessions</h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Sessions</h2>
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    const currentSession = sessions.find(s => s.isCurrent);
    const otherSessions = sessions.filter(s => !s.isCurrent);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Active Sessions</h2>
                {otherSessions.length > 0 && (
                    <button
                        onClick={handleRevokeAllOthers}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                        Revoke All Other Sessions
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Current Session */}
                {currentSession && (
                    <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <span className="text-3xl">{getDeviceIcon(currentSession.deviceName)}</span>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold text-slate-800">{currentSession.deviceName}</h3>
                                        <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                            ✓ This Device
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {currentSession.browser} • {currentSession.os}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        IP: {currentSession.ipAddress}
                                    </p>
                                    <p className="text-xs text-green-600 font-medium">
                                        ⚡ Active now (viewing this page)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Sessions */}
                {otherSessions.map(session => (
                    <div key={session.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <span className="text-3xl">{getDeviceIcon(session.deviceName)}</span>
                                <div>
                                    <h3 className="font-semibold text-slate-800">{session.deviceName}</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {session.browser} • {session.os}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        IP: {session.ipAddress}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Last active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                                Revoke
                            </button>
                        </div>
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        No active sessions found
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">About Sessions</h3>
                <p className="text-sm text-slate-600">
                    Sessions are created when you log in from a device. Revoking a session will log out that device immediately.
                    You can't revoke your current session from here - use the Logout button instead.
                </p>
            </div>
        </div>
    );
};

export default SessionManagement;
