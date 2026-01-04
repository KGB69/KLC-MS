import React, { useState, useEffect } from 'react';
import { UserSession } from '../../types';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';

interface SessionManagementProps {
    dataStore: any; // ApiProspectDataStore has session methods not in interface
}

const SessionManagement: React.FC<SessionManagementProps> = ({ dataStore }) => {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

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
        // Update current time every second for real-time duration display
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to revoke this session? The device will be logged out immediately.')) {
            return;
        }

        try {
            await dataStore.revokeSession(sessionId);
            await fetchSessions();
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
            await fetchSessions();
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

    const formatActiveDuration = (lastActive: string) => {
        const seconds = differenceInSeconds(currentTime, new Date(lastActive));
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m ago`;
    };

    const getSessionStatus = (lastActive: string, isCurrent: boolean) => {
        if (isCurrent) return 'active';
        const minutes = Math.floor(differenceInSeconds(currentTime, new Date(lastActive)) / 60);
        if (minutes < 60) return 'active'; // Active if used in last hour
        if (minutes < 1440) return 'stale'; // Stale if 1-24 hours
        return 'inactive'; // Inactive if >24 hours
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Sessions</h2>
                <div className="animate-pulse">
                    <div className="h-10 bg-slate-200 rounded mb-2"></div>
                    <div className="h-16 bg-slate-100 rounded mb-2"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
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

    const otherSessions = sessions.filter(s => !s.isCurrent);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Active Sessions</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        {sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}
                        {sessions.length > 1 && ' • Times update in real-time'}
                    </p>
                </div>
                {otherSessions.length > 0 && (
                    <button
                        onClick={handleRevokeAllOthers}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                        Revoke All Others ({otherSessions.length})
                    </button>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    No active sessions found
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 w-8"></th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Device</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Browser & OS</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">IP Address</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Last Activity</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map(session => (
                                <React.Fragment key={session.id}>
                                    <tr
                                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${session.isCurrent ? 'bg-green-50' : ''
                                            }`}
                                    >
                                        {/* Expand/Collapse Button */}
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                                aria-expanded={expandedSessionId === session.id}
                                                aria-controls={`session-details-${session.id}`}
                                            >
                                                {expandedSessionId === session.id ? '▼' : '▶'}
                                            </button>
                                        </td>

                                        {/* Device */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">{getDeviceIcon(session.deviceName)}</span>
                                                <span className="font-medium text-slate-800">{session.deviceName}</span>
                                            </div>
                                        </td>

                                        {/* Browser & OS */}
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {session.browserVersion ? `${session.browser} ${session.browserVersion}` : session.browser} • {session.osVersion ? `${session.os} ${session.osVersion}` : session.os}
                                        </td>

                                        {/* Remaining cells stay the same */}
                                        <td className="py-3 px-4 text-sm text-slate-500 font-mono">
                                            {session.ipAddress}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">
                                                {session.isCurrent ? (
                                                    <span className="text-green-600 font-medium">⚡ Active now</span>
                                                ) : (
                                                    <span className="text-slate-600">{formatActiveDuration(session.lastActive)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {session.isCurrent ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ This Device
                                                </span>
                                            ) : (() => {
                                                const status = getSessionStatus(session.lastActive, session.isCurrent);
                                                if (status === 'active') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            🟢 Active
                                                        </span>
                                                    );
                                                } else if (status === 'stale') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            🟡 Stale
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                            ⚪ Inactive
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {!session.isCurrent && (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expandable Detail Row */}
                                    {expandedSessionId === session.id && (
                                        <tr id={`session-details-${session.id}`} className="bg-slate-50">
                                            <td colSpan={7} className="py-4 px-6">
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-semibold text-slate-700">Browser Version:</span>
                                                        <p className="text-slate-600">{session.browserVersion || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-700">OS Version:</span>
                                                        <p className="text-slate-600">{session.osVersion || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-700">Screen Resolution:</span>
                                                        <p className="text-slate-600">{session.screenResolution || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-700">Timezone:</span>
                                                        <p className="text-slate-600">{session.timezone || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-700">Login Time:</span>
                                                        <p className="text-slate-600">{new Date(session.createdAt).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-700">Session Duration:</span>
                                                        <p className="text-slate-600">{formatActiveDuration(session.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">💡 About Sessions</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Sessions are created when you log in from a device</li>
                    <li>• "Last Activity" updates in real-time as you use the app</li>
                    <li>• <strong>Status badges:</strong> 🟢 Active (&lt;1h), 🟡 Stale (1-24h), ⚪ Inactive (&gt;24h)</li>
                    <li>• Revoking a session logs out that device immediately</li>
                    <li>• Logging out properly removes your session from this list</li>
                    <li>• Multiple sessions from the same IP mean you logged in multiple times without logging out</li>
                </ul>
            </div>
        </div>
    );
};

export default SessionManagement;
