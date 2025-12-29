
// FIX: Removed self-import which caused declaration conflicts. A file cannot import types from itself.
export enum ServiceType {
  LanguageTraining = "Language Training",
  DocTranslation = "Doc Translation",
  Interpretation = "Interpretation",
}

export enum ContactMethod {
  Phone = "Phone",
  InPerson = "In-Person",
  Mail = "Mail",
  WhatsApp = "WhatsApp",
  Facebook = "FB",
  Instagram = "IG",
  TikTok = "TikTok",
}

export enum FollowUpStatus {
  Pending = 'Pending',
  Completed = 'Completed',
}

export enum CommunicationType {
  ProspectFollowUp = 'prospect-followup',
  General = 'general'
}

export enum CommunicationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export interface Communication {
  id: string;
  type: CommunicationType;
  title: string;
  description: string;
  prospectId?: string; // Required for prospect-followup, undefined for general
  assignedTo: string; // Username or 'Everyone'
  dueDate: string;
  status: FollowUpStatus;
  priority: CommunicationPriority;
  createdAt: string;
  createdBy: string;
  createdByUsername: string;
  outcome?: string;
}

export interface CommunicationFormData {
  type: CommunicationType;
  title: string;
  description: string;
  prospectId?: string;
  assignedTo: string;
  dueDate: string;
  priority: CommunicationPriority;
}

export enum Currency {
  USD = 'USD',
  UGX = 'UGX',
  EUR = 'EUR',
  GBP = 'GBP',
  KES = 'KES', // Kenyan Shilling
  TZS = 'TZS', // Tanzanian Shilling
  RWF = 'RWF', // Rwandan Franc
  ZAR = 'ZAR', // South African Rand
  NGN = 'NGN', // Nigerian Naira
  GHS = 'GHS', // Ghanaian Cedi
  JPY = 'JPY', // Japanese Yen
  CNY = 'CNY', // Chinese Yuan
  INR = 'INR', // Indian Rupee
  AUD = 'AUD', // Australian Dollar
  CAD = 'CAD', // Canadian Dollar
}

export enum ProspectStatus {
  Inquired = 'Inquired',
  Converted = 'Converted',
}

export enum HowTheyHeardAboutUs {
  FamilyFriend = 'Family/Friend',
  SignPost = 'Sign Post',
  GoogleSearch = 'Google Search',
  SocialMedia = 'Social Media',
  Other = 'Other',
}

export enum ClassLevel {
  A1_1 = 'A1.1',
  A1_2 = 'A1.2',
  A2_1 = 'A2.1',
  A2_2 = 'A2.2',
  B1_1 = 'B1.1',
  B1_2 = 'B1.2',
  B2_1 = 'B2.1',
  B2_2 = 'B2.2',
  C1_1 = 'C1.1',
  C1_2 = 'C1.2',
  C2_1 = 'C2.1',
  C2_2 = 'C2.2',
}


export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export enum InterpretationDurationUnit {
  Hours = 'Hours',
  Days = 'Days',
}

export enum PaymentMethod {
  Cash = "Cash",
  MobileMoney = "Mobile Money",
  BankTransfer = "Bank Transfer",
}

export enum ExpenditureCategory {
  Rent = "Rent",
  Salaries = "Salaries",
  Utilities = "Utilities",
  Marketing = "Marketing",
  Supplies = "Office Supplies",
  Other = "Other",
}


export const commonEuropeanLanguages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian"
];

export interface Prospect {
  id: string;
  prospectName: string;
  email?: string;
  phone?: string;
  contactMethod: ContactMethod;
  dateOfContact: string; // Using string in YYYY-MM-DD format for simplicity with date inputs
  notes: string;
  serviceInterestedIn: ServiceType;
  status: ProspectStatus;

  // User attribution
  createdBy: string; // User ID
  createdByUsername: string; // Username for display
  modifiedBy?: string; // User ID of last modifier
  modifiedByUsername?: string; // Username of last modifier
  createdAt: string; // ISO timestamp
  modifiedAt?: string; // ISO timestamp

