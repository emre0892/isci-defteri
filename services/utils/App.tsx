import React, { useState, useEffect, useMemo } from 'react';
import { WorkCalendar } from './components/WorkCalendar';
import { StatsPanel } from './components/StatsPanel';
import { SettingsModal } from './components/SettingsModal';
import { EntryModal } from './components/EntryModal';
import { LoginModal } from './components/LoginModal';
import { SetupModal } from './components/SetupModal';
import { CountryModal, COUNTRIES } from './components/CountryModal';
import { getEntries, saveEntry, getSettings, saveSettings, isPremiumActive, getCountryDefaults } from './services/storageService';
import { DayEntry, AppSettings, WorkType, MonthlyStats, CountryCode } from './types';
import { TEXTS, getLocale } from './utils/translations';

function App() {
  const [entries, setEntries] = useState<Record<string, DayEntry>>({});
  const [settings, setSettingsState] = useState<AppSettings>({ 
    userName: '',
    isSetupCompleted: false,
    rate: 0, 
    rateType: 'DAILY', 
    currency: 'TL',
    standardHours: 8,
    country: 'TR',
    password: '',
    recoveryKey: '',
    lifetimeEntryCount: 0,
    premiumExpiry: 0
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getEntries());
    setSettingsState(getSettings());
  }, []);

  const countryCode = settings.country || 'TR';
  const texts = TEXTS[countryCode];
  const locale = getLocale(countryCode);
  const isPremium = isPremiumActive(settings);
  const currentFlag = COUNTRIES.find(c => c.code === countryCode)?.flag || '🇹🇷';

  const activeEntryCount = Object.keys(entries).length;
  const showAds = !isPremium && ((settings.lifetimeEntryCount > 6) || (activeEntryCount >= 6));

  const handleSetupComplete = (name: string, pass: string, recovery: string) => {
    const newSettings = {
      ...settings,
      userName: name,
      password: pass,
      recoveryKey: recovery,
      isSetupCompleted: true
    };
    saveSettings(newSettings);
    setSettingsState(newSettings);
  };

  const handleSetupLanguageChange = (newCountry: CountryCode) => {
    const defaults = getCountryDefaults(newCountry);
    const newSettings = {
      ...settings,
      country: newCountry,
      currency: defaults.currency || settings.currency,
      standardHours: defaults.standardHours || settings.standardHours
    };
    setSettingsState(newSettings);
  };

  const handlePasswordReset = (newPass: string) => {
    const newSettings = {
      ...settings,
      password: newPass
    };
    saveSettings(newSettings);
    setSettingsState(newSettings);
  };

  const handleDayClick = (dateStr: string, currentEntry?: DayEntry) => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const clicked = new Date(dateStr);
    clicked.setHours(0,0,0,0);
    
    if (clicked > now) {
      alert(texts.futureDateError);
      return;
    }

    setSelectedDate(dateStr);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = (type: WorkType, customAmount?: number, note?: string) => {
    if (!selectedDate) return;

    const newEntry: DayEntry = { 
      date: selectedDate, 
      type: type,
      note: note
    };

    if (type === WorkType.HOURLY) {
      newEntry.customHours = customAmount;
    } else if (type === WorkType.ADVANCE) {
      newEntry.advanceAmount = customAmount;
    }
    
    const updatedEntries = saveEntry(newEntry);
    setEntries(updatedEntries);

    const newCount = (settings.lifetimeEntryCount || 0) + 1;
    const newSettings = { ...settings, lifetimeEntryCount: newCount };
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettingsState(newSettings);
  };

  const handleCountryChange = (newCountry: CountryCode) => {
    const defaults = getCountryDefaults(newCountry);
    const newSettings = {
      ...settings,
      country: newCountry,
      currency: defaults.currency || settings.currency,
      standardHours: defaults.standardHours || settings.standardHours
    };
    saveSettings(newSettings);
    setSettingsState(newSettings);
  };

  const monthlyStats: MonthlyStats = useMemo(() => {
    let fullDays = 0;
    let halfDays = 0;
    let hourlySum = 0;
    let totalAdvances = 0;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    Object.values(entries).forEach((entry: DayEntry) => {
      const [eYear, eMonth] = entry.date.split('-').map(Number);
      if (eYear === year && eMonth === month) {
        if (entry.type === WorkType.FULL) fullDays++;
        if (entry.type === WorkType.HALF) halfDays++;
        if (entry.type === WorkType.HOURLY && entry.customHours) hourlySum += entry.customHours;
        if (entry.type === WorkType.ADVANCE && entry.advanceAmount) totalAdvances += entry.advanceAmount;
      }
    });

    let grossEarnings = 0;
    const stdHours = settings.standardHours || 8;

    if (settings.rateType === 'DAILY') {
      const dailyRate = settings.rate;
      grossEarnings += fullDays * dailyRate;
      grossEarnings += halfDays * (dailyRate / 2);
      grossEarnings += (hourlySum / stdHours) * dailyRate;
    } else {
      const hourlyRate = settings.rate;
      grossEarnings += (fullDays * stdHours) * hourlyRate;
      grossEarnings += (halfDays * (stdHours / 2)) * hourlyRate;
      grossEarnings += hourlySum * hourlyRate;
    }

    const netPayable = grossEarnings - totalAdvances;
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const currentMonthLabel = monthFormatter.format(currentDate);

    return {
      totalFullDays: fullDays,
      totalHalfDays: halfDays,
      totalHours: hourlySum,
      totalAdvances: totalAdvances,
      grossEarnings: grossEarnings,
      netPayable: netPayable,
      monthLabel: currentMonthLabel
    };
  }, [entries, currentDate, settings, locale]);

  const currentEntry = selectedDate ? entries[selectedDate] : undefined;

  const getInitialAmount = () => {
    if (currentEntry?.type === WorkType.HOURLY) return currentEntry.customHours;
    if (currentEntry?.type === WorkType.ADVANCE) return currentEntry.advanceAmount;
    return undefined;
  };

  if (!settings.isSetupCompleted) {
    return (
      <SetupModal 
        onComplete={handleSetupComplete} 
        onLanguageSelect={handleSetupLanguageChange}
        texts={texts} 
      />
    );
  }

  return (
    <div className="min-h-screen pb-10 bg-slate-50">
      
      <LoginModal 
        userPassword={settings.password} 
        recoveryKey={settings.recoveryKey || ''}
        onPasswordReset={handlePasswordReset}
        texts={texts} 
        showAds={showAds}
      />

      <header className="bg-slate-800 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg border-2 border-slate-700">
               {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{texts.greeting},</div>
              <h1 className="text-lg font-bold leading-none">{settings.userName || texts.appTitle}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Country Flag Button */}
            <button 
              onClick={() => setIsCountryModalOpen(true)} 
              className="bg-slate-700 w-10 h-10 flex items-center justify-center rounded-xl text-2xl hover:bg-slate-600 transition border border-slate-600 shadow-sm"
              aria-label="Change Language"
            >
              {currentFlag}
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="bg-slate-700 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-600 transition border border-slate-600"
              aria-label="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <StatsPanel 
          stats={monthlyStats} 
          settings={settings} 
          texts={texts}
        />
        
        <WorkCalendar 
          entries={entries} 
          onDayClick={handleDayClick} 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          country={countryCode}
          texts={texts}
        />

        <div className="text-center text-slate-400 text-xs mt-8 pb-8">
          <p>{texts.dataSafe}</p>
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={handleSaveSettings}
        texts={texts}
        locale={locale}
      />

      <CountryModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={handleCountryChange}
        currentCountry={countryCode}
        texts={texts}
      />

      <EntryModal
        isOpen={isEntryModalOpen}
        dateStr={selectedDate}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntry}
        initialType={currentEntry?.type || WorkType.OFF}
        initialAmount={getInitialAmount()}
        initialNote={currentEntry?.note}
        texts={texts}
        locale={locale}
        userPassword={settings.password}
        showAds={showAds}
      />
    </div>
  );
}

export default App;
