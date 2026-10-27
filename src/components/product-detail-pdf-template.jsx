import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatRupiah, formatPercentage } from '../utils/formatters'

const styles = StyleSheet.create({
  page: { paddingTop: 30, paddingBottom: 48, paddingHorizontal: 38, fontSize: 9, color: '#20201E', fontFamily: 'Helvetica' },
  header: { padding: 16, marginBottom: 16, backgroundColor: '#20201E', borderLeftWidth: 5, borderLeftColor: '#C86B2A' },
  brand: { fontSize: 8, color: '#E28A4A', fontFamily: 'Helvetica-Bold', letterSpacing: 1.6, marginBottom: 8 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', marginBottom: 5 },
  muted: { color: '#D0CECA', fontSize: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#20201E' },
  description: { color: '#E2E0DC', lineHeight: 1.45, marginTop: 8 },
  summaryGrid: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  summaryCard: { flexGrow: 1, flexBasis: 0, padding: 10, backgroundColor: '#F0EFEC', borderTopWidth: 2, borderTopColor: '#B8B5AF' },
  primarySummaryCard: { backgroundColor: '#20201E', borderTopColor: '#C86B2A' },
  summaryLabel: { color: '#66635E', fontSize: 7, marginBottom: 5 },
  primarySummaryLabel: { color: '#D0CECA' },
  summaryValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#20201E' },
  primarySummaryValue: { color: '#FFFFFF' },
  table: { width: '100%' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#20201E', color: '#FFFFFF', borderBottomWidth: 2, borderBottomColor: '#C86B2A' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: '#D9D7D2' },
  tableRowAlt: { flexDirection: 'row', backgroundColor: '#F3F2EF', borderBottomWidth: 0.6, borderBottomColor: '#D9D7D2' },
  cell: { paddingVertical: 7, paddingHorizontal: 5, fontSize: 8 },
  cellHeader: { paddingVertical: 7, paddingHorizontal: 5, fontSize: 8, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
  number: { width: '7%', textAlign: 'center' },
  material: { width: '36%' },
  category: { width: '19%' },
  qty: { width: '12%', textAlign: 'right' },
  price: { width: '13%', textAlign: 'right' },
  subtotal: { width: '13%', textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 9, marginTop: 2, borderTopWidth: 1.5, borderTopColor: '#20201E' },
  totalLabel: { fontFamily: 'Helvetica-Bold' },
  parameterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 0.6, borderBottomColor: '#D9D7D2' },
  parameterLabel: { color: '#55534E' },
  parameterValue: { fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 20, left: 38, right: 38, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#B8B5AF', color: '#66635E', fontSize: 8, textAlign: 'right' },
})

const ProductDetailPdfDocument = ({ product, exportDate }) => {
  const materials = product.bill_of_materials || []
  const marginJual = product.margin_jual_percentage ?? 20
  const admin = product.admin_marketplace_percentage ?? 5

  return (
    <Document title={`Detail Produk - ${product.name}`} author="ReKal">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.brand}>REKAL / DOKUMENTASI PRODUK</Text>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.muted}>Diekspor pada {exportDate}</Text>
          {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.primarySummaryCard]}><Text style={[styles.summaryLabel, styles.primarySummaryLabel]}>HARGA PABRIK</Text><Text style={[styles.summaryValue, styles.primarySummaryValue]}>{formatRupiah(product.harga_pabrik)}</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryLabel}>HPP FINAL</Text><Text style={styles.summaryValue}>{formatRupiah(product.production_cost)}</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryLabel}>HARGA JUAL</Text><Text style={styles.summaryValue}>{formatRupiah(product.estimated_selling_price)}</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryLabel}>HARGA MARKETPLACE</Text><Text style={styles.summaryValue}>{formatRupiah(product.harga_marketplace)}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Komposisi Material (BoM)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellHeader, styles.number]}>No</Text><Text style={[styles.cellHeader, styles.material]}>Material</Text>
              <Text style={[styles.cellHeader, styles.category]}>Kategori</Text><Text style={[styles.cellHeader, styles.qty]}>Jumlah</Text>
              <Text style={[styles.cellHeader, styles.price]}>Harga / unit</Text><Text style={[styles.cellHeader, styles.subtotal]}>Subtotal</Text>
            </View>
            {materials.length ? materials.map((item, index) => (
              <View key={item.id || `${item.material_id}-${index}`} style={index % 2 ? styles.tableRowAlt : styles.tableRow} wrap={false}>
                <Text style={[styles.cell, styles.number]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.material]}>{item.materials?.name || 'Material'}</Text>
                <Text style={[styles.cell, styles.category]}>{item.materials?.categories?.name || '—'}</Text>
                <Text style={[styles.cell, styles.qty]}>{item.quantity} {item.materials?.unit || ''}</Text>
                <Text style={[styles.cell, styles.price]}>{formatRupiah(item.price)}</Text>
                <Text style={[styles.cell, styles.subtotal]}>{formatRupiah(item.subtotal ?? item.price * item.quantity)}</Text>
              </View>
            )) : <Text style={[styles.cell, { color: '#64748B' }]}>Belum ada material.</Text>}
          </View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Biaya Material</Text><Text style={styles.totalLabel}>{formatRupiah(product.total_material_cost)}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parameter Perhitungan</Text>
          {[
            ['Overhead (% dari total material)', product.overhead_percentage],
            ['Margin Pabrik (% dari harga pabrik)', product.target_margin_percentage],
            ['Margin Jual (% dari harga jual)', marginJual],
            ['Admin Marketplace (% dari harga marketplace)', admin],
          ].map(([label, value]) => (
            <View key={label} style={styles.parameterRow} wrap={false}>
              <Text style={styles.parameterLabel}>{label}</Text><Text style={styles.parameterValue}>{formatPercentage(value)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `ReKal · Detail produk · Halaman ${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}

export { ProductDetailPdfDocument }
