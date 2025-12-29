import React, { useState } from 'react';
import { CommunicationFormData, CommunicationType, CommunicationPriority, Communication } from '../../types';

interface CommunicationFormProps {
    onSubmit: (data: CommunicationFormData) => void;
    onCancel: () => void;
    initialData?: Communication;
}

const CommunicationForm: React.FC<CommunicationFormProps> = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState<CommunicationFormData>({
        type: initialData?.type || CommunicationType.General,
        title: initialData?.title || '',
        description: initialData?.description || '',
        assignedTo: initialData?.assignedTo || '',
        dueDate: initialData?.dueDate.split('T')[0] || new Date().toISOString().split('T')[0],
        priority: initialData?.priority || CommunicationPriority.Medium,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim() || !formData.assignedTo.trim()) {
            alert('Please fill in all required fields.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Team Meeting Notes"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide details about this communication..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                />
            </div>

            {/* Assigned To */}
            <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 mb-1">
                    Assigned To <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Username or 'Everyone'"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                />
                <p className="text-xs text-slate-500 mt-1">Enter a username or type "Everyone" to assign to all team members</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">
                        Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        required
                    />
                </div>

                {/* Priority */}
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                        <option value={CommunicationPriority.Low}>Low</option>
                        <option value={CommunicationPriority.Medium}>Medium</option>
                        <option value={CommunicationPriority.High}>High</option>
                    </select>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                >
                    {initialData ? 'Update Communication' : 'Create Communication'}
                </button>
            </div>
        </form>
    );
};

export default CommunicationForm;
