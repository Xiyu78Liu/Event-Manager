import { useState, useEffect, useCallback } from 'react';
import { hexToRgb, lightenColor, darkenColor, PRESET_THEMES } from '../utils/colorUtils';

export interface AppSettings {
  themeMode: 'light' | 'dark' | 'system';
  primaryColor: string;
  isCustomColor: boolean;
  showAttachments: boolean;
  showNotes: boolean;
  showEstimatedTime: boolean;
}

const STORAGE_KEY = 'event-manager-settings';

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'light',
  primaryColor: '#6366f1',
  isCustomColor: false,
  showAttachments: true,
  showNotes: true,
  showEstimatedTime: true,
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

function applyTheme(settings: AppSettings): void {
  const root = document.documentElement;

  // Apply theme mode
  if (settings.themeMode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', settings.themeMode);
  }

  // Check if it's a preset theme
  const presetTheme = PRESET_THEMES.find(t => t.value === settings.primaryColor);

  if (presetTheme && !settings.isCustomColor) {
    // Preset theme: use all 5 colors
    presetTheme.colors.forEach((color, i) => {
      const rgb = hexToRgb(color);
      root.style.setProperty(`--color-theme-${i + 1}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    });
    // Maintain backward compatibility
    const primaryRgb = hexToRgb(presetTheme.value);
    root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    root.style.setProperty('--color-primary-light-rgb', `${hexToRgb(presetTheme.colors[4]).r}, ${hexToRgb(presetTheme.colors[4]).g}, ${hexToRgb(presetTheme.colors[4]).b}`);
    root.style.setProperty('--color-primary-dark-rgb', `${hexToRgb(presetTheme.colors[0]).r}, ${hexToRgb(presetTheme.colors[0]).g}, ${hexToRgb(presetTheme.colors[0]).b}`);
  } else {
    // Custom color / solid color: derive from single color
    const { r, g, b } = hexToRgb(settings.primaryColor);
    const lightRgb = hexToRgb(lightenColor(settings.primaryColor, 40));
    const darkRgb = hexToRgb(darkenColor(settings.primaryColor, 30));

    root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--color-primary-light-rgb', `${lightRgb.r}, ${lightRgb.g}, ${lightRgb.b}`);
    root.style.setProperty('--color-primary-dark-rgb', `${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}`);

    // Fill 5-color variables with derived values
    const c1 = hexToRgb(darkenColor(settings.primaryColor, 60));
    const c2 = hexToRgb(darkenColor(settings.primaryColor, 30));
    const c3 = hexToRgb(settings.primaryColor);
    const c4 = hexToRgb(lightenColor(settings.primaryColor, 40));
    const c5 = hexToRgb(lightenColor(settings.primaryColor, 70));
    root.style.setProperty('--color-theme-1-rgb', `${c1.r}, ${c1.g}, ${c1.b}`);
    root.style.setProperty('--color-theme-2-rgb', `${c2.r}, ${c2.g}, ${c2.b}`);
    root.style.setProperty('--color-theme-3-rgb', `${c3.r}, ${c3.g}, ${c3.b}`);
    root.style.setProperty('--color-theme-4-rgb', `${c4.r}, ${c4.g}, ${c4.b}`);
    root.style.setProperty('--color-theme-5-rgb', `${c5.r}, ${c5.g}, ${c5.b}`);
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Apply theme whenever settings change
  useEffect(() => {
    applyTheme(settings);
    saveSettings(settings);
  }, [settings]);

  // Listen for system color scheme changes when themeMode is 'system'
  useEffect(() => {
    if (settings.themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = document.documentElement;
      root.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.themeMode]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return { settings, updateSetting, resetSettings };
}
