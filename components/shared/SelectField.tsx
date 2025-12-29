import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
    required?: boolean;
    error?: string;
    helpText?: string;
    className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
    error,
    helpText,
    className = '',
}) => {
    return (
        <div className={`form-group ${className}`}>
            <label
                htmlFor={name}
                className={`block text-sm font-medium text-slate-600 mb-1 ${required ? 'form-label-required' : ''}`}
            >
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
                    }`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="form-error text-sm text-red-600 mt-1">{error}</p>
            )}
            {helpText && !error && (
                <p className="form-help text-xs text-slate-500 mt-1">{helpText}</p>
            )}
        </div>
    );
};

export default SelectField;
