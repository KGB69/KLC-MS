import React, { useState, useEffect } from 'react';
import { Student, StudentFormData, HowTheyHeardAboutUs, ServiceType } from '../types';
import Modal from './shared/Modal';
import { formatDateForInput } from '../utils/dateUtils';

interface StudentEditFormProps {
  student: Student;
  onSubmit: (details: StudentFormData) => void;
  onCancel: () => void;
}

const StudentEditForm: React.FC<StudentEditFormProps> = ({ student, onSubmit, onCancel }) => {

  const [formData, setFormData] = useState<StudentFormData>({
    studentId: student.studentId,
    name: student.name,
    email: student.email || '',
    phone: student.phone || '',
    languageOfStudy: student.languageOfStudy,
    registrationDate: formatDateForInput(student.registrationDate),
    dateOfBirth: formatDateForInput(student.dateOfBirth),
    nationality: student.nationality,
    occupation: student.occupation,
    address: student.address,
    motherTongue: student.motherTongue || '',
    howTheyHeardAboutUs: student.howTheyHeardAboutUs,
    howTheyHeardAboutUsOther: student.howTheyHeardAboutUsOther || '',
    fees: student.fees || 0,
  });

  useEffect(() => {
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      languageOfStudy: student.languageOfStudy,
      registrationDate: formatDateForInput(student.registrationDate),
      dateOfBirth: formatDateForInput(student.dateOfBirth),
      nationality: student.nationality,
      occupation: student.occupation,
      address: student.address,
      motherTongue: student.motherTongue || '',
      howTheyHeardAboutUs: student.howTheyHeardAboutUs,
      howTheyHeardAboutUsOther: student.howTheyHeardAboutUsOther || '',
      fees: student.fees || 0,
    });
  }, [student]);


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
    if (!formData.name.trim() || !formData.dateOfBirth || !formData.nationality.trim() || !formData.occupation.trim() || !formData.address.trim() || !formData.motherTongue.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.howTheyHeardAboutUs === HowTheyHeardAboutUs.Other && !formData.howTheyHeardAboutUsOther?.trim()) {
      alert("Please specify the source for 'Other'.");
      return;
    }

    const submissionData = { ...formData };
    if (formData.howTheyHeardAboutUs !== HowTheyHeardAboutUs.Other) {
      submissionData.howTheyHeardAboutUsOther = '';
    }

    onSubmit(submissionData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Edit Student Record"
    >
      <div className="mb-6">
        <p className="text-sm text-slate-500">Editing details for: <strong className="font-semibold">{student.name}</strong></p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-slate-600 mb-1">Student ID</label>
            <input
              type="text" id="studentId" name="studentId"
              value={formData.studentId}
              readOnly
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="registrationDate" className="block text-sm font-medium text-slate-600 mb-1">Registration Date</label>
            <input
              type="date" id="registrationDate" name="registrationDate"
              value={formData.registrationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="languageOfStudy" className="block text-sm font-medium text-slate-600 mb-1">Language of Study</label>
            <input
              type="text" id="languageOfStudy" name="languageOfStudy"
              value={formData.languageOfStudy}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email" id="email" name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
            <input
              type="tel" id="phone" name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
            <input
              type="date" id="dateOfBirth" name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-slate-600 mb-1">Nationality</label>
            <input
              type="text" id="nationality" name="nationality"
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
              type="text" id="occupation" name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
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
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">Address</label>
          <textarea
            id="address" name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            placeholder="123 Main St, Anytown, USA 12345"
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
            className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
          >
            Update Student
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentEditForm;
