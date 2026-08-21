import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  inputBg: string;
  subtleBg: string;
  modalOverlay: string;
  icon: string;
}

export const lightColors: ThemeColors = {
  background: '#f0e9ef',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1a1a2e',
  textMuted: '#6b7280',
  border: '#f3f4f6',
  primary: '#2a067a',
  secondary: '#fa477a',
  accent: '#7fbd78',
  inputBg: '#f9fafb',
  subtleBg: '#fff1f2',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  icon: '#1a1a2e',
};

export const darkColors: ThemeColors = {
  background: '#0f0e17',
  surface: '#1a1b26',
  card: '#242536',
  text: '#fffffe',
  textMuted: '#a7a9be',
  border: '#2e3046',
  primary: '#9d72ff',
  secondary: '#ff6584',
  accent: '#7fbd78',
  inputBg: '#2e3046',
  subtleBg: '#2e2133',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
  icon: '#fffffe',
};

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
}

const STORAGE_KEY = '@tractus_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>(systemColorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((savedTheme) => {
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme as ThemeMode);
      }
    }).catch(() => {});
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    AsyncStorage.setItem(STORAGE_KEY, nextTheme).catch(() => {});
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
