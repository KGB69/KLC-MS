import React from 'react';
import { Class, ClassSchedule, ClassLevel } from '../types';

interface ClassItemProps {
  classItem: Class;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
}

const getLevelBadgeColor = (level: ClassLevel): string => {
  if (level.startsWith('A')) {
    return 'bg-green-100 text-green-800'; // Beginner (A1, A2)
  }
  if (level.startsWith('B')) {
    return 'bg-yellow-100 text-yellow-800'; // Intermediate (B1, B2)
  }
  if (level.startsWith('C')) {
    return 'bg-red-100 text-red-800'; // Advanced (C1, C2)
  }
  return 'bg-slate-100 text-slate-800';
};

const formatSchedule = (schedule: ClassSchedule[]): string[] => {
    if (!schedule || schedule.length === 0) return ["No schedule set"];
    // Simple sort by day of week index for consistent ordering
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return schedule
        .sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek))
        .map(s => `${s.dayOfWeek}, ${s.startTime} - ${s.endTime}`);
};

const ClassItem: React.FC<ClassItemProps> = ({ classItem, onEdit, onDelete }) => {
  const { name, language, level, teacherId, schedule, studentIds } = classItem;
  
  const formattedSchedule = formatSchedule(schedule);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">{name}</h3>
              <p className="text-sm font-medium text-brand-secondary">{language}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(level)} flex-shrink-0`}>
                {level}
            </span>
        </div>
        
        <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" /></svg>
                <span className="font-medium text-slate-600">Teacher:</span>
                <span className="text-slate-800">{teacherId}</span>
            </div>
            <div className="flex items-start space-x-2 text-sm">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" /></svg>
                 <div>
                    <span className="font-medium text-slate-600">Schedule:</span>
                    <ul className="mt-1 space-y-1">
                        {formattedSchedule.map((s, index) => (
                            <li key={index} className="text-slate-800 text-xs bg-slate-100 rounded px-2 py-1">{s}</li>
                        ))}
                    </ul>
                 </div>
            </div>
        </div>
      </div>
       <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm">
                 <svg className="w-4 h-4 text-slate-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.028.658a.78.78 0 01-.357.542zM10 13a-6.07 6.07 0 00-4.243 1.67a.78.78 0 01-.358.442 3 3 0 01-4.308-3.517 6.484 6.484 0 001.905-3.96 6.484 6.484 0 00-1.905-3.959 3 3 0 01-4.308-3.516.78.78 0 01.358-.442 6.07 6.07 0 004.243-1.67A6.07 6.07 0 0010 1a6.07 6.07 0 004.243 1.67.78.78 0 01.358.442 3 3 0 01-4.308 3.517c.54.94.852 2.008.852 3.083s-.313 2.143-.852 3.083a3 3 0 014.308 3.516.78.78 0 01-.358.442A6.07 6.07 0 0010 13z" /></svg>
                <span className="font-medium text-slate-600">Enrolled:</span>
                <span className="font-bold text-brand-dark">{studentIds.length}</span>
            </div>
            <div className="flex space-x-4">
                 <button
                    onClick={() => onEdit(classItem)}
                    className="flex items-center space-x-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-md p-1"
                    aria-label={`Edit class ${name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    <span>Edit</span>
                </button>
                <button
                    onClick={() => onDelete(classItem)}
                    className="flex items-center space-x-2 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1"
                    aria-label={`Delete class ${name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 4.811 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span>Delete</span>
                </button>
            </div>
      </div>
    </div>
  );
};

export default ClassItem;