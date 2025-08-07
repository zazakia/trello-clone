export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  list_id: string;
  created_at: string;
  updated_at: string;
  reminder_date?: string;
  reminder_enabled?: boolean;
}

export interface List {
  id: string;
  title: string;
  position: number;
  board_id: string;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  lists?: List[];
}

export interface CreateCardData {
  title: string;
  description?: string;
  list_id: string;
  position?: number;
}

export interface CreateListData {
  title: string;
  board_id: string;
  position?: number;
}

export interface CreateBoardData {
  title: string;
  description?: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  position?: number;
  list_id?: string;
  reminder_date?: string | null;
  reminder_enabled?: boolean;
}

export interface UpdateListData {
  title?: string;
  position?: number;
}

export interface UpdateBoardData {
  title?: string;
  description?: string;
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

export interface AppNotification {
  id: string;
  type: 'reminder' | 'system' | 'board_activity' | 'mention';
  title: string;
  message: string;
  cardId?: string;
  boardId?: string;
  listId?: string;
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
  snoozedUntil?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: {
    reminderDate?: string;
    cardTitle?: string;
    boardTitle?: string;
    listTitle?: string;
  };
}

export interface NotificationSettings {
  browserNotifications: boolean;
  emailNotifications: boolean;
  reminderNotifications: boolean;
  boardActivityNotifications: boolean;
  mentionNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

// Project Management Types
export interface Project extends Board {
  startDate: string;
  endDate: string;
  budget?: number;
  actualCost?: number;
  clientId?: string;
  projectManager?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  healthScore: number; // 0-100
  completionPercentage: number; // 0-100
  milestones: Milestone[];
  teamMembers: TeamMember[];
  timeEntries: TimeEntry[];
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  projectId: string;
  dependsOn?: string[]; // milestone IDs
  deliverables: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  hourlyRate?: number;
  avatar?: string;
  skills: string[];
  workloadPercentage: number; // 0-100
}

export interface TimeEntry {
  id: string;
  cardId: string;
  userId: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  description?: string;
  billable: boolean;
  rate?: number;
  createdAt: string;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalHours: number;
  budgetUtilization: number; // percentage
  schedulePerformanceIndex: number; // SPI
  costPerformanceIndex: number; // CPI
  velocity: number; // tasks per sprint
  burndownData: BurndownPoint[];
  riskFactors: RiskFactor[];
}

export interface BurndownPoint {
  date: string;
  remainingWork: number;
  idealWork: number;
  actualWork: number;
}

export interface RiskFactor {
  id: string;
  type: 'schedule' | 'budget' | 'scope' | 'quality' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  mitigation?: string;
  identifiedDate: string;
  resolvedDate?: string;
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  description: string;
  category: 'delivery' | 'quality' | 'budget' | 'team' | 'client';
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  avatar?: string;
  projects: string[]; // project IDs
  totalValue: number;
  satisfactionScore: number; // 1-5
  communicationPreference: 'email' | 'phone' | 'slack' | 'teams';
  timezone: string;
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  goal: string;
  capacity: number; // story points or hours
  status: 'planning' | 'active' | 'completed';
  cards: string[]; // card IDs
  velocity: number;
  burndownData: BurndownPoint[];
}

// Notes and Knowledge Management Types
export interface Note {
  id: string;
  title?: string;
  content: any; // Rich text JSON structure
  plainText: string; // For search indexing
  notebookId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isShared: boolean;
  viewCount: number;
  tags?: Tag[];
  attachments?: NoteAttachment[];
  linkedCards?: Card[];
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
  notes?: Note[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

export interface NoteAttachment {
  id: string;
  noteId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface NoteCardLink {
  id: string;
  noteId: string;
  cardId: string;
  createdAt: string;
}

export interface NoteShare {
  id: string;
  noteId: string;
  sharedWithEmail: string;
  permission: 'view' | 'edit';
  createdAt: string;
}

export interface SearchFilters {
  notebook?: string;
  tags?: string[];
  dateRange?: [Date, Date];
  hasAttachments?: boolean;
  isShared?: boolean;
  linkedToCard?: boolean;
}

export interface SearchResult {
  note: Note;
  highlights: string[];
  relevanceScore: number;
}

export interface CreateNoteData {
  title?: string;
  content: any;
  notebookId?: string;
  tags?: string[];
  linkedCardId?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: any;
  notebookId?: string;
  tags?: string[];
}

export interface CreateNotebookData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateNotebookData {
  name?: string;
  description?: string;
  color?: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

// Notes Error Types
export enum NotesErrorType {
  NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
  NOTEBOOK_NOT_FOUND = 'NOTEBOOK_NOT_FOUND',
  TAG_NOT_FOUND = 'TAG_NOT_FOUND',
  SAVE_FAILED = 'SAVE_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  SEARCH_FAILED = 'SEARCH_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_CONTENT = 'INVALID_CONTENT'
}

export interface NotesError {
  type: NotesErrorType;
  message: string;
  details?: any;
}

// Rich Text Editor Types
export interface EditorContent {
  type: 'doc';
  content: EditorNode[];
}

export interface EditorNode {
  type: string;
  attrs?: Record<string, any>;
  content?: EditorNode[];
  text?: string;
  marks?: EditorMark[];
}

export interface EditorMark {
  type: string;
  attrs?: Record<string, any>;
}