import React from 'react';
import FormField from '../shared/FormField';

interface TranslationFieldsProps {
    sourceLanguage: string;
    targetLanguage: string;
    onSourceLanguageChange: (value: string) => void;
    onTargetLanguageChange: (value: string) => void;
}

const TranslationFields: React.FC<TranslationFieldsProps> = ({
    sourceLanguage,
    targetLanguage,
    onSourceLanguageChange,
    onTargetLanguageChange,
}) => {
    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-md font-semibold text-brand-secondary mb-3">
                Doc Translation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    label="Source Language"
                    name="translationSourceLanguage"
                    value={sourceLanguage}
                    onChange={(e) => onSourceLanguageChange(e.target.value)}
                    placeholder="Type or select a language"
                    list="languages-list"
                />
                <FormField
                    label="Target Language"
                    name="translationTargetLanguage"
                    value={targetLanguage}
                    onChange={(e) => onTargetLanguageChange(e.target.value)}
                    placeholder="Type or select a language"
                    list="languages-list"
                />
            </div>
        </div>
    );
};

export default TranslationFields;
