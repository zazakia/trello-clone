import React from 'react';
import { Menu, Search, Bell, Kanban, Sparkles } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { useTheme } from '../contexts/ThemeContext';

const themeOrder = ['default','modern','dark','pastel','neoglass'] as const;

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onToggleSidebar,
  className = ""
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className={`
        header fixed top-0 left-0 right-0 h-16 z-20
        flex items-center justify-between px-4
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="btn-secondary p-2 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <Kanban className="w-6 h-6 text-[var(--accent-primary)]" />
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">ProjectFlow</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Mobile theme selector + switch visible on small screens */}
        <div className="flex items-center gap-2">
          <div className="sm:hidden">
            <ThemeSelector />
          </div>
          <button
            onClick={() => {
              const idx = themeOrder.findIndex(t => t === theme);
              const next = themeOrder[(idx + 1) % themeOrder.length];
              setTheme(next as any);
            }}
            className="btn-secondary p-2 rounded-lg"
            title={`Switch theme (current: ${theme})`}
            aria-label="Cycle theme"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <button className="btn-secondary p-2 rounded-lg" aria-label="Search">
          <Search className="w-5 h-5" />
        </button>

        <button className="btn-secondary p-2 rounded-lg relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--error)' }} />
        </button>
      </div>
    </header>
  );
};