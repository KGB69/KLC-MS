import React from 'react';
import { ServiceType, ContactMethod } from '../types';

/**
 * Get the badge color classes for a service type
 */
export function getServiceBadgeColor(service: ServiceType): string {
    switch (service) {
        case ServiceType.LanguageTraining:
            return 'bg-blue-100 text-blue-800';
        case ServiceType.DocTranslation:
            return 'bg-green-100 text-green-800';
        case ServiceType.Interpretation:
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-slate-100 text-slate-800';
    }
}

/**
 * Get the icon for a contact method
 */
export function getContactMethodIcon(method: ContactMethod): React.ReactElement {
    const iconClass = "w-5 h-5";

    switch (method) {
        case ContactMethod.Phone:
            return (
                <svg xmlns= "http://www.w3.org/2000/svg" className = { iconClass } viewBox = "0 0 20 20" fill = "currentColor" >
                    <path fillRule="evenodd" d = "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule = "evenodd" />
                        </svg>
      );
        case ContactMethod.InPerson:
            return (
                <svg xmlns= "http://www.w3.org/2000/svg" className = { iconClass } viewBox = "0 0 20 20" fill = "currentColor" >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
      );
        case ContactMethod.Mail:
            return (
                <svg xmlns= "http://www.w3.org/2000/svg" className = { iconClass } viewBox = "0 0 20 20" fill = "currentColor" >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
      );
        case ContactMethod.WhatsApp:
            return (
                <svg xmlns= "http://www.w3.org/2000/svg" className = { iconClass } viewBox = "0 0 20 20" fill = "currentColor" >
                    <path fillRule="evenodd" d = "M18 10c0 3.866-3.582 7-8 7a8.839 8.839 0 01-4.445-1.282l-1.493.747c-.36.18-.78-.054-.87-.433A7.001 7.001 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7.25 13.06l.07-.354c.22-.97.6-1.854 1.154-2.626.553-.771 1.253-1.42 2.067-1.922l.144-.088c.17-.103.41-.01.43.203l.063.513c.02.164-.105.32-.26.347l-1.07.133a.5.5 0 00-.435.657l.513 1.07c.12.25.047.553-.173.693l-.86 1.72a.5.5 0 00.173.693l1.07.513c.154.027.28-.183.26-.347l-.063-.513c-.02-.213.26-.306.43-.203l-.144.088c-.814.502-1.514 1.15-2.067 1.922-.555.772-.935 1.656-1.155 2.626l-.07.354c-.035.174-.26.214-.354.07l-.354-.531c-.093-.14-.053-.354.088-.446z" clipRule = "evenodd" />
                        </svg>
      );
        default:
            return (
                <svg xmlns= "http://www.w3.org/2000/svg" className = { iconClass } viewBox = "0 0 20 20" fill = "currentColor" >
                    <path fillRule="evenodd" d = "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 100-2 1 1 0 000 2zM11 8a1 1 0 100-2 1 1 0 000 2zM7 12a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" clipRule = "evenodd" />
                        </svg>
      );
    }
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
    return new Date(dateString + 'T00:00:00').toLocaleDateString();
}
