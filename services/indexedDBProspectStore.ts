
import { Prospect, ProspectDataStore, ProspectFormData, SearchCriteria, FollowUpAction, FollowUpStatus, ProspectStatus, StudentDataStore, StudentFormData, Student, ClassDataStore, ClassFormData, Class, PaymentDataStore, Payment, PaymentFormData, ExpenditureDataStore, Expenditure, ExpenditureFormData, Communication, CommunicationFormData, CommunicationType, CommunicationPriority, Currency } from '../types';
import { getCurrentUserInfo } from './userAttributionService';

const DB_NAME = 'ProspectCRMDB';
const DB_VERSION = 8; // Incremented version for currency fields
const PROSPECT_STORE_NAME = 'prospects';
const FOLLOWUP_STORE_NAME = 'followUps';
const COMMUNICATION_STORE_NAME = 'communications';
const STUDENT_STORE_NAME = 'students';
const CLASS_STORE_NAME = 'classes';
const PAYMENT_STORE_NAME = 'payments';
const EXPENDITURE_STORE_NAME = 'expenditures';


export class IndexedDBProspectDataStore implements ProspectDataStore, StudentDataStore, ClassDataStore, PaymentDataStore, ExpenditureDataStore {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject('Error opening IndexedDB.');
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create Prospect Store if it doesn't exist
        if (!db.objectStoreNames.contains(PROSPECT_STORE_NAME)) {
          const prospectStore = db.createObjectStore(PROSPECT_STORE_NAME, { keyPath: 'id' });
          prospectStore.createIndex('prospectName', 'prospectName', { unique: false });
          prospectStore.createIndex('contactMethod', 'contactMethod', { unique: false });
          prospectStore.createIndex('serviceInterestedIn', 'serviceInterestedIn', { unique: false });
          prospectStore.createIndex('status', 'status', { unique: false });
        }

        // Create Follow-up Store
        if (!db.objectStoreNames.contains(FOLLOWUP_STORE_NAME)) {
          const followUpStore = db.createObjectStore(FOLLOWUP_STORE_NAME, { keyPath: 'id' });
          followUpStore.createIndex('prospectId', 'prospectId', { unique: false });
          followUpStore.createIndex('dueDate', 'dueDate', { unique: false });
        }

        // Create Student Store
        if (!db.objectStoreNames.contains(STUDENT_STORE_NAME)) {
          const studentStore = db.createObjectStore(STUDENT_STORE_NAME, { keyPath: 'id' });
          studentStore.createIndex('studentId', 'studentId', { unique: true });
          studentStore.createIndex('name', 'name', { unique: false });
        }

        // Create Class Store
        if (!db.objectStoreNames.contains(CLASS_STORE_NAME)) {
          const classStore = db.createObjectStore(CLASS_STORE_NAME, { keyPath: 'classId' });
          classStore.createIndex('language', 'language', { unique: false });
          classStore.createIndex('level', 'level', { unique: false });
        }

        // Create Payment Store
        if (!db.objectStoreNames.contains(PAYMENT_STORE_NAME)) {
          const paymentStore = db.createObjectStore(PAYMENT_STORE_NAME, { keyPath: 'paymentId' });
          paymentStore.createIndex('clientId', 'clientId', { unique: false });
          paymentStore.createIndex('paymentDate', 'paymentDate', { unique: false });
        }

        // Create Expenditure Store
        if (!db.objectStoreNames.contains(EXPENDITURE_STORE_NAME)) {
          const expenditureStore = db.createObjectStore(EXPENDITURE_STORE_NAME, { keyPath: 'expenditureId' });
          expenditureStore.createIndex('category', 'category', { unique: false });
          expenditureStore.createIndex('expenditureDate', 'expenditureDate', { unique: false });
        }

        // Create Communication Store
        if (!db.objectStoreNames.contains(COMMUNICATION_STORE_NAME)) {
          const communicationStore = db.createObjectStore(COMMUNICATION_STORE_NAME, { keyPath: 'id' });
          communicationStore.createIndex('type', 'type', { unique: false });
          communicationStore.createIndex('assignedTo', 'assignedTo', { unique: false });
          communicationStore.createIndex('dueDate', 'dueDate', { unique: false });
          communicationStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // --- Prospect Methods ---

  async addProspect(prospectData: ProspectFormData): Promise<Prospect> {
    // Get user info BEFORE opening transaction to prevent transaction from closing
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(PROSPECT_STORE_NAME, 'readwrite');

    const newProspect: Prospect = {
      ...prospectData,
      id: crypto.randomUUID(),
      status: ProspectStatus.Inquired,
      createdBy: userInfo.id,
      createdByUsername: userInfo.username,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(newProspect);
      request.onsuccess = () => {
        const event = new CustomEvent('prospectCreated', { detail: newProspect, bubbles: true, composed: true });
        document.dispatchEvent(event);
        resolve(newProspect);
      };
      request.onerror = () => reject('Failed to add prospect.');
    });
  }

