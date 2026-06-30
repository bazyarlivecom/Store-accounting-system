import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, LogIn, AlertCircle, KeyRound, Zap } from 'lucide-react';
import FastProductCreateModal from '../components/products/FastProductCreateModal';
import SystemChecklist from '../components/admin/SystemChecklist';
import { addProduct } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signIn: (u: User) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  accessToken: null,
  signIn: async () => {},
  signOut: async () => {},
  checkAuth: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // OTP state
  const [requireOTP, setRequireOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');

  const [isFastProductModalOpen, setIsFastProductModalOpen] = useState(false);

  const checkAuth = () => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signIn = async (u: User) => {
    setUser(u);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const handleSignOut = async () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {}
  };

  // Helper to intercept fetch and add token (not strictly enforced everywhere yet, but available)
  // Removed global fetch override due to "Cannot set property fetch of #<Window> which has only a getter"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'خطا در ورود');
        return;
      }
      
      if (data.requireOTP) {
         setRequireOTP(true);
         setTempToken(data.tempToken);
         if (data.message) setSuccessMsg(data.message); // Demo only: show OTP code
      } else {
         localStorage.setItem('access_token', data.accessToken);
         setAccessToken(data.accessToken);
         signIn(data.user);
      }
    } catch(err) {
       setError('خطا در ارتباط با سرور.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'کد ورود نامعتبر است');
        return;
      }
      
      localStorage.setItem('access_token', data.accessToken);
      setAccessToken(data.accessToken);
      setRequireOTP(false);
      signIn(data.user);
    } catch(err) {
      setError('خطا در ارتباط با سرور.');
    }
  };

  const handleFastSaveProduct = async (productData: any): Promise<boolean> => {
    try {
      await addProduct(productData);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">در حال بررسی اطلاعات کاربری...</div>;
  }

  if (!user) {
     return (
       <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 bg-gray-50 bg-gradient-to-br from-indigo-50 to-emerald-50 p-4" dir="rtl">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-white relative overflow-hidden shrink-0">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
             
             <div className="relative">
                 <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center border border-slate-200/60 shadow-sm">
                       <Lock className="w-7 h-7" />
                    </div>
                 </div>
                 <h2 className="text-2xl font-black text-center text-slate-900 mb-2 tracking-tight">ورود به پنل مدیریت</h2>
                 <p className="text-center text-sm font-medium text-slate-500 mb-8">اطلاعات حساب کاربری خود را وارد نمایید</p>

                 {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-800 text-sm rounded-xl font-bold flex items-start gap-3 border border-red-100 shadow-sm">
                       <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                       <p className="leading-relaxed">{error}</p>
                    </div>
                 )}
                 {successMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl font-bold flex items-start gap-3 border border-emerald-100 shadow-sm break-all">
                       <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                       <p className="leading-relaxed">{successMsg}</p>
                    </div>
                 )}

                 {!requireOTP ? (
                     <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><UserIcon className="w-4 h-4 text-slate-400"/> نام کاربری</label>
                           <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="w-full px-4 py-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 focus:bg-white font-sans text-left transition-all font-semibold placeholder-slate-400" dir="ltr" placeholder="admin" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Lock className="w-4 h-4 text-slate-400"/> رمز عبور</label>
                           <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 focus:bg-white font-sans text-left transition-all font-semibold placeholder-slate-400 tracking-[0.2em]" dir="ltr" placeholder="••••••••" />
                        </div>
                        <button type="submit" className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">
                           <LogIn className="w-5 h-5"/>
                           ورود به حساب کاربری
                        </button>
                     </form>
                 ) : (
                     <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right relative">
                        <button type="button" onClick={() => setRequireOTP(false)} className="text-xs text-slate-500 font-bold mb-4 block hover:text-slate-800 transition-colors">بازگشت به مرحله قبل</button>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><KeyRound className="w-4 h-4 text-slate-400"/> کد تایید (OTP)</label>
                           <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} required className="w-full px-4 py-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 focus:bg-white font-mono font-black text-center text-2xl tracking-[0.5em] transition-all" dir="ltr" placeholder="------" maxLength={6} />
                        </div>
                        <button type="submit" className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">
                           <Lock className="w-5 h-5"/>
                           تایید و ورود
                        </button>
                     </form>
                 )}
                 <p className="text-center text-[10px] text-slate-400 mt-10 font-mono font-bold tracking-widest uppercase">SECURE PORTAL</p>
                 
                 <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
                    <button 
                      type="button" 
                      onClick={() => setIsFastProductModalOpen(true)}
                      className="flex items-center gap-2 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl transition-colors font-bold text-sm w-full justify-center"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      ثبت سریع کالا بدون ورود
                    </button>
                 </div>
             </div>
          </div>
          <div className="w-full max-w-3xl h-[90vh] overflow-y-auto flex flex-col bg-white rounded-3xl shadow-xl border border-white custom-scrollbar hidden lg:flex">
             <SystemChecklist />
          </div>
          <FastProductCreateModal
            isOpen={isFastProductModalOpen}
            onClose={() => setIsFastProductModalOpen(false)}
            onSave={handleFastSaveProduct}
          />
       </div>
     );
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signOut: handleSignOut, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

