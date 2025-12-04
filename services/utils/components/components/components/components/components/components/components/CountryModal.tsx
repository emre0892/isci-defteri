import React from 'react';
import { CountryCode } from '../types';

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: CountryCode) => void;
  currentCountry: CountryCode;
  texts: any;
}

export const COUNTRIES: {code: CountryCode, label: string, flag: string}[] = [
  { code: 'TR', label: 'Türkçe', flag: '🇹🇷' }, 
  { code: 'US', label: 'English', flag: '🇺🇸' }, 
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' }, 
  { code: 'RU', label: 'Русский', flag: '🇷🇺' }, 
  { code: 'CN', label: '中文', flag: '🇨🇳' }, 
  { code: 'IN', label: 'हिन्दी', flag: '🇮🇳' }, 
  { code: 'ID', label: 'Bahasa', flag: '🇮🇩' }, 
  { code: 'IR', label: 'فارسی', flag: '🇮🇷' }, 
  { code: 'SA', label: 'العربية', flag: '🇸🇦' }, 
  { code: 'MX', label: 'Español', flag: '🇲🇽' }, 
];

export const CountryModal: React.FC<CountryModalProps> = ({ isOpen, onClose, onSelect, currentCountry, texts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-lg font-bold text-slate-800">{texts.country}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                onSelect(c.code);
                onClose();
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                currentCountry === c.code 
                  ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl">{c.flag}</span>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-700">{c.code}</div>
                <div className="text-[10px] text-slate-500">{c.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
