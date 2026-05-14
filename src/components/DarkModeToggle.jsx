import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sand-100 dark:bg-navy-800 hover:bg-sand-200 dark:hover:bg-navy-700 text-navy-800 dark:text-sand-100 transition"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <>
          <FiSun className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <FiMoon className="w-4 h-4 text-navy-600" />
          <span className="text-sm font-semibold hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
};

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return isDark;
};

export default DarkModeToggle;
