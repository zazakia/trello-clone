# Design Document

## Overview

The note-taking integration extends the existing Trello Clone platform with comprehensive note management capabilities. The design leverages the current React/TypeScript/Supabase architecture while adding new components, database tables, and services to support rich-text notes, organization features, and seamless integration with existing Kanban boards.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Notes UI      │    │   Board UI      │    │  Analytics UI   │
│                 │    │                 │    │                 │
│ - NoteEditor    │    │ - Board         │    │ - Dashboard     │
│ - NotesList     │    │ - Card          │    │ - Charts        │
│ - NotebookView  │    │ - List          │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Shared Context │
                    │                 │
                    │ - BoardContext  │
                    │ - NotesContext  │
                    │ - ThemeContext  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Services Layer │
                    │                 │
                    │ - notesService  │
                    │ - searchService │
                    │ - fileService   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Supabase API   │
                    │                 │
                    │ - Database      │
                    │ - Storage       │
                    │ - Real-time     │
                    └─────────────────┘
```

### Database Schema Extensions

```sql
-- Notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content JSONB NOT NULL, -- Rich text content in JSON format
  plain_text TEXT, -- Searchable plain text version
  notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- Future user management
  is_shared BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0
);

-- Notebooks table
CREATE TABLE notebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note_count INTEGER DEFAULT 0
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  usage_count INTEGER DEFAULT 0
);

-- Note-Tag junction table
CREATE TABLE note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Note-Card links table
CREATE TABLE note_card_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, card_id)
);

-- Note attachments table
CREATE TABLE note_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note sharing table
CREATE TABLE note_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL, -- Future user system
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Components and Interfaces

### Core Components

#### 1. NotesLayout Component
```typescript
interface NotesLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  showNotebooks?: boolean;
}

// Provides the main layout for notes section with sidebar and content area
```

#### 2. NoteEditor Component
```typescript
interface NoteEditorProps {
  noteId?: string;
  initialContent?: any;
  onSave: (content: any, title: string) => Promise<void>;
  onCancel: () => void;
  linkedCardId?: string;
  notebookId?: string;
}

// Rich text editor using a library like TipTap or Quill
// Supports formatting, images, attachments, and real-time saving
```

#### 3. NotesList Component
```typescript
interface NotesListProps {
  notes: Note[];
  selectedNoteId?: string;
  onNoteSelect: (noteId: string) => void;
  onNoteDelete: (noteId: string) => void;
  viewMode: 'list' | 'grid' | 'compact';
  searchQuery?: string;
  filterBy?: {
    notebook?: string;
    tags?: string[];
    dateRange?: [Date, Date];
  };
}

// Displays notes with search highlighting and filtering
```

#### 4. NotebookSidebar Component
```typescript
interface NotebookSidebarProps {
  notebooks: Notebook[];
  selectedNotebookId?: string;
  onNotebookSelect: (notebookId: string) => void;
  onNotebookCreate: (name: string, description?: string) => void;
  onNotebookEdit: (id: string, updates: Partial<Notebook>) => void;
  onNotebookDelete: (id: string) => void;
}

// Sidebar for notebook navigation and management
```

#### 5. TagManager Component
```typescript
interface TagManagerProps {
  availableTags: Tag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onTagCreate: (name: string, color?: string) => void;
}

// Tag selection and creation interface
```

#### 6. NoteSearch Component
```typescript
interface NoteSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  recentSearches: string[];
  searchSuggestions: string[];
}

// Advanced search with filters and suggestions
```

### Integration Components

#### 7. CardNotesPanel Component
```typescript
interface CardNotesPanelProps {
  cardId: string;
  linkedNotes: Note[];
  onLinkNote: (noteId: string) => void;
  onUnlinkNote: (noteId: string) => void;
  onCreateLinkedNote: () => void;
}

// Panel within card modal showing linked notes
```

#### 8. QuickNoteCapture Component
```typescript
interface QuickNoteCaptureProps {
  onSave: (title: string, content: string, tags?: string[]) => void;
  defaultNotebook?: string;
  linkedCardId?: string;
}

// Quick note creation from anywhere in the app
```

## Data Models

### Core Types

```typescript
interface Note {
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
  tags: Tag[];
  attachments: NoteAttachment[];
  linkedCards: Card[];
}

interface Notebook {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
  notes?: Note[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

interface NoteAttachment {
  id: string;
  noteId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface SearchFilters {
  notebook?: string;
  tags?: string[];
  dateRange?: [Date, Date];
  hasAttachments?: boolean;
  isShared?: boolean;
}

interface SearchResult {
  note: Note;
  highlights: string[];
  relevanceScore: number;
}
```

## Error Handling

### Error Types
```typescript
enum NotesErrorType {
  NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
  NOTEBOOK_NOT_FOUND = 'NOTEBOOK_NOT_FOUND',
  SAVE_FAILED = 'SAVE_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  SEARCH_FAILED = 'SEARCH_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

interface NotesError {
  type: NotesErrorType;
  message: string;
  details?: any;
}
```

### Error Handling Strategy
- **Graceful Degradation**: Notes continue to work even if some features fail
- **Auto-save Recovery**: Recover unsaved content from localStorage
- **Offline Support**: Cache notes for offline viewing
- **User Feedback**: Clear error messages with suggested actions
- **Retry Logic**: Automatic retry for network-related failures

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for all note components
- **Service Testing**: Jest tests for notes service functions
- **Utility Testing**: Search, formatting, and validation utilities
- **Hook Testing**: Custom hooks for notes management

### Integration Testing
- **Database Operations**: Test CRUD operations with test database
- **File Upload**: Test attachment upload and retrieval
- **Real-time Updates**: Test collaborative editing scenarios
- **Search Functionality**: Test search accuracy and performance

### End-to-End Testing
- **Note Creation Flow**: Complete note creation and editing workflow
- **Organization Features**: Notebook and tag management
- **Integration Points**: Note-to-card linking functionality
- **Mobile Experience**: Responsive design and touch interactions

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Load note content only when needed
- **Virtual Scrolling**: Handle large note lists efficiently
- **Search Indexing**: Pre-index note content for fast search
- **Image Optimization**: Compress and resize uploaded images
- **Caching**: Cache frequently accessed notes and notebooks

### Scalability
- **Pagination**: Implement pagination for large note collections
- **Database Indexing**: Optimize database queries with proper indexes
- **CDN Integration**: Serve attachments through CDN
- **Background Processing**: Handle heavy operations asynchronously

## Security Considerations

### Data Protection
- **Input Sanitization**: Sanitize rich text content to prevent XSS
- **File Validation**: Validate uploaded files for type and size
- **Access Control**: Implement proper permission checking
- **Data Encryption**: Encrypt sensitive note content

### Privacy Features
- **Sharing Controls**: Granular sharing permissions
- **Audit Trail**: Track note access and modifications
- **Data Export**: Allow users to export their data
- **Deletion**: Secure deletion of notes and attachments