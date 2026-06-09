import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, addUser } from './dataService';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (u: User) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
  checkAuth: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const checkAuth = () => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
    localStorage.removeItem('auth_user');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const users = await getUsers();
      if (users.length === 0) {
        // If no users exist, create default admin
        const adminUser: any = {
           username: 'admin',
           password: '123',
           name: 'مدیر کل',
           role: 'admin',
           isActive: true
        };
        const created = await addUser(adminUser);
        if (username === 'admin' && password === '123') {
           signIn(created);
           return;
        }
      }

      const found = users.find(u => u.username === username && u.password === password);
      if (found) {
        if (!found.isActive) {
           setError('حساب کاربری شما غیرفعال شده است.');
        } else {
           signIn(found);
        }
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است.');
      }
    } catch(err) {
       setError('خطا در ارتباط با سرور.');
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">در حال بررسی اطلاعات کاربری...</div>;
  }

  if (!user) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" dir="rtl">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
             <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                   <Lock className="w-8 h-8" />
                </div>
             </div>
             <h2 className="text-2xl font-black text-center text-gray-800 mb-2">ورود به سیستم جامع</h2>
             <p className="text-center text-sm text-gray-500 mb-8">شماره همراه یا نام کاربری خود را وارد کنید</p>

             {error && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl font-bold flex items-center gap-2 border border-rose-100">
                   <AlertCircle className="w-5 h-5" />
                   {error}
                </div>
             )}

             <form onSubmit={handleLogin} className="space-y-5">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><UserIcon className="w-4 h-4"/> نام کاربری</label>
                   <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-sans text-left" dir="ltr" placeholder="admin" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Lock className="w-4 h-4"/> رمز عبور</label>
                   <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-sans text-left" dir="ltr" placeholder="***" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
                   <LogIn className="w-5 h-5"/>
                   ورود به نرم‌افزار
                </button>
             </form>
             <p className="text-center text-xs text-gray-400 mt-6 font-mono">APP V1.0 - BUILD 002</p>
          </div>
       </div>
     );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut: handleSignOut, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

