import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatRupiah } from '../utils/formatters'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingBottom: 48,
    paddingHorizontal: 38,
    fontSize: 9,
    color: '#20201E',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#20201E',
    borderLeftWidth: 5,
    borderLeftColor: '#C86B2A',
  },
  brand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.6,
    color: '#E28A4A',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: { fontSize: 8, color: '#D0CECA' },
  table: { width: '100%' },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#20201E',
    borderBottomWidth: 2,
    borderBottomColor: '#C86B2A',
  },
  thNo: { width: '8%', textAlign: 'center' },
  thNama: { width: '42%' },
  thHarga: { width: '25%', textAlign: 'right' },
  thHpp: { width: '25%', textAlign: 'right' },
  cellHeader: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: '#D9D7D2' },
  tableRowAlt: { flexDirection: 'row', backgroundColor: '#F3F2EF', borderBottomWidth: 0.6, borderBottomColor: '#D9D7D2' },
  cell: { paddingVertical: 7, paddingHorizontal: 6, fontSize: 8, color: '#20201E' },
  tdNo: { width: '8%', textAlign: 'center', color: '#66635E' },
  tdNama: { width: '42%', fontFamily: 'Helvetica-Bold' },
  tdHarga: { width: '25%', textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  tdHpp: { width: '25%', textAlign: 'right', color: '#55534E' },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 9,
    marginTop: 8,
    backgroundColor: '#20201E',
    borderLeftWidth: 4,
    borderLeftColor: '#C86B2A',
  },
  summaryLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#FFFFFF' },
  summaryCount: { fontSize: 9, color: '#D0CECA' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 38,
    right: 38,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#B8B5AF',
    color: '#66635E',
    fontSize: 8,
    textAlign: 'right',
  },
})

const ProductsPdfDocument = ({ products, exportDate }) => (
  <Document title="Daftar Produk ReKal" author="ReKal">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <Text style={styles.brand}>REKAL / DOKUMENTASI PRODUK</Text>
        <Text style={styles.title}>Daftar Produk</Text>
        <Text style={styles.subtitle}>Diekspor pada {exportDate}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.cellHeader, styles.thNo]}>No</Text>
          <Text style={[styles.cellHeader, styles.thNama]}>Nama Produk</Text>
          <Text style={[styles.cellHeader, styles.thHarga]}>Harga Pabrik</Text>
          <Text style={[styles.cellHeader, styles.thHpp]}>HPP Final</Text>
        </View>

        {products.map((product, index) => (
          <View key={product.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
            <Text style={[styles.cell, styles.tdNo]}>{index + 1}</Text>
            <Text style={[styles.cell, styles.tdNama]}>{product.name}</Text>
            <Text style={[styles.cell, styles.tdHarga]}>{formatRupiah(product.harga_pabrik)}</Text>
            <Text style={[styles.cell, styles.tdHpp]}>{formatRupiah(product.production_cost)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total produk</Text>
        <Text style={styles.summaryCount}>{products.length} produk</Text>
      </View>

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `ReKal · Daftar produk · Halaman ${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
)

export { ProductsPdfDocument }
