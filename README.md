# Trello Clone

A modern Trello clone built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- ✅ Create, edit, and delete boards
- ✅ Create, edit, and delete lists within boards
- ✅ Create, edit, and delete cards within lists
- ✅ Drag and drop cards between lists
- ✅ Drag and drop lists to reorder them
- ✅ Real-time data persistence with Supabase
- ✅ Responsive design that works on desktop and mobile
- ✅ Clean, modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd trello-clone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the contents of `supabase/schema.sql` to create the tables and functions
4. Optionally, run `supabase/seed.sql` to add sample data

### 5. Start the development server

```bash
npm run dev
```

## Database Schema

The application uses three main tables:

- **boards**: Store board information (title, description)
- **lists**: Store lists within boards (title, position, board_id)
- **cards**: Store cards within lists (title, description, position, list_id)

## Project Structure

```
src/
├── components/          # React components
│   ├── Board.tsx       # Main board container with drag-drop
│   ├── List.tsx        # List component with cards
│   ├── Card.tsx        # Individual card component
│   ├── Header.tsx      # App header
│   ├── AddButton.tsx   # Reusable add button component
│   └── BoardSelector.tsx # Board selection screen
├── contexts/           # React context providers
│   └── BoardContext.tsx # Global state management
├── types/              # TypeScript type definitions
│   └── index.ts        # Board, List, Card interfaces
├── utils/              # Utility functions
│   └── supabase-api.ts # Supabase API functions
├── lib/                # External library configurations
│   └── supabase.ts     # Supabase client setup
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

This app can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages. Make sure to set your environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
