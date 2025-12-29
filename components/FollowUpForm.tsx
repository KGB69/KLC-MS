import React, { useState } from 'react';
import { FollowUpFormData } from '../types';

interface FollowUpFormProps {
  onSubmit: (formData: FollowUpFormData) => void;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({ onSubmit }) => {
  const initialFormState: FollowUpFormData = {
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    notes: '',
  };

  const [formData, setFormData] = useState<FollowUpFormData>(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.assignedTo.trim() || !formData.notes.trim()) {
      alert("Please fill in both 'Assigned To' and 'Notes'.");
      return;
    }
    onSubmit(formData);
    setFormData(initialFormState); // Reset form after submission
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
      <h4 className="text-lg font-semibold text-brand-secondary mb-3">Schedule New Follow-up</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 mb-1">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-600 mb-1">Assigned To</label>
            <input
              type="text"
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="e.g., Jane Doe"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="followUpNotes" className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
          <textarea
            id="followUpNotes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Call to discuss translation quote."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default FollowUpForm;