  // Service-specific fields
  trainingLanguages?: string[];
  translationSourceLanguage?: string;
  translationTargetLanguage?: string;

  // Translation completion details
  translationCompletionDate?: string;
  documentTitle?: string;
  numberOfPages?: number;
  translationRatePerPage?: number;
  translationTotalFee?: number;
  translationPageCount?: number;
  translationPaymentReceived?: number;

  // Interpretation completion details
  interpretationCompletionDate?: string;
  subjectOfInterpretation?: string;
  interpretationDuration?: number;
  interpretationDurationUnit?: InterpretationDurationUnit;
  interpretationRate?: number;
  interpretationTotalFee?: number;
  interpretationEventDate?: string;
  interpretationPaymentReceived?: number;
}

export interface FollowUpAction {
  id: string; // A unique identifier for the follow-up action itself
  prospectId: string; // The ID of the prospect this follow-up is for
  dueDate: string; // Using string in YYYY-MM-DD format for consistency
  assignedTo: string; // The user ID this task is assigned to
  notes: string; // Specific instructions or notes for this follow-up
  status: FollowUpStatus;
  outcome?: string; // A description of the result, typically filled out upon completion
}

export interface Student {
  id: string;
  studentId: string; // e.g., "S-001"
  name: string;
  email?: string;
  phone?: string;
  registrationDate: string; // YYYY-MM-DD
  dateOfBirth: string; // Using string in YYYY-MM-DD format
  nationality: string;
  occupation: string;
  address: string;
  motherTongue: string;
  howTheyHeardAboutUs: HowTheyHeardAboutUs;
  howTheyHeardAboutUsOther?: string;
  fees: number;

  // User attribution
  createdBy: string;
  createdByUsername: string;
  modifiedBy?: string;
  modifiedByUsername?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface ClassSchedule {
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g., "10:00"
  endTime: string;   // e.g., "12:00"
}

export interface Class {
  classId: string;
  name: string;
  language: string;
  level: ClassLevel;
  teacherId: string; // For now, just an ID. Could be linked to a Teacher object later.
  schedule: ClassSchedule[];
  studentIds: string[];

  // User attribution
  createdBy: string;
  createdByUsername: string;
  modifiedBy?: string;
  modifiedByUsername?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface Payment {
  paymentId: string;
  payerName: string;
  clientId: string; // Can be prospectId or studentId
  paymentDate: string; // YYYY-MM-DD
  amount: number;
  currency: Currency;
  service: ServiceType;
  balance?: number; // Defaults to 0
  balanceCurrency?: Currency;
  paymentMethod: PaymentMethod;
  notes?: string;

  // User attribution
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
}

export interface Expenditure {
  expenditureId: string;
  payeeName: string;
  expenditureDate: string; // YYYY-MM-DD
  amount: number;
  currency: Currency;
  description: string;
  category: ExpenditureCategory;
  paymentMethod: PaymentMethod;

  // User attribution
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
}

export interface Client {
  id: string; // prospect.id or student.id
  name: string;
  type: 'Prospect' | 'Student';
  service: ServiceType;
  totalFee: number;
}


export interface ProspectFormData {
  prospectName: string;
  email?: string;
  phone?: string;
  contactMethod: ContactMethod;
  dateOfContact: string;
  notes: string;
  serviceInterestedIn: ServiceType;

