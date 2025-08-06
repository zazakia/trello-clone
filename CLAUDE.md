# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server (Vite)
npm run build           # Build for production (TypeScript check + Vite build)
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Note: No test scripts are configured in this project
```

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 
- **Backend**: Supabase (PostgreSQL with real-time features)
- **Drag & Drop**: @hello-pangea/dnd library
- **Icons**: Lucide React

### Data Flow Architecture
This is a Trello clone with a centralized state management pattern:

1. **Global State**: `BoardContext` (src/contexts/BoardContext.tsx) manages all application state using React's useReducer
   - Handles boards, lists, cards, loading states, and errors
   - Provides actions for CRUD operations and drag-and-drop moves
   - State updates trigger re-renders across components

2. **API Layer**: `supabase-api.ts` (src/utils/supabase-api.ts) contains all database operations
   - Organized into `boardAPI`, `listAPI`, and `cardAPI` objects
   - Uses Supabase client for real-time PostgreSQL operations
   - Handles position management for drag-and-drop ordering

3. **Component Hierarchy**:
   - `App.tsx` → Router-like logic for board selection vs board view
   - `BoardSelector.tsx` → Grid of available boards
   - `Board.tsx` → Main drag-and-drop container using @hello-pangea/dnd
   - `List.tsx` → Individual columns containing cards
   - `Card.tsx` → Individual task items

### Database Schema
Three main tables with CASCADE deletion:
- `boards` (id, title, description, timestamps)
- `lists` (id, title, position, board_id, timestamps)  
- `cards` (id, title, description, position, list_id, timestamps)

Positions are managed as integers for drag-and-drop ordering. The database includes stored procedures for bulk position updates.

### Environment Setup
Requires `.env` file with Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Database setup requires running `supabase/schema.sql` in Supabase SQL Editor.

### Key Patterns
- TypeScript interfaces defined in `src/types/index.ts` with separate Create/Update data types
- Error handling through context state with user-friendly messages
- Optimistic updates for drag-and-drop with API sync
- Async imports for code splitting in context actions
- Responsive design with Tailwind CSS utilities