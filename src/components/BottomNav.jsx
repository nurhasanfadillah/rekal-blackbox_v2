import { NavLink, useLocation } from 'react-router-dom'
import { Calculator, LayoutDashboard, Layers, ShoppingBag } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Beranda', end: true },
  { to: '/products', icon: ShoppingBag, label: 'Produk' },
  { to: '/materials', icon: Layers, label: 'Katalog' },
  { to: '/price-simulation', icon: Calculator, label: 'Simulasi' },
]

const BottomNav = () => {
  const { pathname } = useLocation()

  return (
    <nav className="mobile-navigation safe-area-bottom" aria-label="Navigasi utama">
      <div className="mobile-navigation-inner">
        {navItems.map(item => {
          const catalogActive = item.to === '/materials' && pathname.startsWith('/categories')

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `mobile-nav-item ${(isActive || catalogActive) ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon"><item.icon className="w-[19px] h-[19px]" strokeWidth={1.9} /></span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
