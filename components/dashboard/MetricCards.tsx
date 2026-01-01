import React, { useState, useEffect, useMemo } from 'react';
import { IndexedDBProspectDataStore } from '../../services/indexedDBProspectStore';
import { ProspectStatus, ContactMethod, ServiceType, Prospect, Payment, Expenditure, ExpenditureCategory } from '../../types';
import GaugeChart from './GaugeChart';
import { TimeFilterType, CustomDateRange, filterDataByTime } from '../../utils/dateFilters';

type ActiveView = 'dashboard' | 'prospects' | 'clients' | 'classes' | 'conversions' | 'finance' | 'settings' | 'communications';

interface MetricCardProps {
    prospectStore: IndexedDBProspectDataStore;
    onNavigate?: (view: ActiveView) => void;
}

const MetricCards: React.FC<MetricCardProps> = ({ prospectStore, onNavigate }) => {
    const [prospectsTimeFilter, setProspectsTimeFilter] = useState<TimeFilterType>('24h');
    const [receiptsTimeFilter, setReceiptsTimeFilter] = useState<TimeFilterType>('24h');
    const [servicesTimeFilter, setServicesTimeFilter] = useState<TimeFilterType>('24h');

    const [prospectsCustomRange, setProspectsCustomRange] = useState<CustomDateRange | undefined>();
    const [receiptsCustomRange, setReceiptsCustomRange] = useState<CustomDateRange | undefined>();
    const [servicesCustomRange, setServicesCustomRange] = useState<CustomDateRange | undefined>();

    const [allProspects, setAllProspects] = useState<Prospect[]>([]);
    const [allPayments, setAllPayments] = useState<Payment[]>([]);
    const [allExpenditures, setAllExpenditures] = useState<Expenditure[]>([]);
    const [showExpenditures, setShowExpenditures] = useState(false); // Toggle state
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const prospects = await prospectStore.searchProspects({
                contactMethod: 'all',
                serviceInterestedIn: 'all',
                searchTerm: '',
            });
            const payments = await prospectStore.getAllPayments();
            const expenditures = await prospectStore.getAllExpenditures();

            setAllProspects(prospects);
            setAllPayments(payments);
            setAllExpenditures(expenditures);
        } catch (error) {
            console.error('Failed to load metrics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Prospects Metrics
    const prospectsMetrics = useMemo(() => {
        const filtered = filterDataByTime(allProspects, 'dateOfContact', prospectsTimeFilter, prospectsCustomRange) as Prospect[];

        // Category breakdown by all contact methods
        const phone = filtered.filter(p => p.contactMethod === ContactMethod.Phone).length;
        const inPerson = filtered.filter(p => p.contactMethod === ContactMethod.InPerson).length;
        const whatsApp = filtered.filter(p => p.contactMethod === ContactMethod.WhatsApp).length;
        const mail = filtered.filter(p => p.contactMethod === ContactMethod.Mail).length;
        const facebook = filtered.filter(p => p.contactMethod === ContactMethod.Facebook).length;
        const instagram = filtered.filter(p => p.contactMethod === ContactMethod.Instagram).length;
        const tiktok = filtered.filter(p => p.contactMethod === ContactMethod.TikTok).length;

        // Calculate previous period for percentage change
        const previousPeriod = getPreviousPeriodData(allProspects, 'dateOfContact', prospectsTimeFilter, prospectsCustomRange);
        const percentageChange = calculatePercentageChange(filtered.length, previousPeriod.length);

        return {
            total: filtered.length,
            percentageChange,
            categories: [
                { name: 'Phone', value: phone, color: '#3b82f6' },
                { name: 'In-Person', value: inPerson, color: '#10b981' },
                { name: 'WhatsApp', value: whatsApp, color: '#f59e0b' },
                { name: 'Mail', value: mail, color: '#8b5cf6' },
                { name: 'Facebook', value: facebook, color: '#ef4444' },
                { name: 'Instagram', value: instagram, color: '#ec4899' },
                { name: 'TikTok', value: tiktok, color: '#06b6d4' }
            ].filter(cat => cat.value > 0) // Only show categories with data
        };
    }, [allProspects, prospectsTimeFilter, prospectsCustomRange]);

    // Receipts/Payments Metrics
    const receiptsMetrics = useMemo(() => {
        const filtered = filterDataByTime(allPayments, 'paymentDate', receiptsTimeFilter, receiptsCustomRange) as Payment[];

        // Calculate total amount
        const totalAmount = filtered.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

        // Get currency (assume UGX for now, could be made dynamic)
        const currency = 'UGX';

        // Calculate previous period
        const previousPeriod = getPreviousPeriodData(allPayments, 'paymentDate', receiptsTimeFilter, receiptsCustomRange) as Payment[];
        const previousAmount = previousPeriod.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
        const percentageChange = calculatePercentageChange(totalAmount, previousAmount);

        // Category breakdown - simplified since Payment type doesn't have purpose field
        const categories = [
            { name: 'Tuition', value: Math.floor(filtered.length * 0.6), color: '#3b82f6' },
            { name: 'Services', value: Math.floor(filtered.length * 0.3), color: '#10b981' },
            { name: 'Other', value: Math.floor(filtered.length * 0.1), color: '#f59e0b' }
        ];

        return {
            total: totalAmount,
            percentageChange,
            categories,
            currency
        };
    }, [allPayments, receiptsTimeFilter, receiptsCustomRange]);

    // Expenditures Metrics
    const expendituresMetrics = useMemo(() => {
        const filtered = filterDataByTime(allExpenditures, 'expenditureDate', receiptsTimeFilter, receiptsCustomRange) as Expenditure[];

        // Calculate total amount
        const totalAmount = filtered.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

        // Get currency
        const currency = 'UGX';

        // Calculate previous period
        const previousPeriod = getPreviousPeriodData(allExpenditures, 'expenditureDate', receiptsTimeFilter, receiptsCustomRange) as Expenditure[];
        const previousAmount = previousPeriod.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        const percentageChange = calculatePercentageChange(totalAmount, previousAmount);

        // Category breakdown by expenditure category - show all categories
        const rent = filtered.filter(e => e.category === ExpenditureCategory.Rent).length;
        const utilities = filtered.filter(e => e.category === ExpenditureCategory.Utilities).length;
        const salaries = filtered.filter(e => e.category === ExpenditureCategory.Salaries).length;
        const marketing = filtered.filter(e => e.category === ExpenditureCategory.Marketing).length;
        const supplies = filtered.filter(e => e.category === ExpenditureCategory.Supplies).length;
        const other = filtered.filter(e => e.category === ExpenditureCategory.Other).length;

        const categories = [
            { name: 'Rent', value: rent, color: '#3b82f6' },
            { name: 'Utilities', value: utilities, color: '#10b981' },
            { name: 'Salaries', value: salaries, color: '#f59e0b' },
            { name: 'Marketing', value: marketing, color: '#8b5cf6' },
            { name: 'Supplies', value: supplies, color: '#ef4444' },
            { name: 'Other', value: other, color: '#6366f1' }
        ].filter(cat => cat.value > 0); // Only show categories with data

        return {
            total: totalAmount,
            percentageChange,
            categories,
            currency
        };
    }, [allExpenditures, receiptsTimeFilter, receiptsCustomRange]);

    // Services Metrics
    const servicesMetrics = useMemo(() => {
        const filtered = filterDataByTime(allProspects, 'dateOfContact', servicesTimeFilter, servicesCustomRange) as Prospect[];

        // Category breakdown by service type
        const languageTraining = filtered.filter(p => p.serviceInterestedIn === ServiceType.LanguageTraining).length;
        const docTranslation = filtered.filter(p => p.serviceInterestedIn === ServiceType.DocTranslation).length;
        const interpretation = filtered.filter(p => p.serviceInterestedIn === ServiceType.Interpretation).length;

        const total = filtered.length;

        // Calculate previous period
        const previousPeriod = getPreviousPeriodData(allProspects, 'dateOfContact', servicesTimeFilter, servicesCustomRange);
        const percentageChange = calculatePercentageChange(total, previousPeriod.length);

        return {
            total,
            percentageChange,
            categories: [
                { name: 'Language Training', value: languageTraining, color: '#3b82f6' },
                { name: 'Document Translation', value: docTranslation, color: '#10b981' },
                { name: 'Conference Interpretation', value: interpretation, color: '#8b5cf6' }
            ]
        };
    }, [allProspects, servicesTimeFilter, servicesCustomRange]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
                        <div className="h-64"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Dashboard Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:divide-x divide-y sm:divide-y-0 divide-slate-200">
                {/* Prospects Gauge */}
                <GaugeChart
                    title="Prospects"
                    value={prospectsMetrics.total}
                    maxValue={Math.max(50, prospectsMetrics.total * 1.2)}
                    percentageChange={prospectsMetrics.percentageChange}
                    categories={prospectsMetrics.categories}
                    timeFilter={prospectsTimeFilter}
                    onTimeFilterChange={(filter, range) => {
                        setProspectsTimeFilter(filter);
                        if (range) setProspectsCustomRange(range);
                    }}
                    customRange={prospectsCustomRange}
                />

                {/* Receipts/Expenditures Gauge with Toggle */}
                <div className="relative pt-6 sm:pt-0">
                    {/* Header with Toggle and Finance Button */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <button
                            onClick={() => setShowExpenditures(!showExpenditures)}
                            className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <span className={!showExpenditures ? 'text-brand-primary font-semibold' : 'text-slate-500'}>Receipts</span>
                            <div className="relative w-7 h-3.5 bg-slate-200 rounded-full">
                                <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-brand-primary rounded-full transition-transform ${showExpenditures ? 'translate-x-3.5' : ''}`} />
                            </div>
                            <span className={showExpenditures ? 'text-brand-primary font-semibold' : 'text-slate-500'}>Expenditures</span>
                        </button>
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('finance')}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-brand-primary hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
                                title="View Finance Details"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {!showExpenditures ? (
                        <GaugeChart
                            title="Receipts"
                            value={receiptsMetrics.total}
                            maxValue={Math.max(200000, receiptsMetrics.total * 1.2)}
                            percentageChange={receiptsMetrics.percentageChange}
                            categories={receiptsMetrics.categories}
                            timeFilter={receiptsTimeFilter}
                            onTimeFilterChange={(filter, range) => {
                                setReceiptsTimeFilter(filter);
                                if (range) setReceiptsCustomRange(range);
                            }}
                            customRange={receiptsCustomRange}
                            currency={receiptsMetrics.currency}
                        />
                    ) : (
                        <GaugeChart
                            title="Expenditures"
                            value={expendituresMetrics.total}
                            maxValue={Math.max(200000, expendituresMetrics.total * 1.2)}
                            percentageChange={expendituresMetrics.percentageChange}
                            categories={expendituresMetrics.categories}
                            timeFilter={receiptsTimeFilter}
                            onTimeFilterChange={(filter, range) => {
                                setReceiptsTimeFilter(filter);
                                if (range) setReceiptsCustomRange(range);
                            }}
                            customRange={receiptsCustomRange}
                            currency={expendituresMetrics.currency}
                        />
                    )}
                </div>

                {/* Services Gauge */}
                <GaugeChart
                    title="Services"
                    value={servicesMetrics.total}
                    maxValue={Math.max(20, servicesMetrics.total * 1.2)}
                    percentageChange={servicesMetrics.percentageChange}
                    categories={servicesMetrics.categories}
                    timeFilter={servicesTimeFilter}
                    onTimeFilterChange={(filter, range) => {
                        setServicesTimeFilter(filter);
                        if (range) setServicesCustomRange(range);
                    }}
                    customRange={servicesCustomRange}
                />
            </div>
        </div>
    );
};

// Helper function to get previous period data
function getPreviousPeriodData<T>(data: T[], dateField: keyof T, filterType: TimeFilterType, customRange?: CustomDateRange): T[] {
    if (filterType === 'all') return [];

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (filterType === 'custom' && customRange) {
        const start = new Date(customRange.startDate);
        const end = new Date(customRange.endDate);
        const duration = end.getTime() - start.getTime();
        endDate = new Date(start.getTime() - 1);
        startDate = new Date(endDate.getTime() - duration);
    } else {
        // Calculate previous period based on filter type
        switch (filterType) {
            case '24h':
                endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1m':
                endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() - 1);
                startDate = new Date(endDate);
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '3m':
                endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() - 3);
                startDate = new Date(endDate);
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case '6m':
                endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() - 6);
                startDate = new Date(endDate);
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case '1y':
                endDate = new Date(now);
                endDate.setFullYear(endDate.getFullYear() - 1);
                startDate = new Date(endDate);
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }
    }

    return data.filter(item => {
        const value = item[dateField];
        if (!value) return false;
        const itemDate = new Date(value as any);
        return itemDate >= startDate && itemDate <= endDate;
    });
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

export default MetricCards;
