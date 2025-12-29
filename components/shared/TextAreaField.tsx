import React from 'react';

interface TextAreaFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    placeholder?: string;
    required?: boolean;
    error?: string;
    helpText?: string;
    className?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
    label,
    name,
    value,
    onChange,
    rows = 4,
    placeholder,
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
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                required={required}
                className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary resize-vertical transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
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

export default TextAreaField;
