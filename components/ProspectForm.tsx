import React, { useState, useEffect } from 'react';
import { ProspectFormData, ServiceType, ContactMethod, Prospect, commonEuropeanLanguages } from '../types';
import FormField from './shared/FormField';
import SelectField from './shared/SelectField';
import TextAreaField from './shared/TextAreaField';
import LanguageTrainingFields from './prospect/LanguageTrainingFields';
import TranslationFields from './prospect/TranslationFields';
import InterpretationFields from './prospect/InterpretationFields';
import { useFormValidation } from '../hooks/useFormValidation';
import { prospectFormSchema } from '../validation/prospectSchema';
import { formatDateForInput, getTodayDate } from '../utils/dateUtils';

interface ProspectFormProps {
    onSubmit: (prospect: ProspectFormData) => void;
    initialData?: Prospect | ProspectFormData;
    onCancel?: () => void;
    submitButtonText?: string;
    isEditing?: boolean;
}

const ProspectForm: React.FC<ProspectFormProps> = ({ onSubmit, initialData, onCancel, submitButtonText, isEditing = false }) => {
    const initialFormState: ProspectFormData = {
        prospectName: '',
        email: '',
        phone: '',
        contactMethod: ContactMethod.Phone,
        dateOfContact: getTodayDate(),
        notes: '',
        serviceInterestedIn: ServiceType.LanguageTraining,
        trainingLanguages: [],
        translationSourceLanguage: '',
        translationTargetLanguage: '',
        interpretationSourceLanguage: '',
        interpretationTargetLanguage: '',
    };

    const [formData, setFormData] = useState<ProspectFormData>(initialFormState);
    const [otherTrainingLanguages, setOtherTrainingLanguages] = useState('');
    const { errors, validateForm, clearErrors } = useFormValidation(prospectFormSchema);

    useEffect(() => {
        if (initialData) {
            const {
                prospectName, email, phone, contactMethod, dateOfContact, notes, serviceInterestedIn,
                trainingLanguages, translationSourceLanguage, translationTargetLanguage,
                interpretationSourceLanguage, interpretationTargetLanguage
            } = initialData;

            const baseFormData: ProspectFormData = {
                prospectName,
                email: email || '',
                phone: phone || '',
                contactMethod,
                dateOfContact: formatDateForInput(dateOfContact),
                notes,
                serviceInterestedIn,
                trainingLanguages: [],
                translationSourceLanguage: translationSourceLanguage || '',
                translationTargetLanguage: translationTargetLanguage || '',
                interpretationSourceLanguage: interpretationSourceLanguage || '',
                interpretationTargetLanguage: interpretationTargetLanguage || '',
            };

            if (serviceInterestedIn === ServiceType.LanguageTraining && trainingLanguages) {
                const knownLanguages = trainingLanguages.filter(lang => commonEuropeanLanguages.includes(lang));
                const otherLangs = trainingLanguages.filter(lang => !commonEuropeanLanguages.includes(lang));
                baseFormData.trainingLanguages = knownLanguages;
                setOtherTrainingLanguages(otherLangs.join(', '));
            } else {
                baseFormData.trainingLanguages = trainingLanguages || [];
                setOtherTrainingLanguages('');
            }

            setFormData(baseFormData);
        } else {
            setFormData(initialFormState);
            setOtherTrainingLanguages('');
        }
    }, [initialData]);

    useEffect(() => {
        if (isEditing) return;
        setFormData(prev => ({
            ...prev,
            trainingLanguages: [],
            translationSourceLanguage: '',
            translationTargetLanguage: '',
            interpretationSourceLanguage: '',
            interpretationTargetLanguage: '',
        }));
        setOtherTrainingLanguages('');
    }, [formData.serviceInterestedIn, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const submissionData: ProspectFormData = {
            prospectName: formData.prospectName,
            email: formData.email,
            phone: formData.phone,
            contactMethod: formData.contactMethod,
            dateOfContact: formData.dateOfContact,
            notes: formData.notes,
            serviceInterestedIn: formData.serviceInterestedIn,
        };

        switch (formData.serviceInterestedIn) {
            case ServiceType.LanguageTraining:
                const combinedLanguages = [
                    ...(formData.trainingLanguages || []),
                    ...otherTrainingLanguages.split(',').map(l => l.trim()).filter(Boolean)
                ];
                submissionData.trainingLanguages = [...new Set(combinedLanguages)];
                break;
            case ServiceType.DocTranslation:
                submissionData.translationSourceLanguage = formData.translationSourceLanguage;
                submissionData.translationTargetLanguage = formData.translationTargetLanguage;
                break;
            case ServiceType.Interpretation:
                submissionData.interpretationSourceLanguage = formData.interpretationSourceLanguage;
                submissionData.interpretationTargetLanguage = formData.interpretationTargetLanguage;
                break;
        }

        // Validate form before submission
        if (!validateForm(submissionData)) {
            return; // Stop submission if validation fails
        }

        onSubmit(submissionData);

        if (!isEditing) {
            setFormData(initialFormState);
            setOtherTrainingLanguages('');
            clearErrors();
        }
    };

    const renderServiceSpecificFields = () => {
        switch (formData.serviceInterestedIn) {
            case ServiceType.LanguageTraining:
                return (
                    <LanguageTrainingFields
                        trainingLanguages={formData.trainingLanguages || []}
                        otherTrainingLanguages={otherTrainingLanguages}
                        onLanguagesChange={(languages) => setFormData(prev => ({ ...prev, trainingLanguages: languages }))}
                        onOtherLanguagesChange={setOtherTrainingLanguages}
                    />
                );
            case ServiceType.DocTranslation:
                return (
                    <TranslationFields
                        sourceLanguage={formData.translationSourceLanguage || ''}
                        targetLanguage={formData.translationTargetLanguage || ''}
                        onSourceLanguageChange={(value) => setFormData(prev => ({ ...prev, translationSourceLanguage: value }))}
                        onTargetLanguageChange={(value) => setFormData(prev => ({ ...prev, translationTargetLanguage: value }))}
                    />
                );
            case ServiceType.Interpretation:
                return (
                    <InterpretationFields
                        sourceLanguage={formData.interpretationSourceLanguage || ''}
                        targetLanguage={formData.interpretationTargetLanguage || ''}
                        onSourceLanguageChange={(value) => setFormData(prev => ({ ...prev, interpretationSourceLanguage: value }))}
                        onTargetLanguageChange={(value) => setFormData(prev => ({ ...prev, interpretationTargetLanguage: value }))}
                    />
                );
            default:
                return null;
        }
    };

    const serviceOptions = Object.values(ServiceType).map(service => ({
        value: service,
        label: service
    }));

    const contactMethodOptions = Object.values(ContactMethod).map(method => ({
        value: method,
        label: method
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Primary Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                    <FormField
                        label="Prospect Name"
                        name="prospectName"
                        value={formData.prospectName}
                        onChange={handleChange}
                        error={errors.prospectName}
                        required
                    />
                </div>
                <div>
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="prospect@example.com"
                    />
                </div>
                <div>
                    <FormField
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="(555) 123-4567"
                    />
                </div>
            </div>

            {/* Service & Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                    <SelectField
                        label="Service Interested In"
                        name="serviceInterestedIn"
                        value={formData.serviceInterestedIn}
                        onChange={handleChange}
                        options={serviceOptions}
                    />
                </div>
                <div>
                    <SelectField
                        label="Contact Method"
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleChange}
                        options={contactMethodOptions}
                    />
                </div>
                <div>
                    <FormField
                        label="Date of Contact"
                        name="dateOfContact"
                        type="date"
                        value={formData.dateOfContact}
                        onChange={handleChange}
                        error={errors.dateOfContact}
                        required
                    />
                </div>
            </div>

            {/* Service Specifics */}
            <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Service Details</h3>
                {renderServiceSpecificFields()}
            </div>

            {/* Notes */}
            <TextAreaField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                error={errors.notes}
                rows={3}
            />

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    type="submit"
                    className="bg-brand-primary text-white font-bold py-2.5 px-8 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
                >
                    {submitButtonText || 'Save Prospect'}
                </button>
            </div>

            <datalist id="languages-list">
                {commonEuropeanLanguages.map(lang => (
                    <option key={lang} value={lang} />
                ))}
            </datalist>
        </form>
    );
};

export default ProspectForm;