import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'tel' | 'date' | 'number';
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    helpText?: string;
    className?: string;
    list?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    error,
    helpText,
    className = '',
    list,
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
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                list={list}
                className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
                    }`}
            />
            {error && (
                <p className="form-error text-sm text-red-600 mt-1">{error}</p>
            )}
            {helpText && !error && (
                <p className="form-help text-xs text-slate-500 mt-1">{helpText}</p>
            )}
        </div>
    );
};

export default FormField;
