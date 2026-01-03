import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfISOWeek, endOfISOWeek } from 'date-fns';
import { ClassScheduleEvent, ClassStatus } from '../../types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { enUS } from 'date-fns/locale';

const locales = {
    'en-US': enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Custom event component - compact display for timetable
const EventComponent = ({ event }: { event: any }) => {
    // Get language initial (first letter)
    const langInitial = event.language?.charAt(0) || '';
    // Compact format: "G A2.1 R201" instead of "German A2.1 Room 201"
    const compactText = `${langInitial} ${event.level}${event.roomNumber ? ' R' + event.roomNumber.replace(/room\s*/i, '') : ''}`;

    return (
        <div className="p-1 leading-none">
            <div className="font-bold text-xs truncate">{compactText}</div>
        </div>
    );
};

// Calendar custom styles for better spacing
const calendarStyles = `
    .rbc-event {
        padding: 4px 6px !important;
        font-size: 0.75rem !important;
        line-height: 1.2 !important;
        overflow: visible !important;
    }
    .rbc-event-content {
        white-space: normal !important;
        overflow: visible !important;
    }
    .rbc-time-slot {
        min-height: 45px !important;
    }
    .rbc-events-container {
        margin-right: 2px;
    }
    .rbc-day-slot .rbc-event {
        border: 1px solid rgba(0,0,0,0.1);
    }
`;

interface ClassScheduleProps {
    onNavigate?: (view: 'classes') => void;
}

const languageColors: Record<string, string> = {
    French: '#3b82f6',
    German: '#ef4444',
    Chinese: '#f59e0b',
    English: '#10b981',
    Spanish: '#8b5cf6',
    Arabic: '#06b6d4',
};

const statusConfig: Record<ClassStatus, { color: string; icon: string; label: string }> = {
    [ClassStatus.Scheduled]: { color: '#3b82f6', icon: '📅', label: 'Scheduled' },
    [ClassStatus.InProgress]: { color: '#10b981', icon: '🔴', label: 'In Progress' },
    [ClassStatus.Completed]: { color: '#6b7280', icon: '✅', label: 'Completed' },
    [ClassStatus.Cancelled]: { color: '#ef4444', icon: '❌', label: 'Cancelled' },
};

const ClassSchedule: React.FC<ClassScheduleProps> = ({ onNavigate }) => {
    const [view, setView] = useState<View>('week');
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<ClassScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLegend, setShowLegend] = useState(true);

    const fetchClasses = useCallback(async () => {
        setIsLoading(true);
        try {
            // Calculate date range based on view
            let startDate, endDate;

            if (view === 'month') {
                startDate = startOfMonth(date);
                endDate = endOfMonth(date);
            } else if (view === 'week') {
                startDate = startOfISOWeek(date);
                endDate = endOfISOWeek(date);
            } else {
                startDate = startOfDay(date);
                endDate = endOfDay(date);
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(
                `/api/class-schedules?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();

            // Convert string dates to Date objects
            const formattedEvents = data.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch class schedules:', error);
        } finally {
            setIsLoading(false);
        }
    }, [date, view]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Determine event status based on time
    const getEventStatus = useCallback((event: ClassScheduleEvent): ClassStatus => {
        if (event.status === ClassStatus.Cancelled) return ClassStatus.Cancelled;

        const now = new Date();
        if (event.end < now) return ClassStatus.Completed;
        if (event.start <= now && event.end >= now) return ClassStatus.InProgress;
        return ClassStatus.Scheduled;
    }, []);

    // Style events based on status and language
    const eventStyleGetter = useCallback((event: ClassScheduleEvent) => {
        const status = getEventStatus(event);
        const config = statusConfig[status];
        const langColor = languageColors[event.language] || '#64748b';

        let style: any = {
            backgroundColor: status === ClassStatus.Completed ? '#e2e8f0' : langColor + '15',
            borderLeft: `4px solid ${langColor}`,
            color: status === ClassStatus.Completed ? '#94a3b8' : '#1e293b',
            borderRadius: '4px',
            opacity: status === ClassStatus.Cancelled ? 0.5 : 1,
            textDecoration: status === ClassStatus.Cancelled ? 'line-through' : 'none',
            padding: '2px 5px',
        };

        if (status === ClassStatus.InProgress) {
            style.border = `2px solid ${config.color}`;
            style.boxShadow = `0 0 0 2px ${config.color}33`;
        }

        return { style };
    }, [getEventStatus]);

    const formats = useMemo(() => ({
        timeGutterFormat: 'HH:mm',
        eventTimeRangeFormat: ({ start, end }: any) => {
            return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
        },
        agendaTimeRangeFormat: ({ start, end }: any) => {
            return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
        },
    }), []);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Class Schedule</h2>
                    <p className="text-sm text-slate-600">Manage your class timetable</p>
                </div>

                <div className="flex gap-2">
                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        {(['month', 'week', 'day'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === v
                                    ? 'bg-white text-brand-primary shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Legend Toggle */}
                    <button
                        onClick={() => setShowLegend(!showLegend)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md"
                    >
                        {showLegend ? 'Hide' : 'Show'} Legend
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
                <div className="flex-1 min-h-0">
                    <style>{calendarStyles}</style>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        eventPropGetter={eventStyleGetter}
                        views={['month', 'week', 'day']}
                        step={30}
                        showMultiDayTimes
                        formats={formats}
                        popup
                        min={new Date(2026, 0, 1, 7, 0, 0)}
                        max={new Date(2026, 0, 1, 22, 0, 0)}
                        components={{
                            event: EventComponent
                        }}
                    />
                </div>

                {/* Legend */}
                {showLegend && (
                    <div className="w-64 bg-slate-50 rounded-lg p-4 overflow-y-auto">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm">Class Status</h3>

                        {Object.entries(statusConfig).map(([key, config]) => (
                            <div key={key} className="flex items-center gap-2 mb-2">
                                <span className="text-base">{config.icon}</span>
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: config.color }}
                                />
                                <span className="text-xs text-slate-700">{config.label}</span>
                            </div>
                        ))}

                        <hr className="my-3 border-slate-200" />

                        <h3 className="font-bold text-slate-800 mb-3 text-sm">Languages</h3>

                        {Object.entries(languageColors).map(([lang, color]) => (
                            <div key={lang} className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-xs text-slate-700">{lang}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassSchedule;
