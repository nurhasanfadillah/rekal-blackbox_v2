import { Link, NavLink } from 'react-router-dom'
import {
  Calculator,
  Database,
  LayoutDashboard,
  Layers,
  Package,
  Plus,
  ShoppingBag
} from 'lucide-react'

const workspaceItems = [
  { to: '/', icon: LayoutDashboard, label: 'Beranda', end: true },
  { to: '/products', icon: ShoppingBag, label: 'Produk' },
  { to: '/price-simulation', icon: Calculator, label: 'Simulasi harga' },
]

const catalogItems = [
  { to: '/materials', icon: Package, label: 'Material' },
  { to: '/categories', icon: Layers, label: 'Kategori' },
]

const NavigationLink = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.end}
    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
  >
    <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
    <span>{item.label}</span>
  </NavLink>
)

const SidebarNav = () => (
  <aside className="sidebar-shell">
    <Link to="/" className="sidebar-brand" aria-label="ReKal, beranda">
      <span className="sidebar-brand-mark"><Calculator className="w-5 h-5" strokeWidth={2.2} /></span>
      <span className="sidebar-brand-name">ReKal<span>.</span><small>BLACKBOX</small></span>
    </Link>

    <div className="sidebar-create-wrap">
      <Link to="/products/new" className="sidebar-create">
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>Tambah Produk</span>
      </Link>
    </div>

    <nav className="sidebar-navigation" aria-label="Navigasi utama">
      <p className="sidebar-section-label">WORKSPACE</p>
      <div className="sidebar-link-list">
        {workspaceItems.map(item => <NavigationLink key={item.to} item={item} />)}
      </div>

      <p className="sidebar-section-label sidebar-section-spaced"><Database className="w-3.5 h-3.5" /> KATALOG</p>
      <div className="sidebar-link-list">
        {catalogItems.map(item => <NavigationLink key={item.to} item={item} />)}
      </div>
    </nav>

    <div className="sidebar-footer">
      <span className="sidebar-footer-mark" />
      <div>
        <p>ReKal Costing Workspace</p>
        <span>PT. Redone Berkah Mandiri</span>
      </div>
    </div>
  </aside>
)

export default SidebarNav
