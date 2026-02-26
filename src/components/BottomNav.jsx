import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Layers, Package, ShoppingBag } from 'lucide-react'

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/categories', icon: Layers, label: 'Kategori' },
    { to: '/materials', icon: Package, label: 'Material' },
    { to: '/products', icon: ShoppingBag, label: 'Produk' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 safe-area-bottom z-40">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
