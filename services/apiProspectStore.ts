import {
  Prospect, ProspectFormData, FollowUpAction, Student, StudentFormData,
  Class, ClassFormData, Payment, PaymentFormData, Expenditure, ExpenditureFormData,
  SearchCriteria, Communication
} from '../types';

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export class ApiProspectDataStore {
  // --- Prospect Methods ---

  async addProspect(prospectData: ProspectFormData): Promise<Prospect> {
    const response = await fetch(`${API_BASE_URL}/prospects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(prospectData)
    });
    if (!response.ok) {
      throw new Error('Failed to add prospect');
    }
    return response.json();
  }

  async getProspect(id: string): Promise<Prospect | undefined> {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('Failed to fetch prospect');
    }
    return response.json();
  }

  async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect | undefined> {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update prospect');
    }
    return response.json();
  }

  async updateProspectStatus(id: string, status: any): Promise<Prospect | undefined> {
    return this.updateProspect(id, { status });
  }

  async deleteProspect(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  async searchProspects(criteria: SearchCriteria): Promise<Prospect[]> {
    const params = new URLSearchParams();
    if (criteria.searchTerm) params.append('searchTerm', criteria.searchTerm);

    const response = await fetch(`${API_BASE_URL}/prospects?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to search prospects');
    }
    return response.json();
  }

  async getCompletedJobs(): Promise<Prospect[]> {
    const response = await fetch(`${API_BASE_URL}/prospects?status=Converted`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch completed jobs');
    }
    return response.json();
  }

  // --- Follow-up Methods ---

  async addFollowUp(followUpData: Omit<FollowUpAction, 'id' | 'status' | 'outcome'>): Promise<FollowUpAction> {
    const response = await fetch(`${API_BASE_URL}/followups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(followUpData)
    });
    if (!response.ok) {
      throw new Error('Failed to add follow-up');
    }
    return response.json();
  }

  async getFollowUpsForProspect(prospectId: string): Promise<FollowUpAction[]> {
    const response = await fetch(`${API_BASE_URL}/followups?prospectId=${prospectId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch follow-ups');
    }
    return response.json();
  }

  async updateFollowUp(id: string, updates: Partial<Pick<FollowUpAction, 'status' | 'outcome'>>): Promise<FollowUpAction | undefined> {
    const response = await fetch(`${API_BASE_URL}/followups/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update follow-up');
    }
    return response.json();
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/followups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  async getAllFollowUps(): Promise<FollowUpAction[]> {
    const response = await fetch(`${API_BASE_URL}/followups`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch all follow-ups');
    }
    return response.json();
  }

  // --- Student Methods ---

  async addStudent(studentData: StudentFormData): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData)
    });
    if (!response.ok) {
      throw new Error('Failed to add student');
    }
    return response.json();
  }

  async getStudents(): Promise<Student[]> {
    const response = await fetch(`${API_BASE_URL}/students`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    return response.json();
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const students = await this.getStudents();
    return students.find(s => s.id === id);
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update student');
    }
    return response.json();
  }

  async deleteStudent(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  // --- Class Methods ---

  async addClass(classData: ClassFormData): Promise<Class> {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(classData)
    });
    if (!response.ok) {
      throw new Error('Failed to add class');
    }
    return response.json();
  }

  async getClasses(): Promise<Class[]> {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }
    return response.json();
  }

  async getClass(classId: string): Promise<Class | undefined> {
    const classes = await this.getClasses();
    return classes.find(c => c.classId === classId);
  }

  async updateClass(classId: string, updates: Partial<Class>): Promise<Class | undefined> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update class');
    }
    return response.json();
  }

  async deleteClass(classId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  async enrollStudentInClass(studentId: string, classId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId })
    });
    return response.ok;
  }

  async unenrollStudentFromClass(studentId: string, classId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/unenroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId })
    });
    return response.ok;
  }

  // --- Payment Methods ---

  async addPayment(paymentData: PaymentFormData): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) throw new Error('Failed to add payment');
    return response.json();
  }

  async getAllPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch all payments');
    return response.json();
  }

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update payment');
    return response.json();
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  // --- Expenditure Methods ---

  async addExpenditure(expenditureData: ExpenditureFormData): Promise<Expenditure> {
    const response = await fetch(`${API_BASE_URL}/expenditures`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expenditureData)
    });
    if (!response.ok) throw new Error('Failed to add expenditure');
    return response.json();
  }

  async getAllExpenditures(): Promise<Expenditure[]> {
    const response = await fetch(`${API_BASE_URL}/expenditures`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch all expenditures');
    return response.json();
  }

  async updateExpenditure(expenditureId: string, updates: Partial<Expenditure>): Promise<Expenditure | undefined> {
    const response = await fetch(`${API_BASE_URL}/expenditures/${expenditureId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update expenditure');
    return response.json();
  }

  async deleteExpenditure(expenditureId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/expenditures/${expenditureId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  // --- Communication Methods ---
  async getAllCommunications(): Promise<Communication[]> {
    // Communications are not yet implemented in the backend
    // Return empty array for now to prevent errors
    return [];
  }
}