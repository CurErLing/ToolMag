import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-gray-500 flex items-center p-1 overflow-hidden transition-colors"
      aria-label="Toggle Theme"
    >
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-white dark:bg-neon-purple shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex items-center justify-center border-2 border-black dark:border-none"
        animate={{
          x: isDark ? 32 : 0,
          rotate: isDark ? 360 : 0
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={14} className="text-white" />
        ) : (
          <Sun size={14} className="text-black" />
        )}
      </motion.div>
    </button>
  );
};