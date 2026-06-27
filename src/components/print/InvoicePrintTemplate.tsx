import React from "react";
import { formatPersianDateDisplay, toPersianDigits, addCommas } from "../../utils/format";
import { User, Phone, MapPin, Building2 } from "lucide-react";

interface InvoicePrintTemplateProps {
  data: any;
  storeSettings: any;
  persons: any[];
}

export default function InvoicePrintTemplate({
  data,
  storeSettings,
  persons,
}: InvoicePrintTemplateProps) {
  const isSale = data.type === "sale" || data.type === "sale_return";
  const isReturn = data.type === "sale_return" || data.type === "purchase_return";
  const title = isSale
    ? isReturn ? "فاکتور برگشت از فروش" : "فاکتور فروش"
    : isReturn ? "فاکتور برگشت از خرید" : "فاکتور خرید";
    
  const relatedPerson = persons.find(
    (p) => p.id === data.customerId || p.name === data.customerName
  );

  return (
    <div className="w-full text-sm text-slate-800 font-sans p-4 print:p-0">
      {/* Header Grid */}
      <div className="grid grid-cols-3 gap-4 border-2 border-slate-800 p-4 rounded-xl mb-4 relative print:border-slate-500">
        <div className="flex flex-col gap-2 justify-center">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500 w-16">تاریخ صدور:</span>
            <span>{formatPersianDateDisplay(data.jalaliDate || data.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500 w-16">شماره سند:</span>
            <span className="font-mono">{toPersianDigits(data.invoiceNumber || data.id)}</span>
          </div>
          {data.sellerInvoiceNumber && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-500 w-16">عطف:</span>
              <span className="font-mono">{toPersianDigits(data.sellerInvoiceNumber)}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center text-center">
          {storeSettings.logoUrl && (
            <img src={storeSettings.logoUrl} alt="Logo" className="w-12 h-12 object-contain mb-2 grayscale" />
          )}
          <h1 className="text-lg font-black tracking-tight mb-1">{storeSettings.storeName || "عنوان مجموعه"}</h1>
          <h2 className="text-base font-bold bg-slate-200 print:bg-slate-200 px-4 py-1 rounded-full whitespace-nowrap">
            {title}
          </h2>
        </div>
        
        <div className="flex flex-col gap-2 justify-center text-left items-end text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span dir="ltr">{toPersianDigits(storeSettings.phone || "---")}</span>
            <Phone className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex gap-1.5 text-right w-full justify-end max-w-[200px]">
             <span className="truncate" title={storeSettings.address}>{storeSettings.address || "---"}</span>
             <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Info Blocks */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Person Info */}
        <div className="border border-slate-300 rounded-lg p-3 text-xs leading-relaxed print:border-slate-400">
          <div className="flex items-center gap-1 text-slate-500 font-bold mb-2">
            <User className="w-4 h-4" />
            <span>{isSale ? "مشخصات خریدار" : "مشخصات تامین کننده"}</span>
          </div>
          <div className="font-bold text-sm mb-1">{data.customerName || "نامشخص"}</div>
          {relatedPerson && (
            <div className="grid grid-cols-2 gap-2 mt-2 text-slate-600">
              {relatedPerson.phone && <div>تلفن: <span dir="ltr">{toPersianDigits(relatedPerson.phone)}</span></div>}
              {relatedPerson.nationalId && <div>کد ملی/اقتصادی: {toPersianDigits(relatedPerson.nationalId)}</div>}
            </div>
          )}
        </div>

        {/* Invoice Info */}
        <div className="border border-slate-300 rounded-lg p-3 text-xs leading-relaxed print:border-slate-400">
          <div className="flex items-center gap-1 text-slate-500 font-bold mb-2">
            <Building2 className="w-4 h-4" />
            <span>اطلاعات سند</span>
          </div>
          <div className="grid grid-cols-2 gap-2 font-bold text-slate-700">
            <div>
              کاربر ثبت‌کننده: <span className="text-slate-900">{data.createdBy || "سیستم"}</span>
            </div>
            <div>
              نحوه تسویه: <span className="text-slate-900">{data.paymentMethod === "cash" ? "نقدی" : data.paymentMethod === "credit" ? "نسیه" : "ترکیبی"}</span>
            </div>
          </div>
          {data.description && (
             <div className="mt-2 text-slate-600">توضیحات: {data.description}</div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="border-2 border-slate-800 rounded-lg overflow-hidden print:border-slate-500 mb-4">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 print:bg-slate-200 text-slate-900 font-black border-b-2 border-slate-800 print:border-slate-500">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center border-l border-slate-300">ردیف</th>
              <th className="py-2.5 px-3 border-l border-slate-300">شرح کالا / خدمات</th>
              <th className="py-2.5 px-3 w-20 text-center border-l border-slate-300">مقدار</th>
              <th className="py-2.5 px-3 w-20 text-center border-l border-slate-300">واحد</th>
              <th className="py-2.5 px-3 w-28 text-center border-l border-slate-300">مبلغ واحد</th>
              <th className="py-2.5 px-3 w-20 text-center border-l border-slate-300">تخفیف (٪)</th>
              <th className="py-2.5 px-3 w-32 text-center">مبلغ کل (تومان)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 font-bold text-slate-800">
            {data.items?.filter((it: any) => it.productName || it.productId || it.quantity > 0).map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50 print:hover:bg-transparent">
                <td className="py-2 px-3 text-center border-l border-slate-300 text-slate-500">{toPersianDigits(idx + 1)}</td>
                <td className="py-2 px-3 border-l border-slate-300">{item.productName || "کالا"}</td>
                <td className="py-2 px-3 text-center border-l border-slate-300 font-mono text-sm" dir="rtl">
                  {toPersianDigits(item.quantity || 1)}
                </td>
                <td className="py-2 px-3 text-center border-l border-slate-300 text-slate-600">
                  {item.selectedUnit || "-"}
                </td>
                <td className="py-2 px-3 text-center border-l border-slate-300 font-mono text-sm">
                  {toPersianDigits(addCommas(item.unitPrice || 0))}
                </td>
                <td className="py-2 px-3 text-center border-l border-slate-300 font-mono text-sm">
                  {toPersianDigits(item.discountPercent || 0)}
                </td>
                <td className="py-2 px-3 text-center font-mono text-sm">
                  {toPersianDigits(addCommas(item.totalPrice || 0))}
                </td>
              </tr>
            ))}
            {/* Empty rows to maintain table height if few items */}
            {Array.from({ length: Math.max(0, 5 - (data.items?.length || 0)) }).map((_, i) => (
               <tr key={`empty-${i}`} className="h-9">
                  <td className="border-l border-slate-300"></td>
                  <td className="border-l border-slate-300"></td>
                  <td className="border-l border-slate-300"></td>
                  <td className="border-l border-slate-300"></td>
                  <td className="border-l border-slate-300"></td>
                  <td className="border-l border-slate-300"></td>
                  <td></td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Area */}
      <div className="flex justify-end mb-6">
        <div className="w-64 border-2 border-slate-800 rounded-lg overflow-hidden print:border-slate-500 text-xs font-bold">
          <div className="flex justify-between p-2.5 border-b border-slate-300 print:border-slate-400">
             <span className="text-slate-600">جمع مبالغ:</span>
             <span className="font-mono">{toPersianDigits(addCommas(data.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0))}</span>
          </div>
          <div className="flex justify-between p-2.5 border-b border-slate-300 print:border-slate-400 text-red-600">
             <span>تخفیف کل:</span>
             <span className="font-mono">{toPersianDigits(addCommas((data.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0) - (data.totalAmount || 0)))}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-100 print:bg-slate-200 text-sm font-black">
             <span>مبلغ قابل پرداخت:</span>
             <span className="font-mono">{toPersianDigits(addCommas(data.totalAmount || 0))}</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs font-bold text-slate-700">
        <div className="flex flex-col items-center">
          <div className="w-1/2 border-b border-dashed border-slate-400 mb-2 pb-12"></div>
          <span>مهر و امضای فروشنده</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-1/2 border-b border-dashed border-slate-400 mb-2 pb-12"></div>
          <span>مهر و امضای خریدار</span>
        </div>
      </div>
      
      {storeSettings.print_footer_note && (
        <div className="mt-8 text-[10px] text-center text-slate-500 border-t border-slate-200 pt-3 print:border-slate-300">
           {storeSettings.print_footer_note}
        </div>
      )}
    </div>
  );
}
