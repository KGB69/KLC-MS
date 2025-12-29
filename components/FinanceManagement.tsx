import React, { useState } from 'react';
import PaymentManagement from './PaymentManagement';
import ExpenditureManagement from './ExpenditureManagement';

type FinanceSubView = 'payments' | 'expenditures';

interface FinanceManagementProps {
  dataStore: any;
}

const FinanceManagement: React.FC<FinanceManagementProps> = ({ dataStore }) => {
  const [subView, setSubView] = useState<FinanceSubView>('payments');

  const SubNavButton: React.FC<{ view: FinanceSubView; label: string; }> = ({ view, label }) => (
    <button
      onClick={() => setSubView(view)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${subView === view
          ? 'bg-brand-primary text-white'
          : 'text-slate-600 bg-white hover:bg-slate-100'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">Financial Overview</h2>
            <p className="text-brand-secondary mt-1">Manage incoming payments and outgoing expenditures.</p>
          </div>
          <div className="flex items-center space-x-2 p-1 bg-slate-100 rounded-lg">
            <SubNavButton view="payments" label="Payments" />
            <SubNavButton view="expenditures" label="Expenditures" />
          </div>
        </div>
      </div>

      {subView === 'payments' && <PaymentManagement dataStore={dataStore} />}
      {subView === 'expenditures' && <ExpenditureManagement dataStore={dataStore} />}

    </div>
  );
};

export default FinanceManagement;
