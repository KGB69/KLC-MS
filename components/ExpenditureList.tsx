import React from 'react';
import { Expenditure } from '../types';
import ExpendituresTable from './finance/ExpendituresTable';

interface ExpenditureListProps {
  expenditures: Expenditure[];
  onEdit: (expenditure: Expenditure) => void;
  onDelete: (expenditure: Expenditure) => void;
}

const ExpenditureList: React.FC<ExpenditureListProps> = ({ expenditures, onEdit, onDelete }) => {
  return <ExpendituresTable expenditures={expenditures} onEdit={onEdit} onDelete={onDelete} />;
};

export default ExpenditureList;
