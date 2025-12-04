import React, { useState, useEffect } from 'react';
import { WorkType } from '../types';

interface EntryModalProps {
  isOpen: boolean;
  dateStr: string | null;
  onClose: () => void;
  onSave: (type: WorkType, customAmount?: number, note?: string) => void;
  initialType: WorkType;
  initialAmount?: number;
  initialNote?: string;
  texts: any;
  locale: string;
  userPassword: string;
  showAds: boolean;
}

type ModalStep = 'SELECT' | 'CONFIRM' | 'PASSWORD' | 'AD' | 'SUCCESS';

export const EntryModal: React.FC<EntryModalProps> = ({ 
  isOpen, 
  dateStr, 
  onClose, 
  onSave, 
  initialType,
  initialAmount,
  initialNote,
  texts,
  locale,
  userPassword,
  showAds
}) => {
  const [step, setStep] = useState<ModalStep>('SELECT');
  const [pendingData, setPendingData] = useState<{type: WorkType, amount?: number, note?: string} | null>(null);
  
  // Inputs
  const [inputValue, setInputValue] = useState<string>('');
  const [advanceValue, setAdvanceValue] = useState<string>('');
  const [noteValue, setNoteValue] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setPendingData(null);
      setErrorMsg('');
      setPasswordInput('');
      
      if (initialType === WorkType.HOURLY && initialAmount) {
        setInputValue(initialAmount.toString());
        setAdvanceValue('');
      } else if (initialType === WorkType.ADVANCE && initialAmount) {
        setAdvanceValue(initialAmount.toString());
        setInputValue('');
      } else {
        setInputValue('');
        setAdvanceValue('');
      }
      setNoteValue(initialNote || '');
    }
  }, [isOpen, initialType, initialAmount, initialNote]);

  // Ad Simulation Logic (Now treated as "Processing")
  useEffect(() => {
    if (step === 'AD') {
      const timer = setTimeout(() => {
        // After Ad/Wait, save and show success
        if (pendingData) {
           onSave(pendingData.type, pendingData.amount, pendingData.note);
           setStep('SUCCESS');
           setTimeout(() => {
             onClose();
           }, 1500); // Show success for 1.5s then close
        }
      }, 3000); // 3 second processing/ad wait
      return () => clearTimeout(timer);
    }
  }, [step, pendingData, onSave, onClose]);

  if (!isOpen || !dateStr) return null;

  const formattedDate = new Date(dateStr).toLocaleDateString(locale, { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // 1. User Selects Action
  const handleSelect = (type: WorkType) => {
    let amount: number | undefined = undefined;
    
    // For Hourly and Advance, we validate the input immediately
    if (type === WorkType.HOURLY) {
      amount = parseFloat(inputValue);
      if (!amount || amount <= 0) return; 
    }
    if (type === WorkType.ADVANCE) {
      amount = parseFloat(advanceValue);
      if (!amount || amount <= 0) return;
    }

    // Pass the note value for all types
    setPendingData({ type, amount, note: noteValue });
    setStep('CONFIRM');
  };

  // 2. User Confirms -> Go to Password
  const handleConfirm = () => {
    setStep('PASSWORD');
  };

  // 3. Verify Password -> Go to AD (Processing) OR Success (if Premium/Trial)
  const handleVerifyPassword = () => {
    if (passwordInput === userPassword) {
      setErrorMsg('');
      
      if (showAds) {
        setStep('AD');
      } else {
        if (pendingData) {
          onSave(pendingData.type, pendingData.amount, pendingData.note);
          setStep('SUCCESS');
          setTimeout(onClose, 1000);
        }
      }
    } else {
      setErrorMsg('Incorrect Password');
    }
  };

  const renderContent = () => {
    // --- STEP: SUCCESS ---
    if (step === 'SUCCESS') {
      return (
        <div className="text-center py-10 animate-[scaleIn_0.3s_ease-out]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-green-700">{texts.saveSuccess}</h3>
        </div>
      );
    }

    // --- STEP: AD SIMULATION / PROCESSING ---
    if (step === 'AD') {
      return (
        <div className="text-center py-8">
          <div className="mb-6 relative">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{texts.adLoading}</h3>
          <p className="text-sm text-slate-500 bg-indigo-50 text-indigo-700 py-2 px-4 rounded-lg inline-block animate-pulse">
            {texts.adWait}
          </p>
        </div>
      );
    }

    // --- STEP: PASSWORD CHECK ---
    if (step === 'PASSWORD') {
      return (
        <div className="text-center py-4">
           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-slate-300">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">{texts.locked}</h4>
          <p className="text-sm text-slate-500 mb-6">{texts.lockedDesc}</p>
          
          <input 
            type="password"
            placeholder={texts.enterPass} 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl mb-3 text-center tracking-[0.5em] font-mono text-lg bg-white text-slate-900"
            autoFocus
          />
          {errorMsg && <p className="text-red-500 text-xs mb-3 font-bold">{errorMsg}</p>}
          
          <button 
            onClick={handleVerifyPassword}
            disabled={passwordInput.length < 1}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition disabled:opacity-50"
          >
            {texts.unlock}
          </button>
          <button onClick={() => setStep('SELECT')} className="mt-4 text-slate-400 text-sm underline">{texts.cancel}</button>
        </div>
      );
    }

    // --- STEP: CONFIRMATION ---
    if (step === 'CONFIRM') {
      return (
        <div className="text-center py-4">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">{texts.confirmTitle}</h4>
          <p className="text-sm text-slate-500 mb-6">{texts.confirmDesc}</p>

          <div className="flex gap-3">
            <button 
              onClick={() => setStep('SELECT')}
              className="flex-1 py-3 text-slate-600 font-medium bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              {texts.no}
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-1 py-3 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              {texts.yes}
            </button>
          </div>
        </div>
      );
    }

    // --- STEP: SELECT (Default) ---
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 pb-8">
        
        {/* ROW 1: Full / Half / Off - SIDE BY SIDE */}
        <div className="grid grid-cols-3 gap-3">
          {/* Full Day */}
          <button 
            onClick={() => handleSelect(WorkType.FULL)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all h-28 ${
              initialType === WorkType.FULL 
              ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' 
              : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-sm font-bold text-slate-700 mb-2">{texts.full}</div>
            <svg className="w-10 h-10 text-blue-600" viewBox="0 0 100 100">
              <path d="M20,20 L80,80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              <path d="M80,20 L20,80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            </svg>
          </button>

          {/* Half Day */}
          <button 
            onClick={() => handleSelect(WorkType.HALF)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all h-28 ${
              initialType === WorkType.HALF 
              ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' 
              : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-sm font-bold text-slate-700 mb-2">{texts.half}</div>
            <svg className="w-10 h-10 text-orange-500" viewBox="0 0 100 100">
              <path d="M80,20 L20,80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            </svg>
          </button>

          {/* Off Day */}
          <button 
            onClick={() => handleSelect(WorkType.OFF)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all h-28 ${
              initialType === WorkType.OFF 
              ? 'bg-slate-100 border-slate-500 ring-1 ring-slate-500' 
              : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-sm font-bold text-slate-700 mb-2">{texts.dayOff}</div>
            <span className="text-4xl font-bold text-slate-400">0</span>
          </button>
        </div>

        <div className="h-px bg-slate-100 my-2"></div>

        {/* ROW 2: Hourly Input */}
        <div className={`w-full px-4 py-3 rounded-xl border transition-all ${
          initialType === WorkType.HOURLY
          ? 'border-purple-500 ring-1 ring-purple-500 bg-white'
          : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
                Hr
              </div>
              <div className="text-sm font-bold text-slate-700">{texts.hourlyEntry}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                className="w-20 text-center border border-slate-300 rounded-lg px-2 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white text-slate-900 font-bold"
              />
              <button 
                onClick={() => handleSelect(WorkType.HOURLY)}
                disabled={!inputValue}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 shrink-0"
              >
                {texts.save}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: Advance Input */}
        <div className={`w-full px-4 py-3 rounded-xl border transition-all ${
          initialType === WorkType.ADVANCE
          ? 'border-emerald-500 ring-1 ring-emerald-500 bg-white'
          : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                $
              </div>
              <div className="text-sm font-bold text-slate-700">{texts.advance}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={advanceValue}
                onChange={(e) => setAdvanceValue(e.target.value)}
                placeholder="0"
                className="w-20 text-center border border-slate-300 rounded-lg px-2 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-slate-900 font-bold"
              />
              <button 
                onClick={() => handleSelect(WorkType.ADVANCE)}
                disabled={!advanceValue}
                className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 shrink-0"
              >
                {texts.save}
              </button>
            </div>
          </div>
        </div>

        {/* Note Input (Visible always at bottom) */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">{texts.notePlaceholder}</label>
          <input 
            type="text" 
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="..."
            className="w-full border border-slate-200 rounded-lg px-3 py-3 outline-none focus:border-blue-400 bg-slate-50 text-sm text-slate-700"
          />
        </div>

      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-lg font-bold text-slate-800">
             {formattedDate}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};
