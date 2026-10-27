import { NavLink } from 'react-router-dom'
import { Layers, Package } from 'lucide-react'

const items = [
  { to: '/materials', label: 'Material', icon: Package, end: true },
  { to: '/categories', label: 'Kategori', icon: Layers, end: true },
]

const CatalogTabs = () => (
  <nav className="catalog-tabs" aria-label="Navigasi katalog">
    {items.map(item => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) => `catalog-tab ${isActive ? 'active' : ''}`}
      >
        <item.icon className="w-4 h-4" />
        {item.label}
      </NavLink>
    ))}
  </nav>
)

export default CatalogTabs
