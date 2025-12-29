import React, { useState } from 'react';
import { SearchCriteria, ServiceType, ContactMethod } from '../types';
import TimeFilter from './shared/TimeFilter';
import { TimeFilterType, CustomDateRange } from '../utils/dateFilters';

interface FilterControlsProps {
  filters: SearchCriteria;
  onFilterChange: (newFilters: Partial<SearchCriteria>) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange }) => {
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

  // FIX: Corrected a typo in `HTMLSelectElement`. The malformed type `HTMLSelectE lement` was causing cascading type errors.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleTimeFilterChange = (filter: TimeFilterType, range?: CustomDateRange) => {
    onFilterChange({ timeFilter: filter });
    if (range) {
      setCustomDateRange(range);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-slate-600 mb-1">Search by Name/Notes</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleInputChange}
              placeholder="e.g. Alice or 'conference'"
              className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contactMethod" className="block text-sm font-medium text-slate-600 mb-1">Contact Method</label>
          <select
            id="contactMethod"
            name="contactMethod"
            value={filters.contactMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white"
          >
            <option value="all">All Methods</option>
            {Object.values(ContactMethod).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="serviceInterestedIn" className="block text-sm font-medium text-slate-600 mb-1">Service</label>
          <select
            id="serviceInterestedIn"
            name="serviceInterestedIn"
            value={filters.serviceInterestedIn}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white"
          >
            <option value="all">All Services</option>
            {Object.values(ServiceType).map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Enhanced Time Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Time Period</label>
        <TimeFilter
          currentFilter={(filters.timeFilter as TimeFilterType) || 'all'}
          onFilterChange={handleTimeFilterChange}
          customRange={customDateRange}
        />
      </div>
    </div>
  );
};

export default FilterControls;