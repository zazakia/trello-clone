import { useState, useRef } from 'react';
import { Download, Upload, FileText, File, AlertCircle, CheckCircle } from 'lucide-react';
import type { Note, Notebook } from '../types';

interface NotesImportExportProps {
  notes: Note[];
  notebooks: Notebook[];
  onImport: (notes: any[]) => Promise<void>;
  onClose: () => void;
  className?: string;
}

export function NotesImportExport({
  notes,
  notebooks,
  onImport,
  onClose,
  className = ''
}: NotesImportExportProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'html'>('json');
  const [selectedNotebook, setSelectedNotebook] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const notesToExport = selectedNotebook === 'all' 
      ? notes 
      : notes.filter(note => note.notebookId === selectedNotebook);

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify({
          exportDate: new Date().toISOString(),
          notes: notesToExport,
          notebooks: notebooks
        }, null, 2);
        filename = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;

      case 'markdown':
        content = notesToExport.map(note => {
          let md = `# ${note.title || 'Untitled'}\n\n`;
          md += `*Created: ${new Date(note.createdAt).toLocaleDateString()}*\n`;
          md += `*Updated: ${new Date(note.updatedAt).toLocaleDateString()}*\n\n`;
          
          if (note.tags && note.tags.length > 0) {
            md += `**Tags:** ${note.tags.map(tag => `#${tag.name}`).join(', ')}\n\n`;
          }
          
          md += `${note.plainText || ''}\n\n`;
          md += '---\n\n';
          return md;
        }).join('');
        filename = `notes-export-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
        break;

      case 'html':
        content = `
<!DOCTYPE html>
<html>
<head>
    <title>Notes Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .note { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .note-title { color: #333; margin-bottom: 10px; }
        .note-meta { color: #666; font-size: 14px; margin-bottom: 15px; }
        .note-tags { margin-bottom: 15px; }
        .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
        .note-content { line-height: 1.6; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Notes Export</h1>
    <p>Exported on ${new Date().toLocaleDateString()}</p>
    ${notesToExport.map(note => `
        <div class="note">
            <h2 class="note-title">${note.title || 'Untitled'}</h2>
            <div class="note-meta">
                Created: ${new Date(note.createdAt).toLocaleDateString()} | 
                Updated: ${new Date(note.updatedAt).toLocaleDateString()}
            </div>
            ${note.tags && note.tags.length > 0 ? `
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
                </div>
            ` : ''}
            <div class="note-content">${note.plainText || ''}</div>
        </div>
    `).join('')}
</body>
</html>`;
        filename = `notes-export-${new Date().toISOString().split('T')[0]}.html`;
        mimeType = 'text/html';
        break;

      default:
        return;
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);

    try {
      const text = await file.text();
      let importedNotes: any[] = [];

      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        importedNotes = Array.isArray(data) ? data : data.notes || [];
      } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        // Simple markdown parsing
        const sections = text.split('---').filter(section => section.trim());
        importedNotes = sections.map((section, index) => {
          const lines = section.trim().split('\n');
          const title = lines[0]?.replace(/^#\s*/, '') || `Imported Note ${index + 1}`;
          const content = lines.slice(1).join('\n').trim();
          
          return {
            title,
            content: { text: content, type: 'plain' },
            tags: []
          };
        });
      } else {
        throw new Error('Unsupported file format. Please use JSON or Markdown files.');
      }

      if (importedNotes.length === 0) {
        throw new Error('No notes found in the file.');
      }

      await onImport(importedNotes);
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${importedNotes.length} note${importedNotes.length > 1 ? 's' : ''}`
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import notes'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Import & Export Notes</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Export
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Import
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'export' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Notebook
              </label>
              <select
                value={selectedNotebook}
                onChange={(e) => setSelectedNotebook(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Notes ({notes.length})</option>
                {notebooks.map((notebook) => (
                  <option key={notebook.id} value={notebook.id}>
                    {notebook.name} ({notes.filter(n => n.notebookId === notebook.id).length})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mr-2"
                  />
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  <span>JSON (includes all metadata)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="markdown"
                    checked={exportFormat === 'markdown'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mr-2"
                  />
                  <File className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Markdown (readable format)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="html"
                    checked={exportFormat === 'html'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mr-2"
                  />
                  <File className="w-4 h-4 mr-2 text-gray-400" />
                  <span>HTML (web format)</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Notes</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File to Import
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.md,.markdown"
                onChange={handleImport}
                disabled={importing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JSON, Markdown (.md)
              </p>
            </div>

            {importing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Importing notes...</span>
              </div>
            )}

            {importStatus && (
              <div className={`flex items-center space-x-2 p-3 rounded-md ${
                importStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {importStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{importStatus.message}</span>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Import Guidelines</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• JSON files should contain an array of note objects</li>
                <li>• Markdown files will be split by "---" separators</li>
                <li>• Imported notes will be added to your existing collection</li>
                <li>• Large files may take a moment to process</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}