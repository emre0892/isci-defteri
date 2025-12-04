export enum WorkType {
  FULL = 'FULL',
  HALF = 'HALF',
  HOURLY = 'HOURLY',
  ADVANCE = 'ADVANCE',
  OFF = 'OFF'
}

export interface DayEntry {
  date: string; // ISO Format YYYY-MM-DD
  type: WorkType;
  customHours?: number; // Used if type is HOURLY
  advanceAmount?: number; // Used if type is ADVANCE
  note?: string;
}

export type RateType = 'DAILY' | 'HOURLY';

// 10 Specific Regions/Languages: TR, US(EN), DE, CN(ZH), IN(HI), ID, RU, SA(AR), MX(ES), IR(FA)
export type CountryCode = 'TR' | 'US' | 'DE' | 'CN' | 'IN' | 'ID' | 'RU' | 'SA' | 'MX' | 'IR';

export interface AppSettings {
  userName: string; // User's name
  isSetupCompleted: boolean; // Has the user run the initial setup?
  rate: number; // The amount (e.g. 1000 or 15)
  rateType: RateType; // Is this 1000 per Day or 15 per Hour?
  currency: string;
  standardHours: number; // How many hours make a full day? (Default 8)
  country: CountryCode; // Country selection affects calendar start day and defaults
  password: string; // Security password for editing entries
  recoveryKey: string; // Security question answer for password reset
  lifetimeEntryCount: number; // Track how many entries user has made for ad logic
  premiumExpiry?: number; // Timestamp when premium ends. If undefined or past, user is free.
}

export interface MonthlyStats {
  totalFullDays: number;
  totalHalfDays: number;
  totalHours: number; // Sum of custom hours
  totalAdvances: number; // Sum of advances
  grossEarnings: number; // Earnings before advances
  netPayable: number; // Gross - Advances
  monthLabel: string;
}
