import {
  Prospect, ProspectFormData, FollowUpAction, Student, StudentFormData,
  Class, ClassFormData, Payment, PaymentFormData, Expenditure, ExpenditureFormData,
  SearchCriteria, Communication, CommunicationFormData, ProspectStatus,
  ProspectDataStore, StudentDataStore, ClassDataStore, PaymentDataStore,
  ExpenditureDataStore, ClassScheduleDataStore, ClassScheduleEvent,
  ClassScheduleFormData, ClassEnrollment
} from '../types';

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export class ApiProspectDataStore implements
  ProspectDataStore, StudentDataStore, ClassDataStore,
  PaymentDataStore, ExpenditureDataStore, ClassScheduleDataStore {
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

  async addProspectWithId(id: string, prospectData: Prospect): Promise<Prospect> {
    const response = await fetch(`${API_BASE_URL}/prospects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...prospectData, id })
    });
    if (!response.ok) {
      throw new Error('Failed to add prospect with ID');
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

  async getProspectById(id: string): Promise<Prospect | undefined> {
    return this.getProspect(id);
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

  async updateProspectStatus(id: string, status: ProspectStatus): Promise<Prospect | undefined> {
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

  async updateStudent(id: string, updates: StudentFormData): Promise<Student | undefined> {
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

  async updateClass(classId: string, updates: ClassFormData): Promise<Class | undefined> {
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

  async assignStudentToClass(studentId: string, classId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId })
    });
    if (!response.ok) throw new Error('Failed to enroll student');
  }

  async removeStudentFromClass(studentId: string, classId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/unenroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId })
    });
    if (!response.ok) throw new Error('Failed to unenroll student');
  }

  async updateStudentEnrollments(studentId: string, classIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/enrollments`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ classIds })
    });
    if (!response.ok) throw new Error('Failed to update student enrollments');
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

  async getPaymentsForClient(clientId: string): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments?clientId=${clientId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch payments for client');
    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/communications`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch communications');
    return response.json();
  }

  async addCommunication(data: CommunicationFormData): Promise<Communication> {
    const response = await fetch(`${API_BASE_URL}/communications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add communication');
    return response.json();
  }

  async updateCommunication(id: string, updates: Partial<Communication>): Promise<Communication | undefined> {
    const response = await fetch(`${API_BASE_URL}/communications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update communication');
    return response.json();
  }

  async deleteCommunication(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/communications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  // --- Class Schedule Methods ---
  async addClassSchedule(data: ClassScheduleFormData): Promise<ClassScheduleEvent> {
    const response = await fetch(`${API_BASE_URL}/class-schedules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add class schedule');
    return response.json();
  }

  async getAllClassSchedules(startDate?: string, endDate?: string, status?: string): Promise<ClassScheduleEvent[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/class-schedules?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch class schedules');
    return response.json();
  }

  async getClassSchedule(id: string): Promise<ClassScheduleEvent | undefined> {
    const response = await fetch(`${API_BASE_URL}/class-schedules/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return undefined;
    return response.json();
  }

  async updateClassSchedule(id: string, updates: Partial<ClassScheduleFormData>): Promise<ClassScheduleEvent | undefined> {
    const response = await fetch(`${API_BASE_URL}/class-schedules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update class schedule');
    return response.json();
  }

  async deleteClassSchedule(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/class-schedules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  async enrollStudent(classId: string, studentId: string): Promise<ClassEnrollment> {
    const response = await fetch(`${API_BASE_URL}/class-schedules/${classId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId })
    });
    if (!response.ok) throw new Error('Failed to enroll student');
    return response.json();
  }

  async unenrollStudent(enrollmentId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/class-enrollments/${enrollmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }

  async getClassEnrollments(classId: string): Promise<ClassEnrollment[]> {
    const response = await fetch(`${API_BASE_URL}/class-schedules/${classId}/enrollments`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch enrollments');
    return response.json();
  }

  async markAttendance(enrollmentId: string, status: 'present' | 'absent' | 'late'): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/class-enrollments/${enrollmentId}/attendance`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return response.ok;
  }
}