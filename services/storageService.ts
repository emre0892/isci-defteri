import { DayEntry, AppSettings, WorkType, CountryCode } from '../types';

const KEYS = {
  ENTRIES: 'isci_defteri_entries',
  SETTINGS: 'isci_defteri_settings'
};

const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  isSetupCompleted: false,
  rate: 0,
  rateType: 'DAILY',
  currency: 'TL',
  standardHours: 8,
  country: 'TR',
  password: '', // Default password empty, user must set it up
  recoveryKey: '', // Empty by default, must be set by user
  lifetimeEntryCount: 0,
  premiumExpiry: 0
};

export const getCountryDefaults = (country: CountryCode): Partial<AppSettings> => {
  switch (country) {
    case 'US': return { currency: 'USD', standardHours: 8 }; // English
    case 'DE': return { currency: 'EUR', standardHours: 8 }; // German
    case 'CN': return { currency: 'CNY', standardHours: 8 }; // Chinese
    case 'IN': return { currency: 'INR', standardHours: 9 }; // Hindi
    case 'ID': return { currency: 'IDR', standardHours: 8 }; // Indonesian
    case 'RU': return { currency: 'RUB', standardHours: 8 }; // Russian
    case 'SA': return { currency: 'SAR', standardHours: 8 }; // Arabic
    case 'MX': return { currency: 'MXN', standardHours: 8 }; // Spanish
    case 'IR': return { currency: 'IRR', standardHours: 8 }; // Farsi
    case 'TR':
    default:
      return { currency: 'TL', standardHours: 9 }; // Turkish
  }
};

export const getEntries = (): Record<string, DayEntry> => {
  try {
    const stored = localStorage.getItem(KEYS.ENTRIES);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (e) {
    console.error("Storage Error:", e);
    return {};
  }
};

export const saveEntry = (entry: DayEntry): Record<string, DayEntry> => {
  const entries = getEntries();
  entries[entry.date] = entry;
  try {
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error("Save Error:", e);
  }
  return entries;
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(KEYS.SETTINGS);
    const parsed = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    // Merge with defaults to ensure all fields (like premiumExpiry) exist
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Settings Save Error:", e);
  }
};

export const isPremiumActive = (settings: AppSettings): boolean => {
  if (!settings.premiumExpiry) return false;
  return settings.premiumExpiry > Date.now();
};

export const clearData = () => {
  localStorage.removeItem(KEYS.ENTRIES);
};
