import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, Pencil, Trash2, Plus, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  type StaffMember, type StaffRole,
  getStaff, subscribe, addStaffMember, updateStaffMember, removeStaffMember,
} from '../lib/staffStore';
import { PageHeader } from '../layout/PageHeader';

const ROLE_STYLE: Record<StaffRole, string> = {
  Administrador: 'bg-orange-100 text-orange-700',
  Atendente: 'bg-blue-100 text-blue-700',
  Cozinha: 'bg-amber-100 text-amber-700',
  Entregador: 'bg-emerald-100 text-emerald-700',
};

const EMPTY_FORM = { name: '', email: '', role: 'Atendente' as StaffRole, active: true };

export function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setStaff(getStaff());
    return subscribe(setStaff);
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (s: StaffMember) => {
    setEditingId(s.id);
    setForm({ name: s.name, email: s.email, role: s.role, active: s.active });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Preencha nome e e-mail');
      return;
    }
    if (editingId) {
      updateStaffMember(editingId, form);
      toast.success('Membro atualizado');
    } else {
      addStaffMember(form);
      toast.success('Membro adicionado à equipe');
    }
    setOpen(false);
  };

  const activeCount = staff.filter((s) => s.active).length;

  return (
    <div className="h-full flex flex-col min-h-0 overflow-y-auto">
      <PageHeader
        title="Equipe"
        subtitle={`${activeCount} de ${staff.length} membro(s) ativo(s)`}
        action={
          <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" /> Novo membro
          </Button>
        }
      />

      <div className="px-6 lg:px-10 py-6 lg:py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nome</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contato</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Papel</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{s.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <div className="flex items-center gap-1.5 text-xs"><Mail className="h-3 w-3" /> {s.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={`${ROLE_STYLE[s.role]} text-[10px] font-bold`}>{s.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => updateStaffMember(s.id, { active: !s.active })}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Power className="h-3 w-3" /> {s.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} aria-label="Editar membro">
                          <Pencil className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { removeStaffMember(s.id); toast('Membro removido'); }}
                          aria-label="Remover membro"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-300 text-xs">
                      Nenhum membro cadastrado
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
            <DialogTitle>{editingId ? 'Editar membro' : 'Novo membro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">Nome completo</Label>
              <Input id="staff-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">E-mail</Label>
              <Input id="staff-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-role">Papel</Label>
              <select
                id="staff-role"
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 text-sm outline-none focus:border-orange-400"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffRole }))}
              >
                <option value="Administrador">Administrador</option>
                <option value="Atendente">Atendente</option>
                <option value="Cozinha">Cozinha</option>
                <option value="Entregador">Entregador</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 accent-orange-500"
              />
              Ativo
            </label>
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
