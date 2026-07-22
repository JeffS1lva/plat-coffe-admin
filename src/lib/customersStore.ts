/**
 * Cadastro de clientes do admin. Mesmo padrão do orderQueue.ts: localStorage
 * + assinatura, para persistir entre reloads e sincronizar entre abas.
 */

export type CustomerStatus = 'ativo' | 'vip' | 'inativo';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  since: number;
}

const STORAGE_KEY = 'bole_admin_customers_v1';

const SEED: Customer[] = [
  { id: 'c1', name: 'Ana Beatriz Souza', email: 'ana.souza@email.com', phone: '(11) 98211-4432', status: 'vip', totalOrders: 28, totalSpent: 1420.5, since: Date.now() - 1000 * 60 * 60 * 24 * 210 },
  { id: 'c2', name: 'Carlos Eduardo Lima', email: 'cadu.lima@email.com', phone: '(11) 97744-1290', status: 'ativo', totalOrders: 12, totalSpent: 610.0, since: Date.now() - 1000 * 60 * 60 * 24 * 140 },
  { id: 'c3', name: 'Fernanda Ribeiro', email: 'fe.ribeiro@email.com', phone: '(11) 99123-8890', status: 'ativo', totalOrders: 6, totalSpent: 289.9, since: Date.now() - 1000 * 60 * 60 * 24 * 60 },
  { id: 'c4', name: 'João Pedro Alves', email: 'jp.alves@email.com', phone: '(11) 98890-2211', status: 'inativo', totalOrders: 3, totalSpent: 95.0, since: Date.now() - 1000 * 60 * 60 * 24 * 300 },
  { id: 'c5', name: 'Marina Torres', email: 'marina.torres@email.com', phone: '(11) 97012-5567', status: 'vip', totalOrders: 41, totalSpent: 2180.75, since: Date.now() - 1000 * 60 * 60 * 24 * 365 },
  { id: 'c6', name: 'Rafael Nogueira', email: 'rafa.nog@email.com', phone: '(11) 98675-3321', status: 'ativo', totalOrders: 9, totalSpent: 412.3, since: Date.now() - 1000 * 60 * 60 * 24 * 45 },
];

type Listener = (customers: Customer[]) => void;
const listeners = new Set<Listener>();

function read(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      write(SEED);
      return SEED;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(customers: Customer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((listener) => listener(customers));
}

export function getCustomers(): Customer[] {
  return read().sort((a, b) => b.since - a.since);
}

export function addCustomer(customer: Omit<Customer, 'id' | 'since' | 'totalOrders' | 'totalSpent'>): Customer {
  const newCustomer: Customer = {
    ...customer,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    totalOrders: 0,
    totalSpent: 0,
    since: Date.now(),
  };
  write([...read(), newCustomer]);
  return newCustomer;
}

export function updateCustomer(id: string, patch: Partial<Omit<Customer, 'id'>>) {
  write(read().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

export function removeCustomer(id: string) {
  write(read().filter((c) => c.id !== id));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener(read());
  };
  window.addEventListener('storage', handler);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handler);
  };
}
