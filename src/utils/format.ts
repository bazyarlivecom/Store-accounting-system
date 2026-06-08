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
