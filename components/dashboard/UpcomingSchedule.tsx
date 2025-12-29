import React, { useState, useEffect } from 'react';
import { IndexedDBProspectDataStore } from '../../services/indexedDBProspectStore';
import { Class, DayOfWeek } from '../../types';

interface UpcomingScheduleProps {
    prospectStore: IndexedDBProspectDataStore;
}

interface ScheduleItem {
    id: string;
    title: string;
    day: string;
    time: string;
    color: string;
}

const UpcomingSchedule: React.FC<UpcomingScheduleProps> = ({ prospectStore }) => {
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSchedule();
    }, []);

    const getDayName = (day: DayOfWeek): string => {
        const dayMap: Record<DayOfWeek, string> = {
            [DayOfWeek.Monday]: 'Mon',
            [DayOfWeek.Tuesday]: 'Tue',
            [DayOfWeek.Wednesday]: 'Wed',
            [DayOfWeek.Thursday]: 'Thu',
            [DayOfWeek.Friday]: 'Fri',
            [DayOfWeek.Saturday]: 'Sat',
            [DayOfWeek.Sunday]: 'Sun',
        };
        return dayMap[day] || day;
    };

    const getColorForClass = (index: number): string => {
        const colors = [
            'bg-blue-100 text-blue-700 border-blue-200',
            'bg-green-100 text-green-700 border-green-200',
            'bg-purple-100 text-purple-700 border-purple-200',
            'bg-orange-100 text-orange-700 border-orange-200',
            'bg-pink-100 text-pink-700 border-pink-200',
        ];
        return colors[index % colors.length];
    };

    const loadSchedule = async () => {
        try {
            const classes = await prospectStore.getClasses();

            const items: ScheduleItem[] = [];

            classes.forEach((cls: Class, index: number) => {
                cls.schedule.forEach((sched) => {
                    items.push({
                        id: `${cls.classId}-${sched.dayOfWeek}`,
                        title: cls.name,
                        day: getDayName(sched.dayOfWeek),
                        time: `${sched.startTime} - ${sched.endTime}`,
                        color: getColorForClass(index),
                    });
                });
            });

            // Sort by day of week
            const dayOrder: Record<string, number> = {
                'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7
            };
            items.sort((a, b) => (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0));

            setScheduleItems(items);
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Class Schedule</h2>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Class Schedule</h2>
            {scheduleItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                    No classes scheduled
                </p>
            ) : (
                <div className="space-y-2">
                    {scheduleItems.map((item) => (
                        <div
                            key={item.id}
                            className={`p-3 rounded-lg border ${item.color} flex items-center justify-between`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="text-center">
                                    <div className="text-xs font-semibold uppercase">{item.day}</div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="text-xs opacity-75">{item.time}</p>
                                </div>
                            </div>
                            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingSchedule;
