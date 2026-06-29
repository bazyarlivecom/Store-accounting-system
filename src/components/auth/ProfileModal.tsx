import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { getPersons, updateUser } from "../../services/dataService";
import { motion } from "framer-motion";
import { X, Save, User as UserIcon, Lock, Clock, Link as LinkIcon, Shield } from "lucide-react";
import SearchableSelect from "../ui/SearchableSelect";
import { useAuth } from "../../lib/AuthContext";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, updateCurrentUser } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState(user?.password || "");
  const [personId, setPersonId] = useState<string | number>(user?.personId || "");
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState<number>(user?.autoLogoutMinutes || 0);
  
  const [persons, setPersons] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    getPersons().then(setPersons);
  }, []);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage("");
    try {
      const updatedUser = {
        ...user,
        name,
        password,
        personId: personId || undefined,
        autoLogoutMinutes
      };
      
      const savedUser = await updateUser(String(user.id), updatedUser);
      updateCurrentUser(savedUser);
      
      setMessage("اطلاعات پروفایل با موفقیت بروزرسانی شد.");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage("خطا در بروزرسانی اطلاعات.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-indigo-600" />
            ویرایش پروفایل کاربری
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {message && (
            <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.includes('موفقیت') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <UserIcon className="w-4 h-4" /> نام نمایشی
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Lock className="w-4 h-4" /> رمز عبور
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <LinkIcon className="w-4 h-4" /> اتصال به شخص در سیستم
              </label>
              <SearchableSelect
                options={persons.map(p => ({ value: p.id, label: p.alias || p.name }))}
                value={personId}
                onChange={(val) => setPersonId(val)}
                placeholder="انتخاب شخص (اختیاری)"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">با اتصال پروفایل به یک شخص، عملکرد کاربر در سیستم قابل ردیابی به شخص خواهد بود.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> خروج خودکار (دقیقه)
              </label>
              <input
                type="number"
                min="0"
                value={autoLogoutMinutes}
                onChange={(e) => setAutoLogoutMinutes(Number(e.target.value))}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">زمان عدم فعالیت به دقیقه. عدد 0 به معنی غیرفعال بودن خروج خودکار است.</p>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
