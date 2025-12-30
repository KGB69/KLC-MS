import React, { useState } from 'react';
import { ApiProspectDataStore } from '../../services/apiProspectStore';
import MetricCards from './MetricCards';
import ActivityFeed from './ActivityFeed';
import UpcomingSchedule from './UpcomingSchedule';
import DashboardCharts from './DashboardCharts';
import TasksWidget from './TasksWidget';

type ActiveView = 'dashboard' | 'prospects' | 'clients' | 'classes' | 'conversions' | 'finance' | 'settings' | 'communications';

interface DashboardViewProps {
    prospectStore: ApiProspectDataStore;
    onNavigate: (view: ActiveView) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ prospectStore, onNavigate }) => {
    const [isFabOpen, setIsFabOpen] = useState(false);

    const handleNavigate = (view: ActiveView) => {
        setIsFabOpen(false);
        onNavigate(view);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-dark">Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome to your CRM dashboard</p>
            </div>

            {/* Gauge Charts Row */}
            <MetricCards prospectStore={prospectStore} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Communications Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            Communications
                        </h2>
                        <div className="h-96">
                            <TasksWidget prospectStore={prospectStore} onViewAll={() => onNavigate('communications')} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <ActivityFeed prospectStore={prospectStore} />
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-50">
                {/* FAB Menu Items */}
                {isFabOpen && (
                    <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
                        <button
                            className="flex items-center space-x-3 bg-white hover:bg-brand-primary hover:text-white text-brand-dark px-4 py-3 rounded-full shadow-lg transition-all duration-200 group"
                            onClick={() => handleNavigate('prospects')}
                        >
                            <svg className="w-5 h-5 text-brand-primary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="font-medium whitespace-nowrap">Add Prospect</span>
                        </button>
                        <button
                            className="flex items-center space-x-3 bg-white hover:bg-brand-secondary hover:text-white text-brand-dark px-4 py-3 rounded-full shadow-lg transition-all duration-200 group"
                            onClick={() => handleNavigate('clients')}
                        >
                            <svg className="w-5 h-5 text-brand-secondary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span className="font-medium whitespace-nowrap">Register Student</span>
                        </button>
                        <button
                            className="flex items-center space-x-3 bg-white hover:bg-purple-600 hover:text-white text-brand-dark px-4 py-3 rounded-full shadow-lg transition-all duration-200 group"
                            onClick={() => handleNavigate('classes')}
                        >
                            <svg className="w-5 h-5 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="font-medium whitespace-nowrap">Create Class</span>
                        </button>
                    </div>
                )}

                {/* Main FAB Button */}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isFabOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-45'
                        : 'bg-brand-primary hover:bg-sky-700'
                        } `}
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DashboardView;
