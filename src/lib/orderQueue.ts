/**
 * Leitor somente-leitura da fila de pedidos do projeto plat-coffe (loja).
 * Mesma chave e formato de localStorage — só funciona porque em produção
 * loja e admin são servidos sob a mesma origem (ex: seusite.com/ e
 * seusite.com/admin). O admin nunca escreve aqui: gestão de pedidos é
 * exclusiva do painel de equipe dos colaboradores.
 */

export type QueueStatus = 'recebido' | 'preparando' | 'pronto' | 'entregue';

export interface QueueItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface QueueOrder {
  id: string;
  orderNumber: string;
  items: QueueItem[];
  total: number;
  paymentMethod: 'card' | 'pix';
  installments: string;
  status: QueueStatus;
  createdAt: number;
}

const STORAGE_KEY = 'bole_order_queue_v1';

type Listener = (orders: QueueOrder[]) => void;
const listeners = new Set<Listener>();

function read(): QueueOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOrders(): QueueOrder[] {
  return read().sort((a, b) => a.createdAt - b.createdAt);
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