  async getProspect(id: string): Promise<Prospect | undefined> {
    const store = await this.getStore(PROSPECT_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Failed to get prospect.');
    });
  }

  async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect | undefined> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(PROSPECT_STORE_NAME, 'readwrite');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onerror = () => reject('Failed to find prospect to update.');
      getRequest.onsuccess = () => {
        const existingProspect = getRequest.result;
        if (!existingProspect) {
          resolve(undefined);
          return;
        }

        const updatedProspect: Prospect = {
          ...existingProspect,
          ...updates,
          modifiedBy: userInfo.id,
          modifiedByUsername: userInfo.username,
          modifiedAt: new Date().toISOString(),
        };

        const putRequest = store.put(updatedProspect);
        putRequest.onerror = () => reject('Failed to update prospect.');
        putRequest.onsuccess = () => resolve(updatedProspect);
      };
    });
  }

  async updateProspectStatus(id: string, status: ProspectStatus): Promise<Prospect | undefined> {
    const store = await this.getStore(PROSPECT_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onerror = () => reject('Failed to find prospect to update status.');
      getRequest.onsuccess = () => {
        const existingProspect = getRequest.result;
        if (!existingProspect) {
          resolve(undefined);
          return;
        }

        const updatedProspect: Prospect = { ...existingProspect, status: status };

        const putRequest = store.put(updatedProspect);
        putRequest.onerror = () => reject('Failed to update prospect status.');
        putRequest.onsuccess = () => resolve(updatedProspect);
      };
    });
  }

  async deleteProspect(id: string): Promise<boolean> {
    const store = await this.getStore(PROSPECT_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject('Failed to delete prospect.');
    });
  }

  async searchProspects(criteria: SearchCriteria): Promise<Prospect[]> {
    const store = await this.getStore(PROSPECT_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve prospects.');
      request.onsuccess = () => {
        const allProspects: Prospect[] = request.result.sort((a, b) => new Date(b.dateOfContact).getTime() - new Date(a.dateOfContact).getTime());
        const filtered = allProspects.filter(prospect => {
          // Filter out converted prospects - they should only appear in Student Management or Completed Jobs
          if (prospect.status === 'Converted') {
            return false;
          }
          const { contactMethod, serviceInterestedIn, searchTerm } = criteria;
          const lowercasedSearchTerm = searchTerm.toLowerCase();
          const matchesContactMethod = contactMethod === 'all' || prospect.contactMethod === contactMethod;
          const matchesService = serviceInterestedIn === 'all' || prospect.serviceInterestedIn === serviceInterestedIn;
          const matchesSearchTerm =
            !lowercasedSearchTerm ||
            prospect.prospectName.toLowerCase().includes(lowercasedSearchTerm) ||
            (prospect.email && prospect.email.toLowerCase().includes(lowercasedSearchTerm)) ||
            (prospect.phone && prospect.phone.toLowerCase().includes(lowercasedSearchTerm)) ||
            prospect.notes.toLowerCase().includes(lowercasedSearchTerm);
          return matchesContactMethod && matchesService && matchesSearchTerm;
        });

        // Use the filterDataByTime utility if criteria.timeFilter is provided
        if (criteria.timeFilter && criteria.timeFilter !== 'all') {
          // Dynamic import to avoid top-level issues if any, but regular import is preferred
          // Since I cannot add import at top right now easily with replace_file_content constrained range
          // I will implement simple logic locally or rely on the helper being imported
          // Actually, I should use the utility function
          // Let's assume I'll import it at the top later or use the simple logic inline for now to be safe
          // Inline implementation of time filter to avoid import issues in this large file
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          const timeFiltered = filtered.filter(prospect => {
            const date = new Date(prospect.dateOfContact);
            switch (criteria.timeFilter) {
              case '24h':
                return date >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
              case '7d':
                return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              case '1m': {
                const cutoff = new Date(now);
                cutoff.setMonth(cutoff.getMonth() - 1);
                return date >= cutoff;
              }
              case '3m': {
                const cutoff = new Date(now);
                cutoff.setMonth(cutoff.getMonth() - 3);
                return date >= cutoff;
              }
              case '6m': {
                const cutoff = new Date(now);
                cutoff.setMonth(cutoff.getMonth() - 6);
                return date >= cutoff;
              }
              case '1y': {
                const cutoff = new Date(now);
                cutoff.setFullYear(cutoff.getFullYear() - 1);
                return date >= cutoff;
              }
              default:
                return true;
            }
          });
          resolve(timeFiltered);
          return;
        }

        resolve(filtered);
      };
    });
  }

  async getCompletedJobs(): Promise<Prospect[]> {
    const store = await this.getStore(PROSPECT_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve prospects for completed jobs list.');
      request.onsuccess = () => {
        const completed = request.result.filter((p: Prospect) => p.status === ProspectStatus.Converted);
        // Sort by completion date, most recent first. Handle different completion date fields.
        completed.sort((a, b) => {
          const dateA = a.translationCompletionDate || a.interpretationCompletionDate || a.dateOfContact;
          const dateB = b.translationCompletionDate || b.interpretationCompletionDate || b.dateOfContact;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        resolve(completed);
      };
    });
  }

  // --- Follow-up Methods ---

  async addFollowUp(followUpData: Omit<FollowUpAction, 'id' | 'status' | 'outcome'>): Promise<FollowUpAction> {
    const store = await this.getStore(FOLLOWUP_STORE_NAME, 'readwrite');
    const newFollowUp: FollowUpAction = {
      ...followUpData,
      id: crypto.randomUUID(),
      status: FollowUpStatus.Pending,
    };
    return new Promise((resolve, reject) => {
      const request = store.add(newFollowUp);
      request.onsuccess = () => {
        const event = new CustomEvent('followUpUpdated', { bubbles: true, composed: true });
        document.dispatchEvent(event);
        resolve(newFollowUp);
      };
      request.onerror = () => reject('Failed to add follow-up action.');
    });
  }

  async getFollowUpsForProspect(prospectId: string): Promise<FollowUpAction[]> {
    const store = await this.getStore(FOLLOWUP_STORE_NAME, 'readonly');
    const index = store.index('prospectId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(prospectId);
      request.onerror = () => reject('Failed to retrieve follow-up actions.');
      request.onsuccess = () => {
        const followUps: FollowUpAction[] = request.result.sort((a: FollowUpAction, b: FollowUpAction) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        resolve(followUps);
      };
    });
  }

  async getAllFollowUps(): Promise<FollowUpAction[]> {
    const store = await this.getStore(FOLLOWUP_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve all follow-up actions.');
      request.onsuccess = () => {
        const followUps: FollowUpAction[] = request.result.sort((a: FollowUpAction, b: FollowUpAction) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        resolve(followUps);
      };
    });
  }

  async updateFollowUp(id: string, updates: Partial<Pick<FollowUpAction, 'status' | 'outcome'>>): Promise<FollowUpAction | undefined> {
    const store = await this.getStore(FOLLOWUP_STORE_NAME, 'readwrite');

    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onerror = () => reject('Failed to find follow-up to update.');
      getRequest.onsuccess = () => {
        const existingFollowUp = getRequest.result;
        if (!existingFollowUp) {
          resolve(undefined);
          return;
        }
        const updatedFollowUp: FollowUpAction = { ...existingFollowUp, ...updates };
        const putRequest = store.put(updatedFollowUp);
        putRequest.onerror = () => reject('Failed to update follow-up.');
        putRequest.onsuccess = () => {
          const event = new CustomEvent('followUpUpdated', { bubbles: true, composed: true });
          document.dispatchEvent(event);
          resolve(updatedFollowUp);
        };
      };
    });
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    const store = await this.getStore(FOLLOWUP_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        const event = new CustomEvent('followUpUpdated', { bubbles: true, composed: true });
        document.dispatchEvent(event);
        resolve(true);
      };
      request.onerror = () => reject('Failed to delete follow-up.');
    });
  }

  // --- Student Methods ---
  async addStudent(studentData: Omit<StudentFormData, 'studentId'>): Promise<Student> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(STUDENT_STORE_NAME, 'readwrite');

    // Custom studentId generation logic: STU-DDMMYY-NNNN
    const existingStudentsRequest = store.getAll();

    return new Promise((resolve, reject) => {
      existingStudentsRequest.onsuccess = () => {
        const existingStudents: Student[] = existingStudentsRequest.result;

        // 1. Get date parts
        const regDate = new Date(studentData.registrationDate);
        const day = String(regDate.getDate()).padStart(2, '0');
        const month = String(regDate.getMonth() + 1).padStart(2, '0');
        const yearShort = String(regDate.getFullYear()).slice(-2);
        const datePart = `${day}${month}${yearShort}`;

        // 2. Get sequence number for this year
        const regYear = regDate.getFullYear();
        const sameYearStudents = existingStudents.filter(s => {
          const sRegDate = new Date(s.registrationDate);
          return sRegDate.getFullYear() === regYear;
        });

        const sequenceNum = sameYearStudents.length + 1;
        const seqPart = String(sequenceNum).padStart(4, '0');

        const customStudentId = `STU-${datePart}-${seqPart}`;

        const newStudent: Student = {
          ...studentData,
          studentId: customStudentId,
          id: crypto.randomUUID(),
          createdBy: userInfo.id,
          createdByUsername: userInfo.username,
          createdAt: new Date().toISOString(),
        };

        const request = store.add(newStudent);
        request.onsuccess = () => resolve(newStudent);
        request.onerror = (event) => {
          console.error("Failed to add student:", (event.target as IDBRequest).error);
          reject('Failed to add student. A conflict occurred during ID generation.');
        };
      };

      existingStudentsRequest.onerror = () => reject('Failed to fetch existing students for ID generation.');
    });
  }

  async getStudents(): Promise<Student[]> {
    const store = await this.getStore(STUDENT_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve students.');
      request.onsuccess = () => {
        const sortedStudents: Student[] = request.result.sort((a: Student, b: Student) => a.name.localeCompare(b.name));
        resolve(sortedStudents);
      };
    });
  }

  async updateStudent(id: string, updates: StudentFormData): Promise<Student | undefined> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(STUDENT_STORE_NAME, 'readwrite');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onerror = () => reject('Failed to find student to update.');
      getRequest.onsuccess = () => {
        const existingStudent = getRequest.result;
        if (!existingStudent) {
          resolve(undefined);
          return;
        }

        const updatedStudent: Student = {
          ...existingStudent,
          ...updates,
          id: existingStudent.id,
          studentId: existingStudent.studentId, // Ensure original studentId is kept
          modifiedBy: userInfo.id,
          modifiedByUsername: userInfo.username,
          modifiedAt: new Date().toISOString(),
        };

        const putRequest = store.put(updatedStudent);
        putRequest.onerror = () => reject('Failed to update student.');
        putRequest.onsuccess = () => resolve(updatedStudent);
      };
    });
  }

  // --- Class Methods ---

  async addClass(classData: ClassFormData): Promise<Class> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(CLASS_STORE_NAME, 'readwrite');

    const newClass: Class = {
      ...classData,
      classId: `CLS-${Date.now().toString().slice(-6)}`,
      createdBy: userInfo.id,
      createdByUsername: userInfo.username,
      createdAt: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const request = store.add(newClass);
      request.onsuccess = () => resolve(newClass);
      request.onerror = () => reject('Failed to add class.');
    });
  }

  async getClasses(): Promise<Class[]> {
    const store = await this.getStore(CLASS_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve classes.');
      request.onsuccess = () => {
        const sortedClasses: Class[] = request.result.sort((a: Class, b: Class) => a.name.localeCompare(b.name));
        resolve(sortedClasses);
      };
    });
  }

  async getClass(classId: string): Promise<Class | undefined> {
    const store = await this.getStore(CLASS_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(classId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Failed to get class.');
    });
  }

  async updateClass(classId: string, updates: ClassFormData): Promise<Class | undefined> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(CLASS_STORE_NAME, 'readwrite');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(classId);
      getRequest.onerror = () => reject('Failed to find class to update.');
      getRequest.onsuccess = () => {
        const existingClass = getRequest.result;
        if (!existingClass) {
          resolve(undefined);
          return;
        }
        // Ensure studentIds and classId are preserved from original object
        const updatedClass: Class = {
          ...existingClass,
          ...updates,
          classId: existingClass.classId,
          studentIds: existingClass.studentIds,
          modifiedBy: userInfo.id,
          modifiedByUsername: userInfo.username,
          modifiedAt: new Date().toISOString(),
        };
        const putRequest = store.put(updatedClass);
        putRequest.onerror = () => reject('Failed to update class.');
        putRequest.onsuccess = () => resolve(updatedClass);
      };
    });
  }

  async deleteClass(classId: string): Promise<boolean> {
    const store = await this.getStore(CLASS_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(classId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject('Failed to delete class.');
    });
  }

  async assignStudentToClass(studentId: string, classId: string): Promise<void> {
    const store = await this.getStore(CLASS_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(classId);
      getRequest.onerror = () => reject('Failed to find class.');
      getRequest.onsuccess = () => {
        const existingClass = getRequest.result as Class;
        if (!existingClass) {
          reject('Class not found.');
          return;
        }
        if (!existingClass.studentIds.includes(studentId)) {
          existingClass.studentIds.push(studentId);
          const putRequest = store.put(existingClass);
          putRequest.onerror = () => reject('Failed to update class with new student.');
          putRequest.onsuccess = () => resolve();
        } else {
          resolve(); // Student already in class
        }
      };
    });
  }

  async removeStudentFromClass(studentId: string, classId: string): Promise<void> {
    const store = await this.getStore(CLASS_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(classId);
      getRequest.onerror = () => reject('Failed to find class.');
      getRequest.onsuccess = () => {
        const existingClass = getRequest.result as Class;
        if (!existingClass) {
          reject('Class not found.');
          return;
        }
        const initialLength = existingClass.studentIds.length;
        existingClass.studentIds = existingClass.studentIds.filter(id => id !== studentId);
        if (existingClass.studentIds.length < initialLength) {
          const putRequest = store.put(existingClass);
          putRequest.onerror = () => reject('Failed to update class after removing student.');
          putRequest.onsuccess = () => resolve();
        } else {
          resolve(); // Student was not in class
        }
      };
    });
  }

  async updateStudentEnrollments(studentId: string, classIds: string[]): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction(CLASS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(CLASS_STORE_NAME);

    return new Promise((resolve, reject) => {
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => reject('Failed to retrieve classes for enrollment update.');

      getAllRequest.onsuccess = () => {
        const allClasses: Class[] = getAllRequest.result;

        for (const classItem of allClasses) {
          const isEnrolled = classItem.studentIds.includes(studentId);
          const shouldBeEnrolled = classIds.includes(classItem.classId);

          if (isEnrolled && !shouldBeEnrolled) {
            // Remove student
            classItem.studentIds = classItem.studentIds.filter(id => id !== studentId);
            store.put(classItem);
          } else if (!isEnrolled && shouldBeEnrolled) {
            // Add student
            classItem.studentIds.push(studentId);
            store.put(classItem);
          }
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject('Transaction failed during enrollment update.');
    });
  }

  // --- Payment Methods ---

  async addPayment(paymentData: PaymentFormData): Promise<Payment> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(PAYMENT_STORE_NAME, 'readwrite');

    const newPayment: Payment = {
      ...paymentData,
      paymentId: `PAY-${Date.now().toString().slice(-8)}`,
      balance: paymentData.balance || 0,
      currency: paymentData.currency || Currency.USD,
      balanceCurrency: paymentData.balanceCurrency || paymentData.currency || Currency.USD,
      createdBy: userInfo.id,
      createdByUsername: userInfo.username,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(newPayment);
      request.onsuccess = () => resolve(newPayment);
      request.onerror = () => reject('Failed to add payment.');
    });
  }

  async getAllPayments(): Promise<Payment[]> {
    const store = await this.getStore(PAYMENT_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve payments.');
      request.onsuccess = () => {
        const payments: Payment[] = request.result.sort((a: Payment, b: Payment) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        resolve(payments);
      };
    });
  }

  async getPaymentsForClient(clientId: string): Promise<Payment[]> {
    const store = await this.getStore(PAYMENT_STORE_NAME, 'readonly');
    const index = store.index('clientId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(clientId);
      request.onerror = () => reject('Failed to retrieve payments for client.');
      request.onsuccess = () => {
        const payments: Payment[] = request.result.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        resolve(payments);
      };
    });
  }

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const store = await this.getStore(PAYMENT_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(paymentId);
      getRequest.onerror = () => reject('Failed to find payment to update.');
      getRequest.onsuccess = () => {
        const existingPayment = getRequest.result;
        if (!existingPayment) {
          resolve(undefined);
          return;
        }
        const updatedPayment: Payment = { ...existingPayment, ...updates };
        const putRequest = store.put(updatedPayment);
        putRequest.onerror = () => reject('Failed to update payment.');
        putRequest.onsuccess = () => resolve(updatedPayment);
      };
    });
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    const store = await this.getStore(PAYMENT_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(paymentId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject('Failed to delete payment.');
    });
  }

  // --- Expenditure Methods ---

  async addExpenditure(expenditureData: ExpenditureFormData): Promise<Expenditure> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(EXPENDITURE_STORE_NAME, 'readwrite');

    const newExpenditure: Expenditure = {
      ...expenditureData,
      expenditureId: `EXP-${Date.now().toString().slice(-8)}`,
      currency: expenditureData.currency || Currency.USD,
      createdBy: userInfo.id,
      createdByUsername: userInfo.username,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(newExpenditure);
      request.onsuccess = () => resolve(newExpenditure);
      request.onerror = () => reject('Failed to add expenditure.');
    });
  }

  async getAllExpenditures(): Promise<Expenditure[]> {
    const store = await this.getStore(EXPENDITURE_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve expenditures.');
      request.onsuccess = () => {
        const expenditures: Expenditure[] = request.result.sort((a: Expenditure, b: Expenditure) => new Date(b.expenditureDate).getTime() - new Date(a.expenditureDate).getTime());
        resolve(expenditures);
      };
    });
  }

  async updateExpenditure(expenditureId: string, updates: Partial<Expenditure>): Promise<Expenditure | undefined> {
    const store = await this.getStore(EXPENDITURE_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(expenditureId);
      getRequest.onerror = () => reject('Failed to find expenditure to update.');
      getRequest.onsuccess = () => {
        const existingExpenditure = getRequest.result;
        if (!existingExpenditure) {
          resolve(undefined);
          return;
        }
        const updatedExpenditure: Expenditure = { ...existingExpenditure, ...updates };
        const putRequest = store.put(updatedExpenditure);
        putRequest.onerror = () => reject('Failed to update expenditure.');
        putRequest.onsuccess = () => resolve(updatedExpenditure);
      };
    });
  }

  async deleteExpenditure(expenditureId: string): Promise<boolean> {
    const store = await this.getStore(EXPENDITURE_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(expenditureId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject('Failed to delete expenditure.');
    });
  }

  // --- Communication Methods ---

  async addCommunication(communicationData: CommunicationFormData): Promise<Communication> {
    // Get user info BEFORE opening transaction
    const userInfo = await getCurrentUserInfo();
    const store = await this.getStore(COMMUNICATION_STORE_NAME, 'readwrite');

    const newCommunication: Communication = {
      ...communicationData,
      id: crypto.randomUUID(),
      status: FollowUpStatus.Pending,
      createdAt: new Date().toISOString(),
      createdBy: userInfo.id,
      createdByUsername: userInfo.username,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(newCommunication);
      request.onsuccess = () => {
        const event = new CustomEvent('communicationUpdated', { bubbles: true, composed: true });
        document.dispatchEvent(event);
        resolve(newCommunication);
      };
      request.onerror = () => reject('Failed to add communication.');
    });
  }

  async getAllCommunications(): Promise<Communication[]> {
    const store = await this.getStore(COMMUNICATION_STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject('Failed to retrieve communications.');
      request.onsuccess = () => {
        const communications: Communication[] = request.result.sort(
          (a: Communication, b: Communication) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        resolve(communications);
      };
    });
  }

  async updateCommunication(id: string, updates: Partial<Communication>): Promise<Communication | undefined> {
    const store = await this.getStore(COMMUNICATION_STORE_NAME, 'readwrite');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onerror = () => reject('Failed to find communication to update.');
      getRequest.onsuccess = () => {
        const existingCommunication = getRequest.result;
        if (!existingCommunication) {
          resolve(undefined);
          return;
        }
        const updatedCommunication: Communication = { ...existingCommunication, ...updates };
        const putRequest = store.put(updatedCommunication);
        putRequest.onerror = () => reject('Failed to update communication.');
        putRequest.onsuccess = () => {
          const event = new CustomEvent('communicationUpdated', { bubbles: true, composed: true });
          document.dispatchEvent(event);
          resolve(updatedCommunication);
        };
      };
    });
  }

  async deleteCommunication(id: string): Promise<boolean> {
    const store = await this.getStore(COMMUNICATION_STORE_NAME, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        const event = new CustomEvent('communicationUpdated', { bubbles: true, composed: true });
        document.dispatchEvent(event);
        resolve(true);
      };
      request.onerror = () => reject('Failed to delete communication.');
    });
  }
}
