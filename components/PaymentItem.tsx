import React from 'react';
import { Payment, Client, ServiceType } from '../types';
import { formatCurrency } from '../utils/currency';

interface PaymentItemProps {
  payment: Payment;
  client?: Client;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

const getServiceBadgeColor = (service: ServiceType): string => {
    switch (service) {
      case ServiceType.LanguageTraining: return 'bg-blue-100 text-blue-800';
      case ServiceType.DocTranslation: return 'bg-green-100 text-green-800';
      case ServiceType.Interpretation: return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
};

const PaymentItem: React.FC<PaymentItemProps> = ({ payment, client, onEdit, onDelete }) => {
  const { payerName, paymentDate, amount, service, paymentMethod, notes, balance } = payment;

  return (
    <li className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-brand-primary truncate">{payerName}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getServiceBadgeColor(service)}`}>
                        {service}
                    </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-slate-500">
                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" />
                    </svg>
                    <p>
                        <time dateTime={paymentDate}>{new Date(paymentDate + 'T00:00:00').toLocaleDateString()}</time>
                    </p>
                </div>
            </div>
            <div className="inline-flex items-baseline text-right">
                <p className="text-lg font-bold text-green-700">{formatCurrency(amount)}</p>
            </div>
        </div>
        <div className="mt-4">
            {notes && <p className="text-sm text-slate-600 mb-2 p-2 bg-slate-100 rounded-md">{notes}</p>}
            <div className="flex justify-between items-center text-xs text-slate-500">
                 <p>Paid via {paymentMethod}</p>
                 <p>
                    Remaining Balance: 
                    <span className={`font-semibold ml-1 ${ (balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(balance)}
                    </span>
                 </p>
            </div>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
            <button onClick={() => onEdit(payment)}
                className="flex items-center space-x-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-md p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                <span>Edit</span>
            </button>
            <button onClick={() => onDelete(payment)}
                className="flex items-center space-x-2 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 4.811 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                <span>Delete</span>
            </button>
        </div>
    </li>
  );
};

export default PaymentItem;
