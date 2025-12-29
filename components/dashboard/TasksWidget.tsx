import React, { useState, useEffect } from 'react';
import { FollowUpAction, FollowUpStatus, Communication, CommunicationType } from '../../types';
import { IndexedDBProspectDataStore } from '../../services/indexedDBProspectStore';

interface TasksWidgetProps {
    prospectStore: IndexedDBProspectDataStore;
    onViewAll: () => void;
}

// Union type for both follow-ups and communications
type TaskItem = (FollowUpAction & { itemType: 'followup'; prospectName: string; assignedToUsername: string }) | (Communication & { itemType: 'communication' });

const TasksWidget: React.FC<TasksWidgetProps> = ({ prospectStore, onViewAll }) => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                // Fetch follow-ups
                const allFollowUps = await prospectStore.getAllFollowUps();
                const pendingFollowUps = allFollowUps.filter(t => t.status === FollowUpStatus.Pending);

                // Fetch general communications
                const allCommunications = await prospectStore.getAllCommunications();
                const pendingCommunications = allCommunications.filter(c => c.status === FollowUpStatus.Pending);

                // Get prospect names
                const allProspects = await prospectStore.searchProspects({
                    contactMethod: 'all',
                    serviceInterestedIn: 'all',
                    searchTerm: ''
                });
                const completedJobs = await prospectStore.getCompletedJobs();
                const prospectMap: Record<string, string> = {};
                allProspects.forEach(p => prospectMap[p.id] = p.prospectName);
                completedJobs.forEach(p => prospectMap[p.id] = p.prospectName);

                // Map follow-ups
                const followUpItems: TaskItem[] = pendingFollowUps.map(task => ({
                    ...task,
                    itemType: 'followup' as const,
                    prospectName: prospectMap[task.prospectId] || 'Unknown',
                    assignedToUsername: task.assignedTo || 'Unassigned'
                }));

                // Map communications
                const communicationItems: TaskItem[] = pendingCommunications.map(comm => ({
                    ...comm,
                    itemType: 'communication' as const
                }));

                // Combine and sort by due date
                const allItems = [...followUpItems, ...communicationItems].sort(
                    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                );

                // Take top 5
                setTasks(allItems.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadTasks();

        const handleUpdate = () => {
            loadTasks();
        };

        document.addEventListener('followUpUpdated', handleUpdate);
        document.addEventListener('communicationUpdated', handleUpdate);
        return () => {
            document.removeEventListener('followUpUpdated', handleUpdate);
            document.removeEventListener('communicationUpdated', handleUpdate);
        };
    }, []);

    const isOverdue = (dueDate: string) => {
        const d = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    };

    const isDueToday = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) return (
        <div className="h-full animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-16 bg-slate-100 rounded"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Tasks Due Today
                </h3>
                <span className="bg-brand-secondary/10 text-brand-secondary text-xs font-bold px-2 py-1 rounded-full">
                    {tasks.length} Pending
                </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        <p>No urgent tasks.</p>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className="bg-white p-3 rounded-lg border border-slate-200 hover:border-brand-primary transition-all cursor-pointer"
                            onClick={onViewAll}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOverdue(task.dueDate)
                                            ? 'bg-red-100 text-red-700'
                                            : isDueToday(task.dueDate)
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {isOverdue(task.dueDate) ? 'OVERDUE' : isDueToday(task.dueDate) ? 'TODAY' : formatDate(task.dueDate)}
                                        </span>
                                        {task.itemType === 'communication' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                                Team
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                                        {task.itemType === 'communication' ? task.title : task.notes}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        {task.itemType === 'followup' && task.prospectName && (
                                            <span>{task.prospectName}</span>
                                        )}
                                        <span className="flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Assigned to: {task.itemType === 'communication' ? task.assignedTo : task.assignedToUsername}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full mt-1.5 ml-2 flex-shrink-0 ${isOverdue(task.dueDate)
                                    ? 'bg-red-500'
                                    : isDueToday(task.dueDate)
                                        ? 'bg-orange-500'
                                        : 'bg-brand-primary'
                                    }`}></div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={onViewAll}
                className="mt-4 w-full py-2 text-sm text-brand-primary font-medium hover:bg-brand-primary/5 rounded-lg transition-colors"
            >
                View all tasks →
            </button>
        </div>
    );
};

export default TasksWidget;
