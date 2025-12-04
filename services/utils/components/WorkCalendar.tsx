import React, { useMemo } from 'react';
import { DayEntry, WorkType, CountryCode } from '../types';

interface WorkCalendarProps {
  entries: Record<string, DayEntry>;
  onDayClick: (date: string, currentEntry?: DayEntry) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  country: CountryCode;
  texts: any;
}

const MONTHS: Record<string, string[]> = {
  TR: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  US: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  DE: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  CN: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  IN: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  ID: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  RU: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  SA: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  MX: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  IR: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'] // Using Gregorian months in Farsi
};

const DAYS_HEADER: Record<string, string[]> = {
  TR: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  US: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  DE: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  CN: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  IN: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  ID: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  RU: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  SA: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  MX: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  IR: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه']
};

const SUNDAY_START_COUNTRIES: CountryCode[] = ['US', 'CN', 'IN', 'SA', 'MX', 'IR']; 

export const WorkCalendar: React.FC<WorkCalendarProps> = ({ 
  entries, 
  onDayClick, 
  currentDate, 
  onDateChange,
  country,
  texts
}) => {
  
  const renderMark = (entry?: DayEntry) => {
    if (!entry) return null;

    switch (entry.type) {
      case WorkType.FULL:
        return (
          <svg viewBox="0 0 100 100" className="w-12 h-12 text-blue-600 opacity-90">
            <path d="M20,20 L80,80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <path d="M80,20 L20,80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          </svg>
        );
      case WorkType.HALF:
        return (
          <svg viewBox="0 0 100 100" className="w-12 h-12 text-orange-500 opacity-90">
            <path d="M80,20 L20,80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          </svg>
        );
      case WorkType.HOURLY:
        return (
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-purple-600">{entry.customHours}</span>
            <span className="text-[10px] font-medium text-purple-400 uppercase leading-none">{texts.hrs}</span>
          </div>
        );
      case WorkType.ADVANCE:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-500 text-emerald-700">
               <span className="font-bold text-lg">$</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 mt-1">{entry.advanceAmount}</span>
          </div>
        );
      case WorkType.OFF:
        return (
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-300 select-none">0</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Memoize calendar cells to prevent re-calculation on every render
  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Logic: US/CN/IN/SA/MX/IR start on Sunday/Saturday (Visually 0 index). 
    // TR/DE/RU/ID start on Monday.
    const isSundayStart = SUNDAY_START_COUNTRIES.includes(country);
    const dayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
    
    let startingEmptySlots = 0;
    if (isSundayStart) {
      startingEmptySlots = dayOfWeek; 
    } else {
      startingEmptySlots = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    }

    const cells = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Empty slots
    for (let i = 0; i < startingEmptySlots; i++) {
      cells.push(<div key={`empty-${i}`} className="h-20 sm:h-24 bg-slate-50 border border-slate-100/50"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = entries[dateStr];
      const isToday = todayStr === dateStr;
      const isOff = entry?.type === WorkType.OFF;
      const hasNote = entry?.note && entry.note.trim().length > 0;

      cells.push(
        <button 
          key={dateStr}
          onClick={() => onDayClick(dateStr, entry)}
          className={`
            relative h-20 sm:h-24 border border-slate-200 flex flex-col items-start justify-start p-1 transition-all active:scale-95
            ${isOff ? 'bg-slate-50' : 'bg-white'}
            ${!entry ? 'hover:bg-slate-50' : ''}
          `}
        >
          <div className="flex justify-between w-full">
            <span className={`text-sm font-medium ml-1 mt-1 z-10 ${
               isToday
               ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
               : isOff ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {d}
            </span>
            {entry && !isOff && (
               <svg className="w-3 h-3 mr-1 mt-1 text-blue-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            )}
            {hasNote && (
               <svg className={`w-3 h-3 mr-1 mt-1 ${isOff ? 'text-slate-400' : 'text-blue-200'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            )}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {renderMark(entry)}
          </div>
        </button>
      );
    }
    return cells;
  }, [currentDate, entries, country, texts]); // Dependencies for re-calculation

  const activeMonths = MONTHS[country] || MONTHS['TR'];
  const activeDays = DAYS_HEADER[country] || DAYS_HEADER['TR'];

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800 text-white">
        <button onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-700 rounded-full transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold tracking-wide">
          {activeMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-700 rounded-full transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
        {activeDays.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {calendarCells}
      </div>
    </div>
  );
};
