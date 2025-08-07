# Project Structure & Architecture

## Folder Organization

```
src/
├── components/           # React components organized by feature
│   ├── AddButton.tsx
│   ├── Board.tsx        # Main Kanban board component
│   ├── BoardSelector.tsx
│   ├── BurndownChart.tsx
│   ├── Card.tsx         # Individual task cards
│   ├── Header.tsx
│   ├── KPIDashboard.tsx
│   ├── List.tsx         # Kanban columns
│   ├── NotificationCenter.tsx
│   ├── ProjectAnalyticsDashboard.tsx
│   ├── ReminderManager.tsx
│   ├── Sidebar.tsx
│   ├── StandardLayout.tsx
│   ├── ThemeSelector.tsx
│   └── TimeTracker.tsx
├── contexts/            # React Context providers
│   ├── BoardContext.tsx      # Main application state
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx
├── hooks/               # Custom React hooks
│   ├── useBoard.ts
│   ├── useBoardNotifications.ts
│   ├── useNotifications.ts
│   └── useSidebar.ts
├── services/            # Business logic and external APIs
│   ├── notificationService.ts
│   ├── projectAnalyticsService.ts
│   └── reminderService.ts
├── types/               # TypeScript type definitions
│   └── index.ts         # All application types
├── utils/               # Utility functions
│   └── supabase-api.ts  # Database API layer
├── styles/              # CSS and theme files
│   ├── reset.css
│   └── themes/          # Theme-specific styles
└── lib/                 # External library configurations
    └── supabase.ts      # Supabase client setup
```

## Architecture Patterns

### State Management
- **React Context**: Centralized state with `useReducer` pattern
- **BoardContext**: Main application state for boards, lists, cards
- **Local Component State**: UI-specific state (modals, forms)
- **Custom Hooks**: Reusable business logic and state management

### Component Architecture
- **Container Components**: Handle data fetching and state management
- **Presentation Components**: Pure UI components receiving props
- **Feature-based Organization**: Components grouped by functionality
- **Consistent Naming**: PascalCase for components, camelCase for functions

### Data Flow
1. **API Layer**: Supabase client in `utils/supabase-api.ts`
2. **Context Providers**: Global state management
3. **Custom Hooks**: Business logic abstraction
4. **Components**: UI rendering and user interactions

### TypeScript Conventions
- **Strict Types**: All components and functions fully typed
- **Interface Definitions**: Centralized in `src/types/index.ts`
- **Generic Types**: Used for reusable components and hooks
- **Type Guards**: Runtime type checking where needed

### Styling Approach
- **Tailwind CSS**: Utility-first styling throughout
- **Theme System**: CSS custom properties in theme files
- **Component-specific Styles**: Minimal custom CSS when needed
- **Responsive Design**: Mobile-first approach with breakpoints

### Database Integration
- **Supabase Client**: Configured in `src/lib/supabase.ts`
- **API Abstraction**: Database operations in `utils/supabase-api.ts`
- **Real-time Updates**: Supabase subscriptions for live collaboration
- **Type Safety**: Database types match TypeScript interfaces

## File Naming Conventions
- **Components**: PascalCase (e.g., `BoardSelector.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useBoard.ts`)
- **Services**: camelCase with descriptive suffix (e.g., `notificationService.ts`)
- **Types**: Interfaces in PascalCase, types in camelCase
- **Constants**: UPPER_SNAKE_CASE when applicable

## Import Organization
1. React and external libraries
2. Internal components and hooks
3. Types and interfaces
4. Utilities and services
5. Relative imports last

## Error Handling
- **ErrorBoundary**: React error boundaries for component failures
- **Try-catch**: Async operations wrapped in error handling
- **User Feedback**: Error states displayed in UI
- **Logging**: Console errors for development debugging