import { collection, doc, getDoc, setDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface CompanySettings {
  storeName: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  currency?: string;
}

export const getStoreSettings = async (): Promise<CompanySettings | null> => {
  try {
    const docRef = doc(db, 'settings', 'company_profile');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CompanySettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/company_profile');
    return null;
  }
};

export const saveStoreSettings = async (settings: CompanySettings): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'company_profile');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/company_profile');
  }
};

export const getPersons = async () => {
  try {
    const q = query(collection(db, 'persons'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'persons');
    return [];
  }
};

export const addPerson = async (person: any) => {
  try {
    const newDocRef = doc(collection(db, 'persons'));
    const now = Date.now();
    const data = { ...person, createdAt: now, updatedAt: now };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'persons');
  }
};

export const updatePerson = async (id: string, person: any) => {
  try {
    const docRef = doc(db, 'persons', id);
    const data = { ...person, updatedAt: Date.now() };
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `persons/${id}`);
  }
};

export const deletePerson = async (id: string) => {
  try {
    const docRef = doc(db, 'persons', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `persons/${id}`);
  }
};

export const getAccounts = async () => {
  try {
    const q = query(collection(db, 'accounts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'accounts');
    return [];
  }
};

export const addAccount = async (account: any) => {
  try {
    const newDocRef = doc(collection(db, 'accounts'));
    const now = Date.now();
    const data = { ...account, createdAt: now, updatedAt: now };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'accounts');
  }
};

export const updateAccount = async (id: string, account: any) => {
  try {
    const docRef = doc(db, 'accounts', id);
    const data = { ...account, updatedAt: Date.now() };
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `accounts/${id}`);
  }
};

export const deleteAccount = async (id: string) => {
  try {
    const docRef = doc(db, 'accounts', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `accounts/${id}`);
  }
};

export const getCashboxes = async () => {
  try {
    const q = query(collection(db, 'cashboxes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'cashboxes');
    return [];
  }
};

export const addCashbox = async (cashbox: any) => {
  try {
    const newDocRef = doc(collection(db, 'cashboxes'));
    const now = Date.now();
    const data = { ...cashbox, createdAt: now, updatedAt: now };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'cashboxes');
  }
};

export const updateCashbox = async (id: string, cashbox: any) => {
  try {
    const docRef = doc(db, 'cashboxes', id);
    const data = { ...cashbox, updatedAt: Date.now() };
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `cashboxes/${id}`);
  }
};

export const deleteCashbox = async (id: string) => {
  try {
    const docRef = doc(db, 'cashboxes', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `cashboxes/${id}`);
  }
};

export const getProducts = async () => {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return [];
  }
};

export const addProduct = async (product: any) => {
  try {
    const newDocRef = doc(collection(db, 'products'));
    const now = Date.now();
    const data = { ...product, createdAt: now, updatedAt: now };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
  }
};

export const updateProduct = async (id: string, product: any) => {
  try {
    const docRef = doc(db, 'products', id);
    const data = { ...product, updatedAt: Date.now() };
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
};

export const getTransactions = async () => {
  try {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'transactions');
    return [];
  }
};

export const addTransaction = async (transaction: any) => {
  try {
    const newDocRef = doc(collection(db, 'transactions'));
    const now = Date.now();
    const data = { ...transaction, createdAt: now, updatedAt: now };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'transactions');
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    const docRef = doc(db, 'transactions', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
  }
};

export const getInvoices = async () => {
  try {
    const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'invoices');
    return [];
  }
};

export const addInvoice = async (invoice: any) => {
  try {
    const newDocRef = doc(collection(db, 'invoices'));
    const now = Date.now();
    const data = { ...invoice, createdAt: now, updatedAt: now };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'invoices');
  }
};

export const deleteInvoice = async (id: string) => {
  try {
    const docRef = doc(db, 'invoices', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `invoices/${id}`);
  }
};
