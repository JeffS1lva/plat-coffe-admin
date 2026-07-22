import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  type Customer, type CustomerStatus,
  getCustomers, subscribe, addCustomer, updateCustomer, removeCustomer,
} from '../lib/customersStore';
import { PageHeader } from '../layout/PageHeader';

const STATUS_STYLE: Record<CustomerStatus, string> = {
  vip: 'bg-orange-100 text-orange-700',
  ativo: 'bg-emerald-100 text-emerald-700',
  inativo: 'bg-gray-100 text-gray-500',
};

const STATUS_LABEL: Record<CustomerStatus, string> = {
  vip: 'VIP',
  ativo: 'Ativo',
  inativo: 'Inativo',
};

const EMPTY_FORM = { name: '', email: '', phone: '', status: 'ativo' as CustomerStatus };

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setCustomers(getCustomers());
    return subscribe(setCustomers);
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase())
  );

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({ name: c.name, email: c.email, phone: c.phone, status: c.status });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Preencha nome e e-mail');
      return;
    }
    if (editingId) {
      updateCustomer(editingId, form);
      toast.success('Cliente atualizado');
    } else {
      addCustomer(form);
      toast.success('Cliente adicionado');
    }
    setOpen(false);
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-y-auto">
      <PageHeader
        title="Clientes"
        subtitle={`${customers.length} cliente(s) cadastrado(s)`}
        action={
          <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" /> Novo cliente
          </Button>
        }
      />

      <div className="px-6 lg:px-10 py-6 lg:py-8 space-y-4">
        <div className="relative max-w-sm">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contato</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pedidos</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total gasto</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{c.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <div className="flex items-center gap-1.5 text-xs"><Mail className="h-3 w-3" /> {c.email}</div>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5"><Phone className="h-3 w-3" /> {c.phone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={`${STATUS_STYLE[c.status]} text-[10px] font-bold`}>{STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{c.totalOrders}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-700">R$ {c.totalSpent.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} aria-label="Editar cliente">
                          <Pencil className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { removeCustomer(c.id); toast('Cliente removido'); }}
                          aria-label="Remover cliente"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-300 text-xs">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Nome completo</Label>
              <Input id="cust-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-email">E-mail</Label>
              <Input id="cust-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">Telefone</Label>
              <Input id="cust-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-status">Status</Label>
              <select
                id="cust-status"
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 text-sm outline-none focus:border-orange-400"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CustomerStatus }))}
              >
                <option value="ativo">Ativo</option>
                <option value="vip">VIP</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90" onClick={save}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
