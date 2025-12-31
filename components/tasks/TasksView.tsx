import React, { useState, useEffect } from 'react';
import { FollowUpAction, FollowUpStatus, Prospect, Communication, CommunicationType, CommunicationPriority, CommunicationFormData } from '../../types';
import { IndexedDBProspectDataStore } from '../../services/indexedDBProspectStore';
import CommunicationForm from '../communications/CommunicationForm';
import Modal from '../shared/Modal';
import TimeFilter from '../shared/TimeFilter';
import { filterDataByTime, TimeFilterType, CustomDateRange } from '../../utils/dateFilters';

interface CommunicationsViewProps {
    prospectStore: IndexedDBProspectDataStore;
}

type FilterType = 'all' | 'prospect' | 'general' | 'pending' | 'completed';

// Union type for displaying both follow-ups and communications
type CommunicationItem = (FollowUpAction & { itemType: 'followup'; prospectName: string; priority?: CommunicationPriority }) | (Communication & { itemType: 'communication'; prospectName?: string });

const CommunicationsView: React.FC<CommunicationsViewProps> = ({ prospectStore }) => {
    const [items, setItems] = useState<CommunicationItem[]>([]);
    const [prospects, setProspects] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCommunication, setEditingCommunication] = useState<Communication | null>(null);
    const [deletingItem, setDeletingItem] = useState<CommunicationItem | null>(null);
    const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
    const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

    const fetchCommunications = async () => {
        setLoading(true);
        try {
            // Fetch follow-ups
            const followUps = await prospectStore.getAllFollowUps();

            // Fetch general communications
            const communications = await prospectStore.getAllCommunications();

            // Fetch prospects for name mapping
            const allProspects = await prospectStore.searchProspects({ contactMethod: 'all', serviceInterestedIn: 'all', searchTerm: '' });
            const completedJobs = await prospectStore.getCompletedJobs();
            const prospectMap: Record<string, string> = {};
            allProspects.forEach(p => prospectMap[p.id] = p.prospectName);
            completedJobs.forEach(p => prospectMap[p.id] = p.prospectName);
            setProspects(prospectMap);

            // Combine and type items
            const followUpItems: CommunicationItem[] = followUps.map(fu => ({
                ...fu,
                itemType: 'followup' as const,
                prospectName: prospectMap[fu.prospectId] || 'Unknown',
                priority: CommunicationPriority.Medium // Default for follow-ups
            }));

            const communicationItems: CommunicationItem[] = communications.map(comm => ({
                ...comm,
                itemType: 'communication' as const,
                prospectName: comm.prospectId ? prospectMap[comm.prospectId] : undefined
            }));

            const allItems = [...followUpItems, ...communicationItems].sort(
                (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );

            setItems(allItems);
        } catch (error) {
            console.error('Failed to load communications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunications();

        const handleUpdate = () => {
            fetchCommunications();
        };

        document.addEventListener('followUpUpdated', handleUpdate);
        document.addEventListener('communicationUpdated', handleUpdate);
        return () => {
            document.removeEventListener('followUpUpdated', handleUpdate);
            document.removeEventListener('communicationUpdated', handleUpdate);
        };
    }, []);

    const handleStatusUpdate = async (item: CommunicationItem, newStatus: FollowUpStatus) => {
        try {
            if (item.itemType === 'followup') {
                await prospectStore.updateFollowUp(item.id, { status: newStatus });
            } else {
                await prospectStore.updateCommunication(item.id, { status: newStatus });
            }
            fetchCommunications();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleAddCommunication = async (data: CommunicationFormData) => {
        try {
            if (editingCommunication) {
                // Update existing
                await prospectStore.updateCommunication(editingCommunication.id, data);
                setEditingCommunication(null);
            } else {
                // Create new
                await prospectStore.addCommunication(data);
            }
            setIsFormOpen(false);
            fetchCommunications();
        } catch (error) {
            console.error('Failed to save communication', error);
            alert('Failed to save communication. Please try again.');
        }
    };

    const handleEditCommunication = (comm: Communication) => {
        setEditingCommunication(comm);
        setIsFormOpen(true);
    };

    const handleDeleteItem = async () => {
        if (!deletingItem) return;
        try {
            if (deletingItem.itemType === 'communication') {
                await prospectStore.deleteCommunication(deletingItem.id);
            } else {
                await prospectStore.deleteFollowUp(deletingItem.id);
            }
            setDeletingItem(null);
            fetchCommunications();
        } catch (error) {
            console.error('Failed to delete item', error);
            alert('Failed to delete. Please try again.');
        }
    };

    const getPriorityColor = (priority: CommunicationPriority) => {
        switch (priority) {
            case CommunicationPriority.High: return 'bg-red-100 text-red-700 border-red-300';
            case CommunicationPriority.Medium: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case CommunicationPriority.Low: return 'bg-green-100 text-green-700 border-green-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusColor = (status: FollowUpStatus) => {
        switch (status) {
            case FollowUpStatus.Pending: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case FollowUpStatus.Completed: return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTaskPriorityColor = (dueDate: string, status: FollowUpStatus) => {
        if (status === FollowUpStatus.Completed) return 'border-l-4 border-l-green-500';
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (due < today) return 'border-l-4 border-l-red-500 bg-red-50';
        if (due.getTime() === today.getTime()) return 'border-l-4 border-l-orange-500';
        return 'border-l-4 border-l-brand-primary';
    };

    const getTaskPriorityLabel = (dueDate: string, status: FollowUpStatus) => {
        if (status === FollowUpStatus.Completed) return null;
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (due < today) return <span className="text-xs font-bold text-red-600">Overdue</span>;
        if (due.getTime() === today.getTime()) return <span className="text-xs font-bold text-orange-600">Due Today</span>;
        return null;
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'prospect') return item.itemType === 'followup';
        if (filter === 'general') return item.itemType === 'communication';
        if (filter === 'pending') return item.status === FollowUpStatus.Pending;
        if (filter === 'completed') return item.status === FollowUpStatus.Completed;
        return true;
    });

    // Apply time filter
    const timeFilteredItems = React.useMemo(() => {
        return filterDataByTime(filteredItems, 'dueDate', timeFilter, customDateRange);
    }, [filteredItems, timeFilter, customDateRange]);

    if (loading) {
        return <div className="p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div></div>;
    }

    return (
        <div className="p-4 sm:p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-brand-dark">Communications</h1>
                    <p className="text-sm sm:text-base text-slate-600">Manage all your communications and follow-ups here.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 whitespace-nowrap text-sm sm:text-base"
                >
                    <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">New Communication</span>
                    <span className="sm:hidden ml-2">New</span>
                </button>
            </div>

            {/* Filters */}
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 mb-6">
                <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm min-w-max">
                    {(['all', 'prospect', 'general', 'pending', 'completed'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {f === 'prospect' ? 'Prospect-Related' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time Filter */}
            <div className="mb-6">
                <TimeFilter
                    currentFilter={timeFilter}
                    onFilterChange={(filter, range) => {
                        setTimeFilter(filter);
                        if (range) setCustomDateRange(range);
                    }}
                    customRange={customDateRange}
                />
            </div>

            {/* Communications List */}
            <div className="grid grid-cols-1 gap-4">
                {timeFilteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No communications found matching your filter.</p>
                    </div>
                ) : (
                    timeFilteredItems.map(item => (
                        <div
                            key={item.id}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between transition-all hover:shadow-md ${getTaskPriorityColor(item.dueDate, item.status)}`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    {/* Type Badge */}
                                    {item.itemType === 'communication' ? (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                            Team Communication
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                            Prospect Follow-up
                                        </span>
                                    )}

                                    {/* Priority Badge */}
                                    {item.itemType === 'communication' && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                                            {item.priority.toUpperCase()}
                                        </span>
                                    )}

                                    {/* Status Badge */}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>

                                    {/* Priority Label */}
                                    {getTaskPriorityLabel(item.dueDate, item.status)}
                                </div>

                                {/* Title/Action */}
                                <h3 className="font-semibold text-slate-800 mb-1">
                                    {item.itemType === 'communication' ? item.title : item.notes}
                                </h3>

                                {/* Description (for communications) */}
                                {item.itemType === 'communication' && (
                                    <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                                )}

                                {/* Meta Info */}
                                <div className="text-sm text-slate-500 flex items-center space-x-4">
                                    {item.prospectName && (
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {item.prospectName}
                                        </span>
                                    )}
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Due: {new Date(item.dueDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {item.itemType === 'communication' ? item.assignedTo : item.assignedTo}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                {/* Edit button (only for communications) */}
                                {item.itemType === 'communication' && (
                                    <button
                                        onClick={() => handleEditCommunication(item)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit Communication"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                )}

                                {/* Delete button (for all items) */}
                                <button
                                    onClick={() => setDeletingItem(item)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                {/* Complete button (only for pending items) */}
                                {item.status !== FollowUpStatus.Completed && (
                                    <button
                                        onClick={() => handleStatusUpdate(item, FollowUpStatus.Completed)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                        title="Mark Completed"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Communication Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingCommunication(null);
                }}
                title={editingCommunication ? "Edit Communication" : "New Team Communication"}
            >
                <CommunicationForm
                    onSubmit={handleAddCommunication}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingCommunication(null);
                    }}
                    initialData={editingCommunication || undefined}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                title="Confirm Delete"
            >
                <div className="space-y-4">
                    <p className="text-slate-700">
                        Are you sure you want to delete this {deletingItem?.itemType === 'communication' ? 'communication' : 'follow-up'}?
                    </p>
                    <p className="text-sm text-slate-600 font-semibold">
                        {deletingItem?.itemType === 'communication' ? deletingItem.title : deletingItem?.notes}
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={() => setDeletingItem(null)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteItem}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CommunicationsView;
