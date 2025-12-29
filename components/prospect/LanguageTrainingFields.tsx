import React from 'react';
import { commonEuropeanLanguages } from '../../types';

interface LanguageTrainingFieldsProps {
    trainingLanguages: string[];
    otherTrainingLanguages: string;
    onLanguagesChange: (languages: string[]) => void;
    onOtherLanguagesChange: (value: string) => void;
}

const LanguageTrainingFields: React.FC<LanguageTrainingFieldsProps> = ({
    trainingLanguages,
    otherTrainingLanguages,
    onLanguagesChange,
    onOtherLanguagesChange,
}) => {
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguages = Array.from(
            e.target.selectedOptions,
            (option: HTMLOptionElement) => option.value
        );
        onLanguagesChange(selectedLanguages);
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-md font-semibold text-brand-secondary mb-3">
                Language Training Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="trainingLanguages"
                        className="block text-sm font-medium text-slate-600 mb-1"
                    >
                        Languages
                    </label>
                    <select
                        id="trainingLanguages"
                        name="trainingLanguages"
                        multiple
                        value={trainingLanguages}
                        onChange={handleMultiSelectChange}
                        className="w-full h-32 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white"
                    >
                        {commonEuropeanLanguages.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label
                        htmlFor="otherTrainingLanguages"
                        className="block text-sm font-medium text-slate-600 mb-1"
                    >
                        Other Language(s)
                    </label>
                    <input
                        type="text"
                        id="otherTrainingLanguages"
                        name="otherTrainingLanguages"
                        placeholder="e.g., Japanese, Arabic"
                        value={otherTrainingLanguages}
                        onChange={(e) => onOtherLanguagesChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Combine with selections above. Separate with commas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LanguageTrainingFields;
