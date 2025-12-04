import React, { useState } from 'react';

interface LoginModalProps {
  userPassword: string;
  recoveryKey: string;
  onPasswordReset: (newPass: string) => void;
  texts: any;
  showAds: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ userPassword, recoveryKey, onPasswordReset, texts, showAds }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Recovery Mode
  const [mode, setMode] = useState<'LOGIN' | 'RECOVERY' | 'RESET'>('LOGIN');
  const [inputRecovery, setInputRecovery] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (isUnlocked) return null;

  const handleUnlock = () => {
    if (password === userPassword) {
      if (showAds) {
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          setIsUnlocked(true);
        }, 3000); 
      } else {
        setIsUnlocked(true);
      }
    } else {
      setError(texts.incorrectPass);
      setPassword('');
    }
  };

  const handleCheckRecovery = () => {
    if (inputRecovery.toLowerCase().trim() === recoveryKey.toLowerCase().trim()) {
      setMode('RESET');
      setError('');
    } else {
      setError(texts.recoveryError);
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 4) {
      setError(texts.passMinLen);
      return;
    }
    onPasswordReset(newPassword);
    setIsUnlocked(true); // Auto login after reset
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 p-4">
      {isProcessing ? (
        <div className="text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-8 relative">
             <div className="w-24 h-24 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{texts.verifying}</h2>
          <p className="text-slate-400 animate-pulse">{texts.adWait}</p>
        </div>
      ) : (
        <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-[fadeIn_0.3s_ease-out]">
          
          {mode === 'LOGIN' && (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-slate-500/50">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{texts.appLocked}</h2>
                <p className="text-slate-500 mt-2 text-sm">{texts.welcomeBack}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-slate-800 focus:ring-0 outline-none transition bg-slate-50 text-center text-xl tracking-[0.5em] font-mono text-slate-900"
                    placeholder="****"
                    autoFocus
                  />
                </div>

                {error && <div className="text-red-500 text-sm font-bold text-center animate-bounce">{error}</div>}

                <button 
                  onClick={handleUnlock}
                  disabled={password.length < 1}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {texts.login}
                </button>
                
                <button 
                  onClick={() => setMode('RECOVERY')}
                  className="w-full text-slate-400 text-sm underline hover:text-slate-600 mt-2"
                >
                  {texts.forgotPass}
                </button>
              </div>
            </>
          )}

          {mode === 'RECOVERY' && (
            <>
               <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{texts.forgotPass}</h2>
                <p className="text-slate-500 mt-2 text-sm">{texts.recoveryDesc}</p>
              </div>
              
              <div className="space-y-4">
                 <input 
                    type="text" 
                    value={inputRecovery}
                    onChange={(e) => { setInputRecovery(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition bg-slate-50 text-slate-900"
                    placeholder={texts.enterRecovery}
                  />
                  {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}
                  
                  <button 
                    onClick={handleCheckRecovery}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
                  >
                    {texts.unlock}
                  </button>
                  <button onClick={() => setMode('LOGIN')} className="w-full text-slate-400 text-sm">{texts.cancel}</button>
              </div>
            </>
          )}

          {mode === 'RESET' && (
            <>
               <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{texts.resetPass}</h2>
              </div>
              
              <div className="space-y-4">
                 <input 
                    type="text" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition bg-slate-50 font-mono text-center tracking-widest text-slate-900"
                    placeholder="****"
                  />
                  {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}
                  
                  <button 
                    onClick={handleResetPassword}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl"
                  >
                    {texts.save}
                  </button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};
