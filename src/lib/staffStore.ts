/**
 * Cadastro de membros da equipe do admin. Mesmo padrão do orderQueue.ts:
 * localStorage + assinatura, para persistir entre reloads e sincronizar entre abas.
 */

export type StaffRole = 'Administrador' | 'Atendente' | 'Cozinha' | 'Entregador';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  since: number;
}

const STORAGE_KEY = 'bole_admin_staff_v3';

const SEED: StaffMember[] = [
  { id: 's1', name: 'Juliana Prado', email: 'juliana.prado@bole.com', role: 'Administrador', active: true, since: Date.now() - 1000 * 60 * 60 * 24 * 400 },
  { id: 's2', name: 'Marcos Vinícius', email: 'marcos.v@bole.com', role: 'Cozinha', active: true, since: Date.now() - 1000 * 60 * 60 * 24 * 220 },
  { id: 's3', name: 'Bianca Farias', email: 'bianca.farias@bole.com', role: 'Atendente', active: true, since: Date.now() - 1000 * 60 * 60 * 24 * 150 },
  { id: 's5', name: 'Patrícia Gomes', email: 'patricia.gomes@bole.com', role: 'Atendente', active: false, since: Date.now() - 1000 * 60 * 60 * 24 * 260 },
];

type Listener = (staff: StaffMember[]) => void;
const listeners = new Set<Listener>();

function read(): StaffMember[] {
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

function write(staff: StaffMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((listener) => listener(staff));
}

export function getStaff(): StaffMember[] {
  return read().sort((a, b) => b.since - a.since);
}

export function addStaffMember(member: Omit<StaffMember, 'id' | 'since'>): StaffMember {
  const newMember: StaffMember = {
    ...member,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    since: Date.now(),
  };
  write([...read(), newMember]);
  return newMember;
}

export function updateStaffMember(id: string, patch: Partial<Omit<StaffMember, 'id'>>) {
  write(read().map((s) => (s.id === id ? { ...s, ...patch } : s)));
}

export function removeStaffMember(id: string) {
  write(read().filter((s) => s.id !== id));
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
