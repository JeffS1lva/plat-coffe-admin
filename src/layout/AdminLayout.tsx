import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Truck } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users, end: false },
  { to: '/equipe', label: 'Equipe', icon: UserCog, end: false },
];

export function AdminLayout() {
  return (
    <div className="h-screen flex bg-slate-50">
      <aside className="w-16 lg:w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-3 lg:px-6 py-6 flex items-center justify-center lg:justify-start gap-3 border-b border-gray-100">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2.5 rounded-2xl shadow-sm shrink-0">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <p className="font-bold text-gray-900 leading-tight">Bolê Admin</p>
            <p className="text-xs text-gray-400">Painel administrativo</p>
          </div>
        </div>

        <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
