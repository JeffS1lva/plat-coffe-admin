import { useEffect, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Users, Crown, UserCog, UserCheck, ShoppingBag, DollarSign, Receipt, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCustomers, subscribe as subscribeCustomers, type Customer, type CustomerStatus } from '../lib/customersStore';
import { getStaff, subscribe as subscribeStaff, type StaffMember, type StaffRole } from '../lib/staffStore';
import { getOrders, subscribe as subscribeOrders, type QueueOrder, type QueueStatus } from '../lib/orderQueue';
import { PageHeader } from '../layout/PageHeader';

const CUSTOMER_STATUS_META: Record<CustomerStatus, { label: string; dot: string; soft: string; text: string }> = {
  vip: { label: 'VIP', dot: 'bg-orange-500', soft: 'bg-orange-100', text: 'text-orange-700' },
  ativo: { label: 'Ativo', dot: 'bg-emerald-500', soft: 'bg-emerald-100', text: 'text-emerald-700' },
  inativo: { label: 'Inativo', dot: 'bg-gray-400', soft: 'bg-gray-100', text: 'text-gray-500' },
};

const ROLE_META: Record<StaffRole, { dot: string; soft: string; text: string }> = {
  Administrador: { dot: 'bg-orange-500', soft: 'bg-orange-100', text: 'text-orange-700' },
  Atendente: { dot: 'bg-blue-500', soft: 'bg-blue-100', text: 'text-blue-700' },
  Cozinha: { dot: 'bg-amber-500', soft: 'bg-amber-100', text: 'text-amber-700' },
  Entregador: { dot: 'bg-emerald-500', soft: 'bg-emerald-100', text: 'text-emerald-700' },
};

const ORDER_STATUS_META: Record<QueueStatus, { label: string; dot: string }> = {
  recebido: { label: 'Recebidos', dot: 'bg-slate-500' },
  preparando: { label: 'Preparando', dot: 'bg-blue-500' },
  pronto: { label: 'Prontos', dot: 'bg-amber-500' },
  entregue: { label: 'Entregues', dot: 'bg-emerald-500' },
};

const ROLES: StaffRole[] = ['Administrador', 'Atendente', 'Cozinha', 'Entregador'];
const CUSTOMER_STATUSES: CustomerStatus[] = ['vip', 'ativo', 'inativo'];
const ORDER_STATUSES: QueueStatus[] = ['recebido', 'preparando', 'pronto', 'entregue'];

