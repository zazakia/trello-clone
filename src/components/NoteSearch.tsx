import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Calendar, Tag, Book, Clock, Paperclip } from 'lucide-react';
import type { SearchFilters, Notebook, Tag as TagType } from '../types';

interface NoteSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  notebooks: Notebook[];
  tags: TagType[];
  recentSearches?: string[];
  searchSuggestions?: string[];
  className?: string;
}

export function NoteSearch({
  onSearch,
  notebooks,
  tags,
  recentSearches = [],
  searchSuggestions = [],
  className = ''
}: NoteSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const searchRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query, searchFilters: SearchFilters = filters) => {
    onSearch(searchQuery, searchFilters);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchRef.current?.blur();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    handleSearch(query, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    handleSearch(query, {});
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    handleSearch('', {});
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  const suggestions = [
    ...recentSearches.slice(0, 3),
    ...searchSuggestions.slice(0, 5)
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={searchRef}
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {(query || hasActiveFilters) && (
            <button
              onClick={clearSearch}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-r-lg transition-colors ${
              hasActiveFilters 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title="Filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="p-2">
            {recentSearches.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Recent</span>
                </div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => selectSuggestion(search)}
                    className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
            
            {searchSuggestions.length > 0 && (
              <div>
                <div className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-500">
                  <Search className="w-3 h-3" />
                  <span>Suggestions</span>
                </div>
                {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div
          ref={filtersRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Notebook Filter */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Book className="w-4 h-4" />
                <span>Notebook</span>
              </label>
              <select
                value={filters.notebook || ''}
                onChange={(e) => handleFilterChange('notebook', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All notebooks</option>
                {notebooks.map((notebook) => (
                  <option key={notebook.id} value={notebook.id}>
                    {notebook.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md">
                {tags.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={filters.tags?.includes(tag.id) || false}
                          onChange={(e) => {
                            const currentTags = filters.tags || [];
                            const newTags = e.target.checked
                              ? [...currentTags, tag.id]
                              : currentTags.filter(id => id !== tag.id);
                            handleFilterChange('tags', newTags.length > 0 ? newTags : undefined);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-gray-700">{tag.name}</span>
                        <span className="text-xs text-gray-500">({tag.usageCount})</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No tags available
                  </div>
                )}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.[0]?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const startDate = e.target.value ? new Date(e.target.value) : undefined;
                    const endDate = filters.dateRange?.[1];
                    handleFilterChange('dateRange', 
                      startDate || endDate ? [startDate, endDate].filter(Boolean) : undefined
                    );
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateRange?.[1]?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const endDate = e.target.value ? new Date(e.target.value) : undefined;
                    const startDate = filters.dateRange?.[0];
                    handleFilterChange('dateRange', 
                      startDate || endDate ? [startDate, endDate].filter(Boolean) : undefined
                    );
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments || false}
                  onChange={(e) => handleFilterChange('hasAttachments', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Paperclip className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">Has attachments</span>
              </label>

              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isShared || false}
                  onChange={(e) => handleFilterChange('isShared', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Shared notes</span>
              </label>

              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.linkedToCard || false}
                  onChange={(e) => handleFilterChange('linkedToCard', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Linked to cards</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-1">
          {filters.notebook && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Book className="w-3 h-3 mr-1" />
              {notebooks.find(nb => nb.id === filters.notebook)?.name}
              <button
                onClick={() => handleFilterChange('notebook', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.tags && filters.tags.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Tag className="w-3 h-3 mr-1" />
              {filters.tags.length} tag{filters.tags.length > 1 ? 's' : ''}
              <button
                onClick={() => handleFilterChange('tags', undefined)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.dateRange && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Calendar className="w-3 h-3 mr-1" />
              Date range
              <button
                onClick={() => handleFilterChange('dateRange', undefined)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}