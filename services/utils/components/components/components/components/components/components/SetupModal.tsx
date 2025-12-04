import React, { useState } from 'react';
import { CountryCode } from '../types';
import { COUNTRIES } from './CountryModal';

interface SetupModalProps {
  onComplete: (name: string, pass: string, recovery: string) => void;
  onLanguageSelect: (code: CountryCode) => void;
  texts: any;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onComplete, onLanguageSelect, texts }) => {
  const [step, setStep] = useState<'LANG' | 'FORM'>('LANG');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recovery, setRecovery] = useState('');
  const [error, setError] = useState('');

  const handleLanguageClick = (code: CountryCode) => {
    onLanguageSelect(code);
    setStep('FORM');
  };

  const handleSubmit = () => {
    if (name.trim().length < 2) {
      setError(texts.nameRequired);
      return;
    }
    if (password.length < 4) {
      setError(texts.passMinLen);
      return;
    }
    if (password !== confirmPassword) {
      setError(texts.passMismatch);
      return;
    }
    if (recovery.trim().length < 2) {
      setError('Please enter a recovery key');
      return;
    }
    
    onComplete(name, password, recovery);
  };

  if (step === 'LANG') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Select Language</h2>
            <p className="text-slate-500 text-sm">Dil Seçimi / Язык / اللغة</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleLanguageClick(c.code)}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
              >
                <span className="text-2xl filter group-hover:brightness-110 transition">{c.flag}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-700">{c.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{c.code}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
        
        {/* Back Button to Language Select */}
        <button 
          onClick={() => setStep('LANG')}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <div className="text-center mb-6 mt-2">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{texts.welcomeSetup}</h2>
          <p className="text-slate-500 mt-2 text-sm">{texts.setupDesc}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">{texts.yourName}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition bg-slate-50 text-slate-900"
              placeholder="..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">{texts.setPass}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition bg-slate-50 mb-2 text-slate-900"
              placeholder="****"
            />
             <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition bg-slate-50 text-slate-900"
              placeholder="****"
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">{texts.recoveryKey}</label>
             <input 
              type="text" 
              value={recovery}
              onChange={(e) => setRecovery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition bg-slate-50 text-slate-900"
              placeholder={texts.recoveryDesc}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{error}</div>}

          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition transform active:scale-95"
          >
            {texts.startApp}
          </button>
        </div>
      </div>
    </div>
  );
};
