import React from 'react';
import { Payment } from '../types';
import PaymentsTable from './finance/PaymentsTable';

interface PaymentListProps {
  payments: Payment[];
  clients: any[];
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ payments, onEdit, onDelete }) => {
  return <PaymentsTable payments={payments} onEdit={onEdit} onDelete={onDelete} />;
};

export default PaymentList;
