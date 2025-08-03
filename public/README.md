# Trello Clone - Advanced Project Management Platform

A comprehensive project management platform designed specifically for software and IT services businesses, combining intuitive Kanban-style boards with enterprise-grade analytics and client management capabilities.

## 🌟 Live Demo

**[https://t.zapweb.app](https://t.zapweb.app)**

## 📋 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Guide](#user-guide)
- [Analytics & Reporting](#analytics--reporting)
- [Time Tracking](#time-tracking)
- [Notifications](#notifications)
- [Deployment](#deployment)
- [Technical Stack](#technical-stack)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎯 **Core Project Management**
- **Kanban Boards**: Drag-and-drop task management with real-time updates
- **Smart Cards**: Rich task cards with descriptions, due dates, and reminders
- **List Management**: Customizable workflow columns with position management
- **Search & Filter**: Global search across boards, lists, and cards with highlighting

### 📊 **Advanced Analytics Dashboard**
- **Burndown Charts**: Visual sprint progress tracking with ideal vs actual work lines
- **KPI Dashboard**: Real-time project health metrics with trend indicators
- **Project Health Score**: Automated 0-100 scoring based on multiple performance factors
- **Risk Assessment**: Automated identification of schedule, budget, and quality risks

### ⏱️ **Professional Time Tracking**
- **Integrated Timer**: Built-in start/stop/pause timer for accurate time logging
- **Billable Hours**: Track billable vs non-billable time with configurable hourly rates
- **Session History**: Detailed time logs with descriptions and monetary values
- **Budget Monitoring**: Real-time cost tracking and project value calculations

### 🔔 **Smart Notifications**
- **Notification Center**: Comprehensive in-app notification management
- **Reminder System**: Card-based reminders with browser notifications
- **Activity Tracking**: Board activity notifications with smart filtering
- **Snooze & Actions**: Mark read, dismiss, or snooze notifications

### 📈 **Business Intelligence**
- **Schedule Performance Index (SPI)**: Track on-time delivery metrics
- **Cost Performance Index (CPI)**: Monitor budget efficiency and utilization
- **Team Performance**: Individual utilization rates and efficiency monitoring
- **Export Capabilities**: JSON export for external reporting and analysis

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase** account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zazakia/trello-clone.git
   cd trello-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Go to your Supabase project dashboard
   - Run the SQL scripts in order:
     - `supabase/schema.sql` (creates tables)
     - `supabase/add_reminders_migration.sql` (adds reminder features)
     - `supabase/seed.sql` (optional: sample data)

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── analytics/       # Analytics and reporting components
│   │   ├── BurndownChart.tsx
│   │   ├── KPIDashboard.tsx
│   │   └── ProjectAnalyticsDashboard.tsx
│   ├── boards/          # Board management components
│   │   ├── Board.tsx
│   │   ├── BoardSelector.tsx
│   │   └── List.tsx
│   ├── cards/           # Card-related components
│   │   ├── Card.tsx
│   │   ├── ReminderPicker.tsx
│   │   └── TimeTracker.tsx
│   ├── notifications/   # Notification system
│   │   ├── NotificationCenter.tsx
│   │   └── ReminderManager.tsx
│   └── ui/              # Reusable UI components
│       ├── AddButton.tsx
│       └── Header.tsx
├── contexts/            # React context providers
│   ├── BoardContext.tsx
│   └── NotificationContext.tsx
├── hooks/               # Custom React hooks
│   ├── useBoard.ts
│   ├── useBoardNotifications.ts
│   └── useNotifications.ts
├── services/            # Business logic and API calls
│   ├── notificationService.ts
│   ├── projectAnalyticsService.ts
│   └── reminderService.ts
├── types/               # TypeScript type definitions
│   └── index.ts
└── utils/               # Utility functions
    └── supabase-api.ts
```

## 📖 User Guide

### Basic Board Management

1. **Creating Boards**
   - Click "Create" in the header
   - Enter board title and optional description
   - Your new board appears in the board selector

2. **Managing Lists**
   - Click "+ Add another list" to create columns
   - Drag lists to reorder them
   - Use the three-dot menu to edit or delete lists

3. **Working with Cards**
   - Click "+ Add a card" to create tasks
   - Drag cards between lists to update status
   - Click cards to edit details, set reminders, or track time

### Advanced Features

4. **Search & Navigation**
   - Use the global search bar to find content across all boards
   - Search results highlight matching text
   - Navigate between boards using the board selector

5. **Reminders**
   - Click the bell icon on any card
   - Set reminder date and time
   - Receive browser notifications when reminders are due

## 📊 Analytics & Reporting

### Accessing Analytics

1. **Open Analytics Dashboard**
   - Navigate to any board
   - Click the blue "Analytics" button in the header
   - Explore different tabs: Overview, Burndown, Timeline, Team

### Key Metrics

- **Schedule Performance Index (SPI)**: Measures project timeline adherence
  - `SPI = 1.0` = On schedule
  - `SPI > 1.0` = Ahead of schedule  
  - `SPI < 1.0` = Behind schedule

- **Cost Performance Index (CPI)**: Tracks budget efficiency
  - `CPI = 1.0` = On budget
  - `CPI > 1.0` = Under budget
  - `CPI < 1.0` = Over budget

- **Project Health Score**: Automated scoring (0-100) based on:
  - Schedule performance
  - Budget utilization
  - Task completion rates
  - Risk factors

### Burndown Charts

- **Ideal Line**: Planned work completion rate
- **Actual Line**: Real progress tracking
- **Data Points**: Interactive hover for detailed information
- **Velocity**: Average tasks completed per sprint

### Risk Assessment

The system automatically identifies risks:
- **Schedule Risks**: When SPI < 0.8
- **Budget Risks**: When budget utilization > 80%
- **Quality Risks**: When overdue tasks > 5

## ⏱️ Time Tracking

### Using the Timer

1. **Start Tracking**
   - Open any card
   - Click the "Start" button in the time tracker
   - Optionally add a description of your work

2. **Managing Sessions**
   - Pause and resume as needed
   - Mark time as billable or non-billable
   - Set hourly rates for automatic cost calculation

3. **Time History**
   - View all logged sessions
   - See total time, billable hours, and project value
   - Export time data for invoicing

### Billable Hours

- Configure different rates per team member
- Automatically calculate project costs
- Track budget utilization in real-time
- Generate reports for client billing

## 🔔 Notifications

### Notification Types

1. **Reminder Notifications**: Card due date alerts
2. **Board Activity**: Task creation, updates, and movements
3. **System Notifications**: Welcome messages and updates

### Managing Notifications

- **Notification Center**: Click the bell icon in header
- **Actions**: Mark read, dismiss, or snooze (15m/1h)
- **Settings**: Control notification types and quiet hours
- **Filters**: View all, unread only, or by type

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   - Add `VITE_SUPABASE_URL` in Netlify settings
   - Add `VITE_SUPABASE_ANON_KEY` in Netlify settings

3. **Deploy**
   - Push to main branch for automatic deployments
   - Or use `netlify deploy --prod --dir=dist`

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy the dist folder to your hosting provider
```

## 🛠️ Technical Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS v4**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons

### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Secure, scalable data access patterns
- **Real-time Updates**: Live collaboration features

### Libraries
- **@hello-pangea/dnd**: Drag and drop functionality
- **Date/Time**: Native browser APIs for scheduling
- **Notifications**: Browser Notification API

### Development Tools
- **ESLint**: Code linting and style enforcement
- **TypeScript Compiler**: Type checking and compilation
- **Vite Dev Server**: Hot module replacement and fast development

## 🏗️ Architecture

### Data Flow
1. **React Context**: Centralized state management with useReducer
2. **API Layer**: Supabase client for database operations
3. **Real-time Updates**: Automatic UI updates via Supabase subscriptions
4. **Analytics Engine**: Client-side calculation of project metrics

### Component Architecture
- **Container Components**: Handle data fetching and state management
- **Presentation Components**: Pure UI components with props
- **Custom Hooks**: Reusable business logic and state management
- **Service Layer**: Business logic separated from UI components

### State Management
- **BoardContext**: Global board and project state
- **NotificationContext**: Notification system state
- **Local Component State**: UI-specific state (modals, forms)

## 📈 Performance Optimizations

- **Code Splitting**: Lazy loading of analytics components
- **Memoization**: Optimized re-renders with useCallback and useMemo
- **Efficient Updates**: Granular state updates to minimize re-renders
- **Image Optimization**: Optimized assets and lazy loading

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user input and content
- **HTTPS**: Secure communication with SSL/TLS

## 🧪 Testing

### Running Tests
```bash
# Unit tests (when implemented)
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing Strategy
- **Component Testing**: React Testing Library for UI components
- **Integration Testing**: API integration and user workflows
- **Type Safety**: TypeScript for compile-time error detection

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use existing component patterns
- Add proper error handling
- Update documentation for new features
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase**: For providing excellent backend-as-a-service
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For beautiful, consistent icons
- **React Community**: For excellent tools and libraries

## 📞 Support

- **Documentation**: Check this README and `SPECS.md`
- **Issues**: [GitHub Issues](https://github.com/zazakia/trello-clone/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zazakia/trello-clone/discussions)

---

**Built with ❤️ for modern project management**