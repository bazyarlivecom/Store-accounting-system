import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, LogIn, AlertCircle, KeyRound } from 'lucide-react';

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

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">در حال بررسی اطلاعات کاربری...</div>;
  }

  if (!user) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 bg-gradient-to-br from-indigo-50 to-emerald-50" dir="rtl">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-white relative overflow-hidden">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
             
             <div className="relative">
                 <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-100/50">
                       <Lock className="w-10 h-10" />
                    </div>
                 </div>
                 <h2 className="text-3xl font-black text-center text-gray-800 mb-2 tracking-tight">ورود به سیستم</h2>
                 <p className="text-center text-sm font-semibold text-gray-500 mb-8">شماره همراه یا نام کاربری خود را وارد کنید</p>

                 {error && (
                    <div className="mb-4 p-4 bg-rose-50 text-rose-600 text-sm rounded-xl font-bold flex items-center gap-2 border border-rose-100 shadow-sm">
                       <AlertCircle className="w-5 h-5 flex-shrink-0" />
                       {error}
                    </div>
                 )}
                 {successMsg && (
                    <div className="mb-4 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl font-bold flex items-center gap-2 border border-emerald-100 shadow-sm break-all">
                       <AlertCircle className="w-5 h-5 flex-shrink-0" />
                       {successMsg}
                    </div>
                 )}

                 {!requireOTP ? (
                     <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-indigo-500"/> نام کاربری</label>
                           <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white font-sans text-left transition-all font-bold placeholder-gray-400" dir="ltr" placeholder="admin" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Lock className="w-4 h-4 text-indigo-500"/> رمز عبور</label>
                           <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white font-sans text-left transition-all font-bold placeholder-gray-400 tracking-widest" dir="ltr" placeholder="••••••••" />
                        </div>
                        <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-l from-indigo-600 to-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md active:scale-[0.98]">
                           <LogIn className="w-5 h-5"/>
                           ورود امن به نرم‌افزار
                        </button>
                     </form>
                 ) : (
                     <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right relative">
                        <button type="button" onClick={() => setRequireOTP(false)} className="text-xs text-indigo-600 font-bold mb-4 block hover:underline">بازگشت</button>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-indigo-500"/> کد تایید دو مرحله‌ای (OTP)</label>
                           <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} required className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono font-black text-center text-2xl tracking-[0.5em] transition-all" dir="ltr" placeholder="------" maxLength={6} />
                        </div>
                        <button type="submit" className="w-full py-4 mt-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98]">
                           <Lock className="w-5 h-5"/>
                           تایید دسترسی
                        </button>
                     </form>
                 )}
                 <p className="text-center text-xs text-gray-400 mt-8 font-mono font-bold tracking-widest uppercase">SECURE PORTAL V2.0</p>
             </div>
          </div>
       </div>
     );
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signOut: handleSignOut, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
