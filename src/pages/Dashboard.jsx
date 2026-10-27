import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { formatRupiah } from '../utils/formatters'
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Camera,
  Check,
  ChevronRight,
  AlertCircle,
  Layers,
  Package,
  Plus,
  ShoppingBag
} from 'lucide-react'

const Dashboard = () => {
  const {
    categories,
    materials,
    products,
    loading,
    error,
    connectionStatus,
    refreshAll
  } = useData()

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)

  const missingCatalog = categories.length === 0 || materials.length === 0
  const setupPath = categories.length === 0 ? '/categories' : '/materials'
  const setupLabel = categories.length === 0 ? 'Buat kategori' : 'Tambah material'

  return (
    <div className="page-container dashboard-page">
      <header className="dashboard-heading page-header">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> WORKSPACE / REKAL</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Hitung biaya. Tetapkan harga. Simpan dokumentasi produk.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/price-simulation" className="btn-secondary dashboard-secondary-action">
            <Calculator className="w-4 h-4" />
            <span>Simulasi harga</span>
          </Link>
        </div>
      </header>

      {connectionStatus === 'error' && error && (
        <div className="connection-banner" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Data belum dapat dimuat</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
          <span className="connection-banner-tag">PERIKSA KONEKSI</span>
        </div>
      )}

      <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
        <div className="dashboard-hero-copy">
          <div className="hero-kicker"><Calculator className="w-4 h-4" /> COSTING WORKSPACE</div>
          <h2 id="dashboard-hero-title">Dari bahan baku<br className="hidden sm:block" /> ke harga yang siap dijual.</h2>
          <p>Susun komposisi material dan parameter produksi, tinjau setiap tahap biaya, lalu simpan hasilnya sebagai dokumentasi produk.</p>
          <Link to="/products/new" className="hero-cta">
            Mulai dengan Tambah Produk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="calculation-track" aria-label="Tahapan hasil kalkulasi">
          <div className="track-heading">
            <span>RANTAI KALKULASI</span>
            <span className="track-status"><i /> SIAP</span>
          </div>
          <div className="track-step">
            <span className="track-index">01</span>
            <span className="track-label">Total Material</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="track-step">
            <span className="track-index">02</span>
            <span className="track-label">HPP Final</span>
            <Calculator className="w-4 h-4" />
          </div>
          <div className="track-step">
            <span className="track-index">03</span>
            <span className="track-label">Harga Pabrik & Jual</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="track-step track-step-last">
            <span className="track-index">04</span>
            <span className="track-label">Harga Marketplace</span>
            <Check className="w-4 h-4" />
          </div>
        </div>
      </section>

      {missingCatalog && !loading.categories && !loading.materials && (
        <section className="catalog-nudge">
          <div className="catalog-nudge-icon"><Layers className="w-5 h-5" /></div>
          <div className="catalog-nudge-copy">
            <p className="font-semibold">Siapkan katalog untuk kalkulasi</p>
            <p className="text-sm text-ink-muted">
              {categories.length === 0
                ? 'Buat kategori terlebih dahulu, lalu tambahkan material yang digunakan produk.'
                : 'Tambahkan minimal satu material agar bisa dipilih dalam komposisi produk.'}
            </p>
          </div>
          <Link to={setupPath} className="catalog-nudge-link">{setupLabel}<ChevronRight className="w-4 h-4" /></Link>
        </section>
      )}

      <section className="document-section" aria-labelledby="documents-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">ARSIP KALKULASI</p>
            <h2 id="documents-title" className="section-title">Dokumentasi Produk</h2>
            <p className="section-description">Produk tersimpan dengan rincian HPP dan harga jualnya.</p>
          </div>
          <Link to="/products" className="section-link">Semua produk <ArrowUpRight className="w-4 h-4" /></Link>
        </div>

        {loading.products ? (
          <div className="document-grid" aria-label="Memuat dokumentasi produk">
            {[0, 1, 2].map(item => <div key={item} className="document-skeleton" />)}
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="document-empty">
            <div className="document-empty-symbol"><ShoppingBag className="w-6 h-6" /></div>
            <div className="document-empty-copy">
              <h3>Belum ada dokumentasi produk</h3>
              <p>Mulai melalui Tambah Produk. Semua rincian komposisi dan hasil kalkulasi akan tersimpan pada produk tersebut.</p>
            </div>
            <Link to="/products/new" className="btn-primary"><Plus className="w-4 h-4" />Tambah Produk</Link>
          </div>
        ) : (
          <div className="document-grid">
            {recentProducts.map(product => {
              const photo = [...(product.product_photos || [])]
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]
              const photoUrl = photo?.photo_url || product.photo_url

              return (
                <Link key={product.id} to={`/products/${product.id}`} className="document-card">
                  <div className="document-card-top">
                    <div className="document-thumb">
                      {photoUrl ? <img src={photoUrl} alt="" /> : <Camera className="w-5 h-5" />}
                    </div>
                    <span className="document-type">TERSIMPAN</span>
                    <ArrowUpRight className="document-open w-4 h-4" />
                  </div>
                  <div className="document-card-title">
                    <h3>{product.name}</h3>
                    <p>{product.description || 'Dokumentasi kalkulasi produk'}</p>
                  </div>
                  <div className="document-values">
                    <div>
                      <span>HPP FINAL</span>
                      <strong>{formatRupiah(product.production_cost)}</strong>
                    </div>
                    <div>
                      <span>HARGA JUAL</span>
                      <strong className="document-selling-price">{formatRupiah(product.estimated_selling_price)}</strong>
                    </div>
                  </div>
                  <div className="document-card-footer">
                    <span><Package className="w-3.5 h-3.5" /> Buka rincian produk</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
