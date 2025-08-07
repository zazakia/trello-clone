# Technology Stack

## Frontend Stack
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast build tool and development server
- **Tailwind CSS v4**: Utility-first CSS framework with custom themes
- **Lucide React**: Icon library for consistent UI elements

## Key Libraries
- **@hello-pangea/dnd**: Drag and drop functionality for Kanban boards
- **@supabase/supabase-js**: Database client and real-time subscriptions
- **framer-motion**: Animation library for smooth UI transitions
- **react-router-dom**: Client-side routing

## Backend & Infrastructure
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Database-level access control
- **Netlify**: Hosting and deployment platform

## Development Tools
- **ESLint**: Code linting with TypeScript support
- **PostCSS**: CSS processing with Tailwind
- **TypeScript Compiler**: Type checking and compilation

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Setup
```bash
cp .env.example .env # Copy environment template
# Update .env with Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Run `supabase/schema.sql` to create tables
2. Run `supabase/add_reminders_migration.sql` for reminder features
3. Optionally run `supabase/seed.sql` for sample data

### Deployment
```bash
npm run build        # Build the application
# Deploy dist/ folder to hosting provider
# Or use Netlify auto-deployment from Git
```

## Build Configuration
- **Vite Config**: Standard React setup with no custom plugins
- **Tailwind Config**: Standard configuration targeting all source files
- **TypeScript**: Strict mode enabled with modern target
- **ESLint**: React hooks and TypeScript rules enabled