  // Service-specific fields
  trainingLanguages?: string[];
  translationSourceLanguage?: string;
  translationTargetLanguage?: string;
  interpretationSourceLanguage?: string;
  interpretationTargetLanguage?: string;
}

export interface StudentFormData {
  studentId: string;
  name: string;
  email?: string;
  phone?: string;
  languageOfStudy: string;
  registrationDate: string;
  dateOfBirth: string;
  nationality: string;
  occupation: string;
  address: string;
  motherTongue: string;
  howTheyHeardAboutUs: HowTheyHeardAboutUs;
  howTheyHeardAboutUsOther?: string;
  fees: number;
}

// Represents only the new fields collected during the conversion process
export interface StudentDetailsFormData {
  languageOfStudy: string;
  registrationDate: string;
  dateOfBirth: string;
  nationality: string;
  occupation: string;
  address: string;
  motherTongue: string;
  howTheyHeardAboutUs: HowTheyHeardAboutUs;
  howTheyHeardAboutUsOther?: string;
  fees: number;
}

export interface ClassFormData {
  name: string;
  language: string;
  level: ClassLevel;
  teacherId: string;
  schedule: ClassSchedule[];
  studentIds: string[];
}

export interface FollowUpFormData {
  dueDate: string;
  assignedTo: string;
  notes: string;
}

export interface PaymentFormData {
  payerName: string;
  clientId: string;
  paymentDate: string;
  amount: number;
  currency: Currency;
  service: ServiceType;
  balance?: number;
  balanceCurrency?: Currency;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ExpenditureFormData {
  payeeName: string;
  expenditureDate: string; // YYYY-MM-DD
  amount: number;
  currency: Currency;
  description: string;
  category: ExpenditureCategory;
  paymentMethod: PaymentMethod;
}

export interface SearchCriteria {
  contactMethod: string;
  serviceInterestedIn: string;
  searchTerm: string;
  timeFilter?: 'all' | '24h' | '7d' | '1m' | '3m' | '6m' | '1y' | 'custom';
}

export interface ProspectDataStore {
  addProspect(prospectData: ProspectFormData): Promise<Prospect>;
  getProspect(id: string): Promise<Prospect | undefined>;
  updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect | undefined>;
  updateProspectStatus(id: string, status: ProspectStatus): Promise<Prospect | undefined>;
  deleteProspect(id: string): Promise<boolean>;
  searchProspects(criteria: SearchCriteria): Promise<Prospect[]>;
  getCompletedJobs(): Promise<Prospect[]>;

  // Methods for managing Follow-up Actions
  addFollowUp(followUpData: Omit<FollowUpAction, 'id' | 'status' | 'outcome'>): Promise<FollowUpAction>;
  getFollowUpsForProspect(prospectId: string): Promise<FollowUpAction[]>;
  updateFollowUp(id: string, updates: Partial<Pick<FollowUpAction, 'status' | 'outcome'>>): Promise<FollowUpAction | undefined>;
  deleteFollowUp(id: string): Promise<boolean>;
}

export interface StudentDataStore {
  addStudent(studentData: StudentFormData): Promise<Student>;
  getStudents(): Promise<Student[]>;
  updateStudent(id: string, updates: StudentFormData): Promise<Student | undefined>;
}

export interface ClassDataStore {
  addClass(classData: ClassFormData): Promise<Class>;
  getClasses(): Promise<Class[]>;
  getClass(classId: string): Promise<Class | undefined>;
  updateClass(classId: string, updates: ClassFormData): Promise<Class | undefined>;
  deleteClass(classId: string): Promise<boolean>;
  assignStudentToClass(studentId: string, classId: string): Promise<void>;
  removeStudentFromClass(studentId: string, classId: string): Promise<void>;
  updateStudentEnrollments(studentId: string, classIds: string[]): Promise<void>;
}

export interface PaymentDataStore {
  addPayment(paymentData: PaymentFormData): Promise<Payment>;
  getPaymentsForClient(clientId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment | undefined>;
  deletePayment(paymentId: string): Promise<boolean>;
}

export interface ExpenditureDataStore {
  addExpenditure(expenditureData: ExpenditureFormData): Promise<Expenditure>;
  getAllExpenditures(): Promise<Expenditure[]>;
  updateExpenditure(expenditureId: string, updates: Partial<Expenditure>): Promise<Expenditure | undefined>;
  deleteExpenditure(expenditureId: string): Promise<boolean>;
}
