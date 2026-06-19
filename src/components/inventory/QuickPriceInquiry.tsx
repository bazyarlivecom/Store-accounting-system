import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Barcode, HelpCircle, ArrowRight, Tag, Info, MonitorCheck, Percent, Layers, ShieldCheck } from 'lucide-react';
import { addCommas } from '../../utils/format';
import { Product } from '../../types';

interface QuickPriceInquiryProps {
  products: Product[];
  settings: any;
}

export default function QuickPriceInquiry({ products, settings }: QuickPriceInquiryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Handle exact barcode or code match automatically
    if (searchTerm) {
      const exactMatch = products.find(p => 
        (p.barcode && p.barcode === searchTerm) || 
        (p.code && p.code === searchTerm)
      );
      
      if (exactMatch) {
        setSelectedProduct(exactMatch);
        setSearchTerm(''); // Clear after found if needed
      } else {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [searchTerm, products]);

  // If we don't have an exact match but have some search term
  const suggestedProducts = searchTerm.length >= 2 
    ? products.filter(p => !selectedProduct && (
        p.name.includes(searchTerm) || 
        (p.code && p.code.includes(searchTerm)) || 
        (p.barcode && p.barcode.includes(searchTerm))
      )).slice(0, 5) // Show top 5 suggestions
    : [];

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm('');
    if (searchInputRef.current) {
        searchInputRef.current.focus();
    }
  };

  const currency = settings?.currency || 'تومان';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side (or Top on mobile) - Search Area */}
        <div className="w-full md:w-2/5 bg-gray-50/50 p-8 border-b md:border-b-0 md:border-l border-gray-100 flex flex-col relative z-10">
          <div className="mb-8">
            <span className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
              <MonitorCheck className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">استعلام قیمت</h2>
            <p className="text-sm font-bold text-gray-500 mt-2 leading-relaxed">
              بارکد کالا را اسکن کنید و یا نام/کد کالا را برای جستجو وارد نمایید
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-2xl border-0 py-4 pr-12 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base font-bold bg-white transition-shadow"
              placeholder="جستجوی کالا..."
              autoComplete="off"
            />
          </div>

          {/* Suggestions Dropdown (inline) */}
          {suggestedProducts.length > 0 && !selectedProduct && (
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 max-h-[300px] overflow-y-auto">
              <div className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                نتایج پیشنهادی
              </div>
              <ul className="divide-y divide-gray-50">
                {suggestedProducts.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleSelectProduct(p)}
                      className="w-full text-right p-4 hover:bg-indigo-50/50 transition-colors flex items-center justify-between group/item"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                        {(p.barcode || p.code) && (
                           <span className="text-xs font-bold text-gray-500 font-mono flex items-center gap-2">
                             {p.barcode && <span className="flex items-center gap-1"><Barcode className="w-3 h-3"/> {p.barcode}</span>}
                             {p.code && <span className="flex items-center gap-1"><Tag className="w-3 h-3"/> {p.code}</span>}
                           </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover/item:text-indigo-500 transform -translate-x-2 group-hover/item:translate-x-0 transition-all opacity-0 group-hover/item:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!selectedProduct && suggestedProducts.length === 0 && searchTerm.length >= 2 && (
             <div className="mt-8 text-center flex flex-col items-center justify-center text-gray-400">
                <HelpCircle className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-bold text-sm">کالایی با این مشخصات یافت نشد</p>
             </div>
          )}
          
          <div className="mt-auto pt-8">
             <button
               onClick={() => {
                 setSelectedProduct(null);
                 setSearchTerm('');
                 if (searchInputRef.current) searchInputRef.current.focus();
               }}
               className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors"
             >
                <RefreshCw className="w-4 h-4" />
                شروع مجدد اسکن
             </button>
          </div>
        </div>

        {/* Right Side (or Bottom) - Result Area */}
        <div className="w-full md:w-3/5 p-8 md:p-12 relative flex items-center justify-center bg-white min-h-[400px]">
           {/* Background decorative pattern */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
             <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
           </div>

           {selectedProduct ? (
             <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-center mb-6">
                 {selectedProduct.imageUrl ? (
                    <div className="w-32 h-32 rounded-3xl bg-white shadow-md border border-gray-100 p-2 relative">
                      <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover rounded-2xl" />
                      {(!selectedProduct.isActive) && (
                         <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">غیرفعال</div>
                      )}
                    </div>
                 ) : (
                    <div className="w-32 h-32 rounded-3xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm relative">
                      <Package className="w-12 h-12 text-indigo-300" />
                      {(!selectedProduct.isActive) && (
                         <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">غیرفعال</div>
                      )}
                    </div>
                 )}
               </div>

               <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-snug mb-3">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-gray-500">
                    {selectedProduct.category && (
                       <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{selectedProduct.category}</span>
                    )}
                    {selectedProduct.code && (
                       <span className="font-mono flex items-center gap-1"><Tag className="w-3 h-3"/> {selectedProduct.code}</span>
                    )}
                    {selectedProduct.barcode && (
                       <span className="font-mono flex items-center gap-1"><Barcode className="w-3 h-3"/> {selectedProduct.barcode}</span>
                    )}
                  </div>
               </div>

               <div className="space-y-4">
                 <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]"></div>
                    <span className="block text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">قیمت فروش</span>
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <span className="text-4xl font-black tracking-tighter" dir="ltr">{addCommas(selectedProduct.salePrice || 0)}</span>
                      <span className="text-sm font-bold text-indigo-200 mt-2">{currency}</span>
                    </div>
                 </div>

                 {selectedProduct.discountPercent && selectedProduct.discountPercent > 0 && (
                   <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-700">
                        <Percent className="w-4 h-4" />
                        <span className="font-bold text-sm">تخفیف پیش‌فرض:</span>
                      </div>
                      <span className="font-black font-mono text-rose-700">{selectedProduct.discountPercent}٪</span>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">واحد اندازه‌گیری</span>
                      <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-gray-400"/> {selectedProduct.unit || 'عدد'}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">کف موجودی مجاز</span>
                      <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5 font-mono"><ShieldCheck className="w-3.5 h-3.5 text-gray-400"/> {selectedProduct.minStockLevel || 0}</span>
                    </div>
                 </div>
               </div>
             </div>
           ) : (
             <div className="text-center flex flex-col items-center justify-center text-gray-400 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Barcode className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-2">آماده اسکن</h3>
                <p className="text-sm font-bold max-w-[200px] leading-relaxed">
                  بارکدخوان را روی کالا قرار داده و اسکن کنید.
                </p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
