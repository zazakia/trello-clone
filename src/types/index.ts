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