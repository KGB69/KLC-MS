
import React, { useState } from 'react';
import { Prospect, StudentDetailsFormData, howHeardAboutUs } from '../types';
import Modal from './shared/Modal';

interface StudentRegistrationFormProps {
  prospect: Prospect;
  onSubmit: (details: StudentDetailsFormData) => void;
  onCancel: () => void;
}

const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({ prospect, onSubmit, onCancel }) => {
  const initialFormState: StudentDetailsFormData = {
    languageOfStudy: prospect.trainingLanguages && prospect.trainingLanguages.length > 0 ? prospect.trainingLanguages[0] : '',
    registrationDate: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    nationality: '',
    occupation: '',
    address: '',
    motherTongue: '',
    howHeardAboutUs: howHeardAboutUs.GoogleSearch,
    howHeardAboutUsOther: '',
    fees: 0,
  };

  const [formData, setFormData] = useState<StudentDetailsFormData>(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!formData.languageOfStudy || !formData.registrationDate || !formData.dateOfBirth || !formData.nationality.trim() || !formData.occupation.trim() || !formData.address.trim() || !formData.motherTongue.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.howHeardAboutUs === howHeardAboutUs.Other && !formData.howHeardAboutUsOther?.trim()) {
      alert("Please specify the source for 'Other'.");
      return;
    }

    const submissionData = { ...formData };
    if (formData.howHeardAboutUs !== howHeardAboutUs.Other) {
      submissionData.howHeardAboutUsOther = '';
    }

    onSubmit(submissionData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Complete Student Conversion"
    >
      <div className="mb-6">
        <p className="text-sm text-slate-500">Converting prospect: <strong className="font-semibold text-slate-900">{prospect.prospectName}</strong></p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="languageOfStudy" className="block text-sm font-medium text-slate-600 mb-1">Language of Study</label>
            <select
              id="languageOfStudy"
              name="languageOfStudy"
              value={formData.languageOfStudy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white"
              required
            >
              <option value="" disabled>Select Language...</option>
              {prospect.trainingLanguages?.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
              {!prospect.trainingLanguages?.length && (
                <option value="Unknown">Unknown (Interest not specified)</option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="registrationDate" className="block text-sm font-medium text-slate-600 mb-1">Registration Date</label>
            <input
              type="date"
              id="registrationDate"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-slate-600 mb-1">Nationality</label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="e.g., American"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="motherTongue" className="block text-sm font-medium text-slate-600 mb-1">Mother Tongue</label>
            <input
              type="text"
              id="motherTongue"
              name="motherTongue"
              value={formData.motherTongue}
              onChange={handleChange}
              placeholder="e.g., Spanish"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-slate-600 mb-1">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            placeholder="123 Main St, Anytown, USA 12345"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="howHeardAboutUs" className="block text-sm font-medium text-slate-600 mb-1">How did they hear about us?</label>
            <select
              id="howHeardAboutUs"
              name="howHeardAboutUs"
              value={formData.howHeardAboutUs}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white"
            >
              {Object.values(howHeardAboutUs).map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          {formData.howHeardAboutUs === howHeardAboutUs.Other && (
            <div className="animate-fade-in">
              <label htmlFor="howHeardAboutUsOther" className="block text-sm font-medium text-slate-600 mb-1">Please Specify</label>
              <input
                type="text"
                id="howHeardAboutUsOther"
                name="howHeardAboutUsOther"
                value={formData.howHeardAboutUsOther || ''}
                onChange={handleChange}
                placeholder="e.g., University fair"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="fees" className="block text-sm font-medium text-slate-600 mb-1">Total Fees (UGX)</label>
          <input
            type="number"
            id="fees"
            name="fees"
            value={formData.fees}
            onChange={handleChange}
            min="0"
            step="1000"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            required
          />
        </div>

        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="font-semibold text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Complete Conversion
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentRegistrationForm;
