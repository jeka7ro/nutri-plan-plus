import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSelector() {
  const { themeMode, setThemeMode } = useTheme();

  const baseBtn =
    'flex items-center justify-center min-w-[2.1rem] h-8 rounded-full text-xs font-medium transition-colors';

  const getClasses = (mode) =>
    `${baseBtn} ${
      themeMode === mode
        ? 'bg-emerald-500 text-white shadow'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-gray-100/80 dark:bg-gray-800/80 ios-glass border border-[rgb(var(--ios-border))]">
      <button
        type="button"
        className={getClasses('auto')}
        onClick={() => setThemeMode('auto')}
        title="Auto (sistem)"
      >
        <span className="text-[0.7rem] leading-none">Auto</span>
      </button>
      <button
        type="button"
        className={getClasses('light')}
        onClick={() => setThemeMode('light')}
        title="Luminos"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        className={getClasses('dark')}
        onClick={() => setThemeMode('dark')}
        title="Întunecat"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}