import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'default', name: 'Default' },
    { id: 'modern', name: 'Modern' },
    { id: 'dark', name: 'Dark' }
  ];

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Palette className="w-4 h-4 text-gray-500" />
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ThemeSelector;