import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check if user has a theme preference in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('walletwise_theme');
    return savedTheme === 'dark';
  });

  // Update the theme when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('walletwise_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('walletwise_theme', 'light');
    }
  }, [darkMode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}
