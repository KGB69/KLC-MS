import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Prospect, Class, ServiceType, ProspectDataStore, ClassDataStore } from '../../types';

interface DashboardChartsProps {
    prospectStore: ProspectDataStore & ClassDataStore;
    selectedTab: 'prospects' | 'students' | 'classes';
}

interface ChartData {
    statusData: { name: string; value: number; color: string }[];
    serviceData: { name: string; value: number }[];
    classData: { name: string; students: number }[];
}

const COLORS = ['#0ea5e9', '#10b981', '#ef4444', '#f59e0b']; // Sky, Emerald, Red, Amber

const DashboardCharts: React.FC<DashboardChartsProps> = ({ prospectStore, selectedTab }) => {
    const [data, setData] = useState<ChartData>({ statusData: [], serviceData: [], classData: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allProspects = await prospectStore.searchProspects({
                contactMethod: 'all', serviceInterestedIn: 'all', searchTerm: '',
            });
            const allClasses = await prospectStore.getClasses();

            // 1. Status Distribution
            const statusCounts = allProspects.reduce((acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const statusData = Object.keys(statusCounts).map((status, index) => ({
                name: status,
                value: statusCounts[status],
                color: COLORS[index % COLORS.length]
            }));

            // 2. Service Breakdown
            const serviceCounts = allProspects.reduce((acc, p) => {
                acc[p.serviceInterestedIn] = (acc[p.serviceInterestedIn] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const serviceData = Object.values(ServiceType).map(service => ({
                name: service,
                value: serviceCounts[service] || 0
            }));

            // 3. Class Enrollment
            const classData = allClasses.map(c => ({
                name: c.name,
                students: c.studentIds.length
            })).sort((a, b) => b.students - a.students).slice(0, 5); // Top 5 classes

            setData({ statusData, serviceData, classData });
        } catch (error) {
            console.error("Failed to load chart data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-64 bg-slate-100 rounded-xl"></div>;
    }

    // Render nothing if 'classes' tab is selected (handled by UpcomingSchedule in parent)
    if (selectedTab === 'classes') {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Prospect Charts */}
            {selectedTab === 'prospects' && (
                <>
                    {/* Pipeline Health */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Pipeline Health</h3>
                        <div className="h-64 min-h-[256px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Service Popularity */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Service Popularity</h3>
                        <div className="h-64 min-h-[256px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.serviceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* Student Charts */}
            {selectedTab === 'students' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h3 className="text-lg font-bold text-brand-dark mb-4">Top Classes by Enrollment</h3>
                    {data.classData.length > 0 ? (
                        <div className="h-64 min-h-[256px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.classData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="students" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                            No class data available.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardCharts;
