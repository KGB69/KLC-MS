import React, { useState, useEffect } from 'react';
import { IndexedDBProspectDataStore } from '../../services/indexedDBProspectStore';
import { Prospect, Student } from '../../types';

interface ActivityFeedProps {
    prospectStore: IndexedDBProspectDataStore;
}

interface ActivityItem {
    id: string;
    type: 'prospect' | 'student' | 'class';
    title: string;
    description: string;
    timestamp: string;
    user: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ prospectStore }) => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            // Get recent prospects
            const prospects = await prospectStore.searchProspects({
                contactMethod: 'all',
                serviceInterestedIn: 'all',
                searchTerm: '',
            });

            // Get recent students
            const students = await prospectStore.getStudents();

            // Get recent classes
            const classes = await prospectStore.getClasses();

            // Combine and sort by creation date
            const items: ActivityItem[] = [];

            // Add prospects
            prospects.slice(0, 5).forEach((p: Prospect) => {
                if (p.createdAt) {
                    items.push({
                        id: p.id,
                        type: 'prospect',
                        title: `New Prospect: ${p.prospectName}`,
                        description: `${p.serviceInterestedIn} service`,
                        timestamp: p.createdAt,
                        user: p.createdByUsername || 'Unknown',
                    });
                }
            });

            // Add students
            students.slice(0, 3).forEach((s: Student) => {
                if (s.createdAt) {
                    items.push({
                        id: s.id,
                        type: 'student',
                        title: `New Student: ${s.name}`,
                        description: `Student ID: ${s.studentId}`,
                        timestamp: s.createdAt,
                        user: s.createdByUsername || 'Unknown',
                    });
                }
            });

            // Sort by timestamp (most recent first)
            items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setActivities(items.slice(0, 5)); // Show only 5 most recent
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'prospect':
                return (
                    <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                );
            case 'student':
                return (
                    <div className="w-8 h-8 bg-brand-secondary/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                );
            case 'class':
                return (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start space-x-3 animate-pulse">
                            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Recent Activity</h2>
            {activities.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                    No recent activity
                </p>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                            {getIcon(activity.type)}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-slate-400">{formatTimestamp(activity.timestamp)}</span>
                                    <span className="text-xs text-slate-400">•</span>
                                    <span className="text-xs text-slate-400">by {activity.user}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
