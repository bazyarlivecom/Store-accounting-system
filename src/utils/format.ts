import Num2persian from 'num2persian';

export function addCommas(num: number | string): string {
    if (!num && num !== 0 && num !== '0') return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function removeCommas(str: string): string {
    if (!str) return '';
    return str.toString().replace(/,/g, '');
}

export function parseNumberField(val: string): string {
    const raw = removeCommas(val);
    if (!raw) return '';
    if (isNaN(Number(raw))) return raw;
    return raw;
}

export const numberToWords = (num: string | number): string => {
    if (!num && num !== 0 && num !== '0') return '';
    const raw = num.toString().replace(/,/g, '');
    if (isNaN(Number(raw))) return '';
    
    return Num2persian(raw);
}

export const getBaseValueInToman = (cur: string) => {
  if (!cur) return 1;
  if (cur.includes('تومان')) return 1;
  if (cur.includes('ریال')) return 0.1;
  if (cur.includes('دلار') || cur.includes('USD')) return 70000;
  if (cur.includes('یورو') || cur.includes('EUR')) return 75000;
  if (cur.includes('درهم') || cur.includes('AED')) return 19000;
  return 1;
};

export const getDefaultExchangeRate = (invoiceCur: string, storeCur: string) => {
  if (invoiceCur === storeCur) return 1;
  const invToman = getBaseValueInToman(invoiceCur);
  const storeToman = getBaseValueInToman(storeCur);
  return invToman / storeToman;
};

export const showInvoiceCurrency = (c: string) => {
  if (!c) return 'تومان';
  if (c === 'IRT' || c === 'toman') return 'تومان';
  if (c === 'IRR' || c === 'rial') return 'ریال';
  if (c === 'USD' || c === 'dollar') return 'دلار';
  return c;
};

export function numToPersianWords(num: number): string {
  if (num === 0) return 'صفر';
  const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const dahgan = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const dahYek = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const sadgan = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const steps = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

  const convertThreeDigit = (n: number): string => {
    if (n === 0) return '';
    let result = '';
    const s = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const y = n % 10;

    if (s > 0) result += sadgan[s];
    if (d > 0) {
      if (result) result += ' و ';
      if (d === 1) {
        result += dahYek[y];
        return result;
      } else {
        result += dahgan[d];
      }
    }
    if (y > 0) {
      if (result) result += ' و ';
      result += yekan[y];
    }
    return result;
  };

  let word = '';
  let stepCount = 0;
  let temp = Math.floor(num);

  while (temp > 0) {
    const section = temp % 1000;
    if (section > 0) {
      const sectionWord = convertThreeDigit(section);
      const stepWord = steps[stepCount] ? ' ' + steps[stepCount] : '';
      word = sectionWord + stepWord + (word ? ' و ' + word : '');
    }
    temp = Math.floor(temp / 1000);
    stepCount++;
  }
  return word.trim();
}
