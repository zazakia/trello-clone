# Technical Specifications

## Overview

This document provides detailed technical specifications for the Advanced Project Management Platform, covering architecture, data models, API interfaces, and implementation details.

## Table of Contents

- [System Architecture](#system-architecture)
- [Data Models](#data-models)
- [API Specifications](#api-specifications)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Analytics Engine](#analytics-engine)
- [Notification System](#notification-system)
- [Time Tracking System](#time-tracking-system)
- [Performance Considerations](#performance-considerations)
- [Security Implementation](#security-implementation)
- [Database Schema](#database-schema)
- [Deployment Architecture](#deployment-architecture)

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React App     │◄──►│   Supabase      │◄──►│   PostgreSQL    │
│   (Client-side) │    │   (BaaS)        │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Hosting   │    │   Edge          │    │   Real-time     │
│   Netlify       │    │   Functions     │    │   Subscriptions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend Layer
- **Framework**: React 18.2+ with TypeScript 5.0+
- **Build Tool**: Vite 4.0+ for fast development and builds
- **Styling**: Tailwind CSS v4 for utility-first styling
- **State Management**: React Context API with useReducer
- **Routing**: React Router v6 (future enhancement)
- **Icons**: Lucide React for consistent iconography

#### Backend Layer
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth (OAuth, JWT)
- **API**: Supabase Auto-generated REST API
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for file uploads

#### Deployment & Infrastructure
- **Frontend Hosting**: Netlify with CDN
- **Database Hosting**: Supabase Cloud
- **Domain**: Custom domain with SSL/TLS
- **Monitoring**: Netlify Analytics + Supabase Dashboard

## Data Models

### Core Entities

#### Board
```typescript
interface Board {
  id: string;                    // UUID primary key
  title: string;                 // Board name
  description?: string;          // Optional description
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
  lists?: List[];               // Related lists (populated)
}
```

#### List
```typescript
interface List {
  id: string;                    // UUID primary key
  title: string;                 // List name
  position: number;              // Display order
  board_id: string;             // Foreign key to Board
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
  cards?: Card[];               // Related cards (populated)
}
```

#### Card
```typescript
interface Card {
  id: string;                    // UUID primary key
  title: string;                 // Card title
  description?: string;          // Optional description
  position: number;              // Display order within list
  list_id: string;              // Foreign key to List
  reminder_date?: string;        // ISO timestamp for reminders
  reminder_enabled: boolean;     // Reminder active flag
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}
```

### Extended Project Management Models

#### Project (extends Board)
```typescript
interface Project extends Board {
  startDate: string;             // Project start date
  endDate: string;               // Project end date
  budget?: number;               // Project budget in cents
  actualCost?: number;           // Actual cost in cents
  clientId?: string;             // Reference to client
  projectManager?: string;       // PM user ID
  status: ProjectStatus;         // Current project status
  priority: ProjectPriority;     // Project priority level
  healthScore: number;           // Calculated health score (0-100)
  completionPercentage: number;  // Progress percentage (0-100)
  milestones: Milestone[];       // Project milestones
  teamMembers: TeamMember[];     // Project team
  timeEntries: TimeEntry[];      // Time tracking entries
}

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
```

#### Milestone
```typescript
interface Milestone {
  id: string;                    // UUID primary key
  title: string;                 // Milestone name
  description?: string;          // Optional description
  dueDate: string;              // Due date (ISO timestamp)
  completed: boolean;            // Completion status
  completedDate?: string;        // Completion timestamp
  projectId: string;            // Foreign key to Project
  dependsOn?: string[];         // Dependent milestone IDs
  deliverables: string[];       // List of deliverable items
}
```

#### TeamMember
```typescript
interface TeamMember {
  id: string;                    // UUID primary key
  name: string;                  // Full name
  email: string;                 // Email address
  role: string;                  // Role/title
  hourlyRate?: number;           // Billing rate in cents
  avatar?: string;               // Profile image URL
  skills: string[];              // Skill tags
  workloadPercentage: number;    // Current workload (0-100)
}
```

#### TimeEntry
```typescript
interface TimeEntry {
  id: string;                    // UUID primary key
  cardId: string;               // Related card
  userId: string;               // User who logged time
  projectId: string;            // Related project
  startTime: string;            // Start timestamp (ISO)
  endTime?: string;             // End timestamp (ISO)
  duration: number;             // Duration in minutes
  description?: string;         // Work description
  billable: boolean;            // Billable flag
  rate?: number;                // Hourly rate for this entry
  createdAt: string;            // Creation timestamp
}
```

### Analytics Models

#### ProjectMetrics
```typescript
interface ProjectMetrics {
  totalTasks: number;            // Total task count
  completedTasks: number;        // Completed task count
  overdueTasks: number;          // Overdue task count
  totalHours: number;            // Total logged hours
  budgetUtilization: number;     // Budget usage percentage
  schedulePerformanceIndex: number; // SPI calculation
  costPerformanceIndex: number;  // CPI calculation
  velocity: number;              // Tasks per sprint
  burndownData: BurndownPoint[]; // Chart data points
  riskFactors: RiskFactor[];     // Identified risks
}
```

#### BurndownPoint
```typescript
interface BurndownPoint {
  date: string;                  // Date (YYYY-MM-DD)
  remainingWork: number;         // Tasks remaining
  idealWork: number;             // Ideal tasks remaining
  actualWork: number;            // Actual work completed
}
```

#### RiskFactor
```typescript
interface RiskFactor {
  id: string;                    // UUID primary key
  type: RiskType;               // Risk category
  severity: RiskSeverity;       // Risk severity level
  description: string;          // Risk description
  impact: string;               // Impact description
  mitigation?: string;          // Mitigation strategy
  identifiedDate: string;       // When identified
  resolvedDate?: string;        // When resolved
}

type RiskType = 'schedule' | 'budget' | 'scope' | 'quality' | 'resource';
type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
```

### Notification Models

#### AppNotification
```typescript
interface AppNotification {
  id: string;                    // UUID primary key
  type: NotificationType;        // Notification category
  title: string;                 // Notification title
  message: string;               // Notification content
  cardId?: string;              // Related card (optional)
  boardId?: string;             // Related board (optional)
  listId?: string;              // Related list (optional)
  createdAt: string;            // Creation timestamp
  readAt?: string;              // Read timestamp
  dismissedAt?: string;         // Dismissal timestamp
  snoozedUntil?: string;        // Snooze until timestamp
  priority: NotificationPriority; // Priority level
  actionUrl?: string;           // Action URL (optional)
  metadata?: NotificationMetadata; // Additional data
}

type NotificationType = 'reminder' | 'system' | 'board_activity' | 'mention';
type NotificationPriority = 'low' | 'medium' | 'high';

interface NotificationMetadata {
  reminderDate?: string;
  cardTitle?: string;
  boardTitle?: string;
  listTitle?: string;
}
```

## API Specifications

### Supabase Configuration

#### Tables Schema
```sql
-- Core tables
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  reminder_date TIMESTAMPTZ,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project management extensions
CREATE TABLE projects (
  id UUID PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget INTEGER, -- in cents
  actual_cost INTEGER, -- in cents
  client_id UUID,
  project_manager UUID,
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  health_score INTEGER DEFAULT 100,
  completion_percentage INTEGER DEFAULT 0
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  depends_on UUID[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}'
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- minutes
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  rate INTEGER, -- hourly rate in cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (simplified for demo)
CREATE POLICY "Public access for demo" ON boards FOR ALL USING (true);
CREATE POLICY "Public access for demo" ON lists FOR ALL USING (true);
CREATE POLICY "Public access for demo" ON cards FOR ALL USING (true);
CREATE POLICY "Public access for demo" ON projects FOR ALL USING (true);
CREATE POLICY "Public access for demo" ON milestones FOR ALL USING (true);
CREATE POLICY "Public access for demo" ON time_entries FOR ALL USING (true);
```

### API Endpoints

#### Supabase Auto-generated REST API

**Base URL**: `https://your-project.supabase.co/rest/v1`

#### Boards
```typescript
// GET /boards - List all boards
// GET /boards?select=*,lists(*,cards(*)) - Deep query with relations
// POST /boards - Create new board
// PATCH /boards?id=eq.{id} - Update board
// DELETE /boards?id=eq.{id} - Delete board
```

#### Lists
```typescript
// GET /lists?board_id=eq.{boardId}&order=position - Get lists for board
// POST /lists - Create new list
// PATCH /lists?id=eq.{id} - Update list
// DELETE /lists?id=eq.{id} - Delete list
```

#### Cards
```typescript
// GET /cards?list_id=eq.{listId}&order=position - Get cards for list
// POST /cards - Create new card
// PATCH /cards?id=eq.{id} - Update card
// DELETE /cards?id=eq.{id} - Delete card
```

#### Real-time Subscriptions
```typescript
// Subscribe to board changes
supabase
  .channel('board-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'boards' },
    handleBoardChange
  )
  .subscribe();

// Subscribe to list changes
supabase
  .channel('list-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'lists' },
    handleListChange
  )
  .subscribe();
```

## Component Architecture

### Component Hierarchy

```
App
├── NotificationProvider
├── BoardProvider
└── AppContent
    ├── ReminderManager
    ├── Header
    │   ├── Search
    │   ├── NotificationCenter
    │   └── UserMenu
    └── Main
        ├── BoardSelector
        │   ├── BoardGrid
        │   └── CreateBoardModal
        ├── Board
        │   ├── List[]
        │   │   ├── Card[]
        │   │   │   ├── ReminderPicker
        │   │   │   └── TimeTracker
        │   │   └── AddButton
        │   └── AddButton
        └── ProjectAnalyticsDashboard
            ├── KPIDashboard
            ├── BurndownChart
            ├── TimelineView
            └── TeamPerformance
```

### Component Specifications

#### Board Component
```typescript
interface BoardProps {
  boardId: string;
  searchQuery?: string;
}

// Features:
// - Drag and drop for cards and lists
// - Real-time updates via Supabase subscriptions
// - Search highlighting
// - Context menu actions
// - Keyboard shortcuts
```

#### BurndownChart Component
```typescript
interface BurndownChartProps {
  burndownData: BurndownPoint[];
  projectMetrics: ProjectMetrics;
  sprintName?: string;
  className?: string;
}

// Features:
// - SVG-based interactive chart
// - Ideal vs actual work visualization
// - Hover tooltips with detailed information
// - Responsive design
// - Export functionality
```

#### TimeTracker Component
```typescript
interface TimeTrackerProps {
  cardId: string;
  projectId: string;
  onTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  existingEntries?: TimeEntry[];
  hourlyRate?: number;
  className?: string;
}

// Features:
// - Start/stop/pause timer
// - Session description and billable flag
// - Time history with monetary calculations
// - Export time data
// - Integration with project budgets
```

## State Management

### Context Architecture

#### BoardContext
```typescript
interface BoardState {
  boards: Board[];              // All user boards
  currentBoard: Board | null;   // Currently active board
  loading: boolean;            // Loading state
  error: string | null;        // Error messages
}

type BoardAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Board }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'ADD_LIST'; payload: List }
  | { type: 'UPDATE_LIST'; payload: List }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'MOVE_LIST'; payload: { listId: string; newPosition: number } }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: MoveCardPayload };
```

#### NotificationContext
```typescript
interface NotificationState {
  notifications: AppNotification[];
  settings: NotificationSettings;
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Actions include:
// - addNotification
// - markAsRead
// - dismissNotification
// - snoozeNotification
// - updateSettings
```

### Data Flow Patterns

1. **User Action** → Component Event Handler
2. **Event Handler** → Context Action Dispatch
3. **Action Dispatch** → Reducer State Update
4. **State Update** → Component Re-render
5. **Side Effect** → API Call (Create/Update/Delete)
6. **API Success** → Context State Sync
7. **Real-time Update** → Context State Update

## Analytics Engine

### ProjectAnalyticsService

#### Core Calculations

**Schedule Performance Index (SPI)**
```typescript
calculateSPI(project: Project): number {
  const totalDuration = endDate - startDate;
  const elapsedTime = now - startDate;
  const plannedProgress = Math.min(elapsedTime / totalDuration, 1);
  const actualProgress = project.completionPercentage / 100;
  
  return plannedProgress > 0 ? actualProgress / plannedProgress : 1;
}
```

**Cost Performance Index (CPI)**
```typescript
calculateCPI(project: Project): number {
  if (!project.budget || !project.actualCost) return 1;
  
  const earnedValue = project.budget * (project.completionPercentage / 100);
  return project.actualCost > 0 ? earnedValue / project.actualCost : 1;
}
```

**Project Health Score**
```typescript
calculateHealthScore(project: Project): number {
  let score = 100;
  
  // Schedule performance impact (30%)
  if (spi < 1) score -= (1 - spi) * 30;
  
  // Cost performance impact (25%)
  if (cpi < 1) score -= (1 - cpi) * 25;
  
  // Task completion impact (20%)
  const overduePenalty = Math.min(overdueTaskCount * 2, 20);
  score -= overduePenalty;
  
  // Risk factors impact (25%)
  const riskPenalty = criticalRisks * 15 + highRisks * 10;
  score -= riskPenalty;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

#### Burndown Generation
```typescript
generateBurndownData(project: Project): BurndownPoint[] {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalTasks = getAllCardsFromProject(project).length;
  
  return Array.from({ length: totalDays + 1 }, (_, day) => {
    const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    const idealWork = totalTasks * (1 - day / totalDays);
    const actualWork = calculateActualWork(project, currentDate);
    
    return {
      date: currentDate.toISOString().split('T')[0],
      remainingWork: Math.round(totalTasks - actualWork),
      idealWork: Math.round(idealWork),
      actualWork: Math.round(actualWork)
    };
  });
}
```

### Risk Assessment Algorithm

```typescript
identifyRiskFactors(project: Project): RiskFactor[] {
  const risks: RiskFactor[] = [];
  const metrics = calculateProjectMetrics(project);
  
  // Schedule risks
  if (metrics.schedulePerformanceIndex < 0.8) {
    risks.push({
      id: 'schedule-delay',
      type: 'schedule',
      severity: metrics.schedulePerformanceIndex < 0.6 ? 'critical' : 'high',
      description: 'Project is significantly behind schedule',
      impact: 'Delivery date may be missed, affecting client satisfaction',
      identifiedDate: new Date().toISOString()
    });
  }
  
  // Budget risks
  if (metrics.budgetUtilization > 80) {
    risks.push({
      id: 'budget-overrun',
      type: 'budget',
      severity: metrics.budgetUtilization > 100 ? 'critical' : 'medium',
      description: 'Budget utilization is high',
      impact: 'Project may exceed allocated budget',
      identifiedDate: new Date().toISOString()
    });
  }
  
  // Quality risks
  if (metrics.overdueTasks > 5) {
    risks.push({
      id: 'quality-concerns',
      type: 'quality',
      severity: 'medium',
      description: `${metrics.overdueTasks} tasks are overdue`,
      impact: 'Quality may be compromised due to time pressure',
      identifiedDate: new Date().toISOString()
    });
  }
  
  return risks;
}
```

## Notification System

### Notification Flow

1. **Event Trigger** → Service Layer
2. **Service Layer** → Notification Creation
3. **Notification Creation** → Context State Update
4. **Context Update** → UI Badge Update
5. **User Interaction** → Notification Actions
6. **Actions** → State Updates (read/dismiss/snooze)

### NotificationService

```typescript
class NotificationService {
  createBoardActivityNotification(
    type: 'card_created' | 'card_moved' | 'list_created',
    details: NotificationDetails
  ): AppNotification {
    // Generate appropriate notification based on activity type
    // Include metadata for rich display
    // Set appropriate priority level
    // Return formatted notification object
  }
  
  createReminderNotification(
    cardTitle: string,
    reminderDate: string,
    cardId: string,
    boardId: string
  ): AppNotification {
    // Create time-based reminder notification
    // Set high priority for due reminders
    // Include action URLs for quick access
  }
  
  isQuietHours(settings: NotificationSettings): boolean {
    // Check if current time falls within quiet hours
    // Handle overnight quiet periods
    // Return boolean for notification suppression
  }
}
```

### Browser Notification Integration

```typescript
// Request permission
const permission = await Notification.requestPermission();

// Show notification
if (permission === 'granted') {
  new Notification(title, {
    body: message,
    icon: '/favicon.ico',
    tag: `reminder-${cardId}`,
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Card' },
      { action: 'snooze', title: 'Snooze 15m' }
    ]
  });
}
```

## Time Tracking System

### Timer Implementation

```typescript
class TimeTracker {
  private startTime: Date | null = null;
  private elapsedTime: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  
  start(): void {
    this.startTime = new Date();
    this.intervalId = setInterval(() => {
      if (this.startTime) {
        this.elapsedTime = Date.now() - this.startTime.getTime();
        this.updateDisplay();
      }
    }, 1000);
  }
  
  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  stop(): TimeEntry {
    this.pause();
    
    if (!this.startTime) throw new Error('Timer not started');
    
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000 / 60);
    
    return {
      cardId: this.cardId,
      projectId: this.projectId,
      userId: this.userId,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      description: this.description,
      billable: this.billable,
      rate: this.hourlyRate
    };
  }
}
```

### Cost Calculation

```typescript
calculateProjectCosts(timeEntries: TimeEntry[]): CostAnalysis {
  const billableEntries = timeEntries.filter(entry => entry.billable);
  const totalBillableHours = billableEntries.reduce(
    (sum, entry) => sum + (entry.duration / 60), 0
  );
  
  const totalCost = billableEntries.reduce(
    (sum, entry) => sum + ((entry.duration / 60) * (entry.rate || 0)), 0
  );
  
  const averageRate = totalBillableHours > 0 
    ? totalCost / totalBillableHours 
    : 0;
  
  return {
    totalHours: timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0),
    billableHours: totalBillableHours,
    totalCost,
    averageRate,
    utilizationRate: billableEntries.length / timeEntries.length
  };
}
```

## Performance Considerations

### Optimization Strategies

#### 1. Code Splitting
```typescript
// Lazy load analytics components
const ProjectAnalyticsDashboard = lazy(() => 
  import('./components/ProjectAnalyticsDashboard')
);

// Use Suspense for loading states
<Suspense fallback={<AnalyticsLoading />}>
  <ProjectAnalyticsDashboard project={project} />
</Suspense>
```

#### 2. Memoization
```typescript
// Memoize expensive calculations
const projectMetrics = useMemo(() => 
  projectAnalyticsService.calculateProjectMetrics(project),
  [project]
);

// Memoize callbacks to prevent re-renders
const handleCardUpdate = useCallback((cardId: string, updates: Partial<Card>) => {
  dispatch({ type: 'UPDATE_CARD', payload: { ...currentCard, ...updates } });
}, [currentCard]);
```

#### 3. Virtual Scrolling
```typescript
// For large lists of cards or notifications
const VirtualizedCardList = () => {
  return (
    <FixedSizeList
      height={600}
      itemCount={cards.length}
      itemSize={120}
      itemData={cards}
    >
      {CardItem}
    </FixedSizeList>
  );
};
```

#### 4. Database Query Optimization
```sql
-- Create indexes for common queries
CREATE INDEX idx_cards_list_id_position ON cards(list_id, position);
CREATE INDEX idx_lists_board_id_position ON lists(board_id, position);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
```

### Bundle Size Optimization

- **Tree Shaking**: Import only used Lucide icons
- **Code Splitting**: Lazy load heavy components
- **Bundle Analysis**: Regular bundle size monitoring
- **Image Optimization**: WebP format with fallbacks
- **CSS Purging**: Remove unused Tailwind classes

## Security Implementation

### Authentication & Authorization

```typescript
// Supabase Auth integration
const { data: user } = await supabase.auth.getUser();

// Row Level Security policies
CREATE POLICY "Users can only see their own data" 
ON boards FOR ALL 
USING (user_id = auth.uid());
```

### Input Validation

```typescript
// Zod schema validation
const CardSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  position: z.number().int().min(0),
  list_id: z.string().uuid()
});

// API request validation
const validateCardUpdate = (data: unknown): Card => {
  return CardSchema.parse(data);
};
```

### XSS Prevention

```typescript
// Content sanitization
import DOMPurify from 'dompurify';

const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content);
};

// Safe HTML rendering
<div dangerouslySetInnerHTML={{ 
  __html: sanitizeContent(card.description) 
}} />
```

### CSRF Protection

- **SameSite Cookies**: Set to 'strict' for session cookies
- **CORS Configuration**: Restrict origins in production
- **Request Validation**: Validate all state-changing requests

## Database Schema

### Complete Schema Definition

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core entities
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID, -- For multi-user support
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  reminder_date TIMESTAMPTZ,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project management extensions
CREATE TABLE projects (
  id UUID PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget INTEGER, -- cents
  actual_cost INTEGER, -- cents
  client_id UUID,
  project_manager UUID,
  status VARCHAR(20) DEFAULT 'planning',
  priority VARCHAR(20) DEFAULT 'medium',
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  depends_on UUID[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}'
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100),
  hourly_rate INTEGER, -- cents per hour
  avatar TEXT,
  skills TEXT[] DEFAULT '{}',
  workload_percentage INTEGER DEFAULT 0 CHECK (workload_percentage >= 0 AND workload_percentage <= 100)
);

CREATE TABLE project_team_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, team_member_id)
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- minutes
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  rate INTEGER, -- cents per hour
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  priority VARCHAR(20) DEFAULT 'medium',
  action_url TEXT,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_lists_board_id_position ON lists(board_id, position);
CREATE INDEX idx_cards_list_id_position ON cards(list_id, position);
CREATE INDEX idx_cards_reminder_date ON cards(reminder_date) WHERE reminder_enabled = TRUE;
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type_user ON notifications(type, user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for position management
CREATE OR REPLACE FUNCTION update_positions_after_move()
RETURNS TRIGGER AS $$
BEGIN
  -- Update positions when a card is moved
  IF TG_TABLE_NAME = 'cards' THEN
    IF OLD.list_id != NEW.list_id OR OLD.position != NEW.position THEN
      -- Reposition cards in both old and new lists
      UPDATE cards 
      SET position = position - 1 
      WHERE list_id = OLD.list_id AND position > OLD.position;
      
      UPDATE cards 
      SET position = position + 1 
      WHERE list_id = NEW.list_id AND position >= NEW.position AND id != NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Storage for file attachments (future enhancement)
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', FALSE);

-- RLS Policies (simplified for demo)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Demo policies (allow all for simplicity)
CREATE POLICY "Allow all operations" ON boards FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations" ON lists FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations" ON cards FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations" ON projects FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations" ON time_entries FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations" ON notifications FOR ALL USING (TRUE);
```

## Deployment Architecture

### Production Environment

```yaml
# Netlify configuration (netlify.toml)
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NODE_ENV = "production"
```

### Environment Variables

```bash
# Production Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### Monitoring & Analytics

- **Error Tracking**: Sentry integration for error monitoring
- **Performance**: Lighthouse CI for performance monitoring
- **Analytics**: Netlify Analytics for traffic analysis
- **Uptime**: StatusPage for service status monitoring

### Backup & Recovery

- **Database Backups**: Automated daily backups via Supabase
- **Point-in-time Recovery**: Available through Supabase
- **Code Repository**: GitHub with branch protection
- **Deployment Rollback**: Netlify deployment history

---

This technical specification provides comprehensive documentation for the Advanced Project Management Platform, covering all aspects from data models to deployment architecture. The specification serves as a reference for developers, system administrators, and stakeholders involved in the project.