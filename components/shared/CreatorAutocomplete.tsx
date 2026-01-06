import React, { useState, useEffect, useRef } from 'react';

interface CreatorAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

interface CreatorName {
    name: string;
    usageCount: number;
}

const CreatorAutocomplete: React.FC<CreatorAutocompleteProps> = ({
    value,
    onChange,
    label = "Created By",
    placeholder = "Enter name...",
    required = false,
    disabled = false
}) => {
    const [suggestions, setSuggestions] = useState<CreatorName[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<CreatorName[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch creator names from API
    useEffect(() => {
        const fetchCreatorNames = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/creator-names', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.names || []);
                }
            } catch (error) {
                console.error('Failed to fetch creator names:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCreatorNames();
    }, []);

    // Filter suggestions based on input
    useEffect(() => {
        if (value.trim() === '') {
            setFilteredSuggestions(suggestions.slice(0, 10)); // Show top 10 when empty
        } else {
            const filtered = suggestions.filter(s =>
                s.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 10);
            setFilteredSuggestions(filtered);
        }
        setSelectedIndex(-1);
    }, [value, suggestions]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) {
            if (e.key === 'ArrowDown') {
                setShowDropdown(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
                    onChange(filteredSuggestions[selectedIndex].name);
                    setShowDropdown(false);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSelect = (name: string) => {
        onChange(name);
        setShowDropdown(false);
    };

    const handleFocus = () => {
        setShowDropdown(true);
    };

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed"
                    autoComplete="off"
                />

                {/* Dropdown icon */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown suggestions */}
            {showDropdown && !disabled && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-slate-500 text-center">
                            Loading...
                        </div>
                    ) : filteredSuggestions.length > 0 ? (
                        <ul className="py-1">
                            {filteredSuggestions.map((suggestion, index) => (
                                <li
                                    key={suggestion.name}
                                    onClick={() => handleSelect(suggestion.name)}
                                    className={`px-3 py-2 cursor-pointer text-sm transition-colors ${index === selectedIndex
                                            ? 'bg-brand-primary text-white'
                                            : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{suggestion.name}</span>
                                        <span className={`text-xs ${index === selectedIndex ? 'text-white opacity-75' : 'text-slate-400'
                                            }`}>
                                            {suggestion.usageCount} {suggestion.usageCount === 1 ? 'use' : 'uses'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-3 py-2 text-sm text-slate-500 text-center">
                            {value.trim() ? 'No matching names found' : 'Start typing or select from suggestions'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreatorAutocomplete;
