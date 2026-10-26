import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Calculator } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/materials', icon: Package, label: 'Material' },
  { to: '/products', icon: ShoppingBag, label: 'Produk' },
  { to: '/price-simulation', icon: Calculator, label: 'Simulasi' },
]

const SidebarNav = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface-1 border-r border-hairline z-40 flex flex-col">
      <div className="px-6 py-5 border-b border-hairline">
        <span className="text-base font-bold text-ink tracking-tight">ReKal</span>
        <p className="text-xs text-ink-muted mt-0.5">Kalkulator HPP</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded transition-colors duration-100 ${
                isActive
                  ? 'bg-accent-blue text-white'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-2'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-hairline">
        <p className="text-xs text-ink-muted">PT. Redone Berkah Mandiri</p>
      </div>
    </aside>
  )
}

export default SidebarNav
