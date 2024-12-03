import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck, 
  Package, 
  Wallet, 
  Ticket, 
  Users, 
  BarChart, 
  Settings,
  Menu,
  X,
  Notebook,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { 
    path: '/', 
    icon: LayoutDashboard, 
    label: 'Tableau de bord',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    path: '/factures', 
    icon: FileText, 
    label: 'Factures',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    path: '/devis', 
    icon: FileCheck, 
    label: 'Devis',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  { 
    path: '/articles', 
    icon: Package, 
    label: 'Articles',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  { 
    path: '/paiements', 
    icon: Wallet, 
    label: 'Paiements',
    gradient: 'from-green-500 to-green-600'
  },
  { 
    path: '/tickets', 
    icon: Ticket, 
    label: 'Tickets',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  { 
    path: '/clients', 
    icon: Users, 
    label: 'Clients',
    gradient: 'from-orange-500 to-orange-600'
  },
  { 
    path: '/notes', 
    icon: Notebook, 
    label: 'Notes',
    gradient: 'from-pink-500 to-pink-600'
  },
  { 
    path: '/rapports', 
    icon: BarChart, 
    label: 'Rapports',
    gradient: 'from-red-500 to-red-600'
  },
  { 
    path: '/parametres', 
    icon: Settings, 
    label: 'Paramètres',
    gradient: 'from-gray-600 to-gray-700'
  },
];

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-xl tracking-tight text-white">Tech Repair Pro</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 hover:bg-white/10 rounded-lg text-white transition-colors"
        >
          {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:w-72
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-gradient-to-b from-gray-900 to-gray-800 w-72 shadow-xl
      `}>
        <div className="h-full px-4 py-6 flex flex-col">
          <div className="hidden lg:flex items-center mb-10 px-2">
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Tech Repair Pro
            </span>
          </div>
          
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative flex items-center px-4 py-3 rounded-xl text-sm font-medium tracking-wide
                  transition-all duration-200 ease-in-out group
                  ${isActive 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                    : 'text-gray-300 hover:bg-white/10'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    <ChevronRight className={`
                      w-4 h-4 ml-auto transform transition-transform duration-200
                      ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `} />
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                           style={{
                             backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                             '--tw-gradient-from': `var(--tw-${item.gradient.split('-')[1]}-500)`,
                             '--tw-gradient-to': `var(--tw-${item.gradient.split('-')[1]}-600)`
                           }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-700/50">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm">
              <p className="text-sm font-medium text-gray-300">Tech Repair Pro</p>
              <p className="text-xs text-gray-400">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        lg:ml-72 
        transition-all duration-200
        min-h-screen
        bg-gray-50
      `}>
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;