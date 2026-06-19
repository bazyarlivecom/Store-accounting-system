import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle, RefreshCcw, LogOut, Settings2 } from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../../lib/driveAuth';

interface DriveBackupProps {
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function DriveBackup({ showNotification }: DriveBackupProps) {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(
    localStorage.getItem('auto_backup_drive') === 'true'
  );

  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (autoBackupEnabled && !needsAuth && user) {
      // Auto backup every 4 hours while the app is open
      const interval = setInterval(() => {
        runBackup(true);
      }, 4 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoBackupEnabled, needsAuth, user]);

  const toggleAutoBackup = () => {
    const newVal = !autoBackupEnabled;
    setAutoBackupEnabled(newVal);
    localStorage.setItem('auto_backup_drive', String(newVal));
    if (newVal) {
      showNotification('tehiye noskhe poshtiban khodkar faal shod', 'success');
      runBackup(true);
    } else {
      showNotification('poshtibangiri khodkar gheirfaal shod', 'success');
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        setUser(result.user);
        showNotification('vorood ba movafaghiyat anjam shod', 'success');
      }
    } catch (err) {
      console.error('Login failed:', err);
      showNotification('khata dar vorood', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setNeedsAuth(true);
    setUser(null);
  };

  const uploadToDrive = async (accessToken: string, fileData: string) => {
    const boundary = 'foo_bar_baz_' + Date.now();
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const cleanDate = new Date().toLocaleDateString('fa-IR').replace(/\/\//g, '-');
    const fileName = `Hesabdari-Backup-${cleanDate}.json`;
    const metadata = {
      name: fileName,
      mimeType: 'application/json'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileData +
      close_delim;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody
    });
    
    if (!res.ok) {
      throw new Error('Failed to upload file to Google Drive');
    }
    return res.json();
  };

  const runBackup = async (isSilent = false) => {
    if (!isSilent) setIsBackingUp(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        if (!isSilent) showNotification(' (login mujaddad)', 'error');
        setNeedsAuth(true);
        return;
      }
      
      const fetchRes = await fetch('/api/db/backup');
      const data = await fetchRes.json();
      
      await uploadToDrive(accessToken, JSON.stringify(data, null, 2));
      if (!isSilent) showNotification('backup ok8', 'success');
    } catch (err: any) {
      console.error(err);
      if (!isSilent) showNotification('error backup', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-inner flex flex-col justify-center items-center text-center gap-4 col-span-1 md:col-span-2">
         <h4 className="font-bold text-gray-700">Ѿشتیبان‌گیری رمدنگاری‌شده در گوگل درايو</h4>
         <p className="text-xs text-gray-500">تمامٌ اطلاعات سیستe را بر روی درایو شخصی خود ب�ت نمایȯ.</p>
         <button
           onClick={handleLogin}
           disabled={isLoggingIn}
           className="mt-2 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
         >
           <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.9l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
           </svg>
           {isLoggingIn ? 'درحال اتصال...' : 'ورود با حساب گوگل و فعال‌ سازی'}
         </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-inner flex flex-col justify-center gap-4 col-span-1 md:col-span-2">
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
          <Cloud className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="text-right flex-1">
          <h4 className="font-bold text-gray-700 text-sm">مҫصل به فضای گوگل درايو</h4>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-rose-500 py-1 flex items-center gap-1 shrink-0">
          <LogOut className="w-3 h-3" />
          خروج
        </button>
      </div>
      
      <div className="flex items-center justify-between bg-white border border-gray-150 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${autoBackupEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={toggleAutoBackup}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${autoBackupEnabled ? '-translate-x-4' : 'translate-x-0'}`} />
          </div>
          <div className="text-right">
            <h5 className="text-sm font-bold text-gray-700">Ѿشتیبان‌گیری خودکار (هر ڔ ساعҩ)</h5>
            <p className="text-[10px] text-gray-500">تمامٌ اطلاعات شما به صورت خودکار ایمن می‌�ردد.</p>
          </div>
        </div>
        <button
          onClick={() => runBackup(false)}
          disabled={isBackingUp}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all shadow-sm text-xs disabled:opacity-75">
          {isBackingUp ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
          آھلود دستی
        </button>
      </div>
    </div>
  );
}