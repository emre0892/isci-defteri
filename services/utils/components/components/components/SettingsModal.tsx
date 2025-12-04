import React, { useState, useRef } from 'react';
import { AppSettings, RateType } from '../types';
import { isPremiumActive, getEntries, saveEntry } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  texts: any;
  locale: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, texts, locale }) => {
  const [rate, setRate] = useState(settings.rate.toString());
  const [rateType, setRateType] = useState<RateType>(settings.rateType);
  const [currency, setCurrency] = useState(settings.currency);
  const [standardHours, setStandardHours] = useState(settings.standardHours.toString());
  const [userName, setUserName] = useState(settings.userName || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isPremium = isPremiumActive(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...settings,
      userName: userName,
      rate: parseFloat(rate) || 0,
      rateType,
      currency,
      standardHours: parseFloat(standardHours) || 8,
    });
    onClose();
  };

  const handleBuyPremium = (months: number) => {
    const now = new Date();
    const expiry = new Date(now.setMonth(now.getMonth() + months)).getTime();
    
    onSave({
      ...settings,
      premiumExpiry: expiry
    });
    alert(texts.activePremium);
  };

  // --- BACKUP LOGIC ---
  const handleDownloadBackup = () => {
    const data = {
      settings: settings,
      entries: getEntries(),
      backupDate: new Date().toISOString()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `worker_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.settings && json.entries) {
          // Restore settings
          onSave(json.settings);
          // Restore entries (one by one to ensure format or bulk replace)
          localStorage.setItem('isci_defteri_entries', JSON.stringify(json.entries));
          
          alert(texts.restoreSuccess);
          window.location.reload(); // Reload to reflect changes immediately
        } else {
          alert(texts.restoreError);
        }
      } catch (err) {
        alert(texts.restoreError);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-xl font-bold text-slate-800">{texts.settings}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">{texts.yourName}</label>
          <input 
            type="text" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
            placeholder="..."
          />
        </div>

        {/* Premium Section */}
        <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
          <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {isPremium ? texts.activePremium : texts.premiumTitle}
          </h4>
          
          {isPremium ? (
            <div className="text-xs text-indigo-700">
               {texts.expires} {new Date(settings.premiumExpiry!).toLocaleDateString(locale)}
            </div>
          ) : (
            <>
              <p className="text-xs text-indigo-600 mb-3">{texts.premiumDesc}</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleBuyPremium(2)} className="bg-white border border-indigo-200 rounded-lg p-2 text-center hover:bg-indigo-50 transition shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{texts.plan2Mo}</div>
                  <div className="text-sm font-bold text-indigo-700">{texts.price2Mo}</div>
                </button>
                <button onClick={() => handleBuyPremium(6)} className="bg-white border-2 border-indigo-400 rounded-lg p-2 text-center hover:bg-indigo-50 transition shadow-md scale-105">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{texts.plan6Mo}</div>
                  <div className="text-sm font-bold text-indigo-700">{texts.price6Mo}</div>
                </button>
                <button onClick={() => handleBuyPremium(12)} className="bg-white border border-indigo-200 rounded-lg p-2 text-center hover:bg-indigo-50 transition shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{texts.plan1Yr}</div>
                  <div className="text-sm font-bold text-indigo-700">{texts.price1Yr}</div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Rate Settings */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">{texts.rateType}</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setRateType('DAILY')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                rateType === 'DAILY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {texts.daily}
            </button>
            <button 
              onClick={() => setRateType('HOURLY')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                rateType === 'HOURLY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {texts.hourly}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            {rateType === 'DAILY' ? texts.ratePlaceholder : texts.hourlyRatePlaceholder}
          </label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              placeholder="0.00"
            />
            <div className="w-20 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center font-bold text-slate-700">
              {currency}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">{texts.stdHours}</label>
          <input 
            type="number" 
            value={standardHours}
            onChange={(e) => setStandardHours(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
            placeholder="8"
          />
        </div>

        {/* Backup Section */}
        <div className="mb-6 pt-4 border-t border-slate-100">
           <h4 className="font-bold text-slate-800 mb-1">{texts.backupTitle}</h4>
           <p className="text-xs text-slate-400 mb-3">{texts.backupDesc}</p>
           
           <div className="flex gap-2">
             <button 
               onClick={handleDownloadBackup}
               className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-3 rounded-xl hover:bg-slate-200 transition"
             >
               ⬇ {texts.downloadBackup}
             </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-3 rounded-xl hover:bg-slate-200 transition"
             >
               ⬆ {texts.restoreBackup}
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept=".json"
               onChange={handleRestoreBackup}
             />
           </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-medium bg-slate-100 rounded-xl hover:bg-slate-200 transition"
          >
            {texts.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition"
          >
            {texts.save}
          </button>
        </div>
      </div>
    </div>
  );
};