function money(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

function StatCard({ icon: Icon, label, value, hint, accent }: {
  icon: LucideIcon; label: string; value: string; hint: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        <div className={`p-1.5 rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 mt-3 tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}

function BreakdownPanel({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <div>
        <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
      {footer}
    </div>
  );
}

function BarRow({ label, dot, count, pct }: { label: string; dot: string; count: number; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="flex items-center gap-2 text-gray-600 font-medium">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {label}
        </span>
        <span className="font-bold text-gray-800">{count}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${dot} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [orders, setOrders] = useState<QueueOrder[]>([]);

  useEffect(() => {
    setCustomers(getCustomers());
    return subscribeCustomers(setCustomers);
  }, []);

  useEffect(() => {
    setStaff(getStaff());
    return subscribeStaff(setStaff);
  }, []);

  useEffect(() => {
    setOrders(getOrders());
    return subscribeOrders(setOrders);
  }, []);

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter((o) => o.createdAt >= todayStart);
  const revenueToday = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const avgTicketToday = todaysOrders.length ? revenueToday / todaysOrders.length : 0;
  const activeOrders = orders.filter((o) => o.status !== 'entregue').length;

  const vipCount = customers.filter((c) => c.status === 'vip').length;
  const activeStaffCount = staff.filter((s) => s.active).length;
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const recentCustomers = customers.slice(0, 6);
  const recentStaff = staff.slice(0, 6);

  const maxCustomerStatus = Math.max(1, ...CUSTOMER_STATUSES.map((s) => customers.filter((c) => c.status === s).length));
  const maxRole = Math.max(1, ...ROLES.map((r) => staff.filter((s) => s.role === r).length));
  const maxOrderStatus = Math.max(1, ...ORDER_STATUSES.map((s) => orders.filter((o) => o.status === s).length));

  return (
    <div className="h-full flex flex-col min-h-0 overflow-y-auto">
      <PageHeader title="Dashboard" subtitle="Visão geral da loja, clientes e equipe" />

      <div className="px-6 lg:px-10 py-6 lg:py-8 space-y-6">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingBag} label="Pedidos hoje" value={String(todaysOrders.length)}
            hint={`${orders.length} no total`} accent="bg-slate-100 text-slate-600"
          />
          <StatCard
            icon={DollarSign} label="Faturamento hoje" value={money(revenueToday)}
            hint="Somatório dos pedidos de hoje" accent="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            icon={Receipt} label="Ticket médio hoje" value={money(avgTicketToday)}
            hint="Faturamento ÷ pedidos" accent="bg-amber-100 text-amber-600"
          />
          <StatCard
            icon={Activity} label="Pedidos ativos" value={String(activeOrders)}
            hint="Ainda não entregues" accent="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Users} label="Clientes" value={String(customers.length)}
            hint="cadastrados" accent="bg-slate-100 text-slate-600"
          />
          <StatCard
            icon={Crown} label="Clientes VIP" value={String(vipCount)}
            hint={money(totalSpent) + ' em compras no total'} accent="bg-orange-100 text-orange-600"
          />
          <StatCard
            icon={UserCog} label="Equipe" value={String(staff.length)}
            hint="membros cadastrados" accent="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={UserCheck} label="Equipe ativa" value={`${activeStaffCount}/${staff.length}`}
            hint="disponíveis agora" accent="bg-emerald-100 text-emerald-600"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <BreakdownPanel title="Pedidos por status" subtitle="Distribuição atual da fila da loja">
            {ORDER_STATUSES.map((status) => {
              const meta = ORDER_STATUS_META[status];
              const count = orders.filter((o) => o.status === status).length;
              return <BarRow key={status} label={meta.label} dot={meta.dot} count={count} pct={Math.round((count / maxOrderStatus) * 100)} />;
            })}
          </BreakdownPanel>

          <BreakdownPanel
            title="Clientes por status" subtitle="Distribuição da carteira de clientes"
            footer={
              <div className="pt-2 border-t border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Clientes recentes</h3>
                {recentCustomers.length === 0 ? (
                  <p className="text-xs text-gray-300 py-4 text-center">Nenhum cliente ainda</p>
                ) : (
                  <div className="space-y-2">
                    {recentCustomers.map((c) => {
                      const meta = CUSTOMER_STATUS_META[c.status];
                      return (
                        <div key={c.id} className="flex items-center justify-between text-sm py-1.5">
                          <span className="font-medium text-gray-700 truncate">{c.name}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-gray-400">{c.totalOrders} pedido(s)</span>
                            <Badge className={`${meta.soft} ${meta.text} text-[10px] font-bold`}>{meta.label}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            }
          >
            {CUSTOMER_STATUSES.map((status) => {
              const meta = CUSTOMER_STATUS_META[status];
              const count = customers.filter((c) => c.status === status).length;
              return <BarRow key={status} label={meta.label} dot={meta.dot} count={count} pct={Math.round((count / maxCustomerStatus) * 100)} />;
            })}
          </BreakdownPanel>

          <BreakdownPanel
            title="Equipe por papel" subtitle="Distribuição dos cargos"
            footer={
              <div className="pt-2 border-t border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Membros recentes</h3>
                {recentStaff.length === 0 ? (
                  <p className="text-xs text-gray-300 py-4 text-center">Nenhum membro ainda</p>
                ) : (
                  <div className="space-y-2">
                    {recentStaff.map((s) => {
                      const meta = ROLE_META[s.role];
                      return (
                        <div key={s.id} className="flex items-center justify-between text-sm py-1.5">
                          <span className="font-medium text-gray-700 truncate">{s.name}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs ${s.active ? 'text-emerald-600' : 'text-gray-300'}`}>
                              {s.active ? 'Ativo' : 'Inativo'}
                            </span>
                            <Badge className={`${meta.soft} ${meta.text} text-[10px] font-bold`}>{s.role}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            }
          >
            {ROLES.map((role) => {
              const meta = ROLE_META[role];
              const count = staff.filter((s) => s.role === role).length;
              return <BarRow key={role} label={role} dot={meta.dot} count={count} pct={Math.round((count / maxRole) * 100)} />;
            })}
          </BreakdownPanel>
        </div>
      </div>
    </div>
  );
}
