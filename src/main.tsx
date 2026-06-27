import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';
import { AuthProvider } from './context/AuthContext';

// Add global form validation message localization
document.addEventListener('invalid', (e) => {
  const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  if (target && target.validity) {
    if (target.validity.valueMissing) {
      target.setCustomValidity('لطفا این قسمت را پر کنید.');
    } else if (target.validity.typeMismatch) {
      target.setCustomValidity('لطفا یک مقدار معتبر وارد کنید.');
    } else if (target.validity.rangeUnderflow) {
      const min = target.getAttribute('min');
      target.setCustomValidity(min ? `مقدار باید بزرگتر یا مساوی ${min} باشد.` : 'مقدار وارد شده کمتر از حد مجاز است.');
    } else if (target.validity.stepMismatch) {
      target.setCustomValidity('لطفا یک مقدار معتبر وارد کنید.');
    } else {
      target.setCustomValidity('مقدار وارد شده نامعتبر است.');
    }
  }
}, true);

document.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  if (target && target.setCustomValidity) {
    target.setCustomValidity('');
  }
}, true);

document.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  if (target && target.setCustomValidity) {
    target.setCustomValidity('');
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

