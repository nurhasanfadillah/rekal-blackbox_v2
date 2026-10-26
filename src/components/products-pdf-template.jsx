import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatRupiah } from '../utils/formatters'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    paddingBottom: 50,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 10,
    color: '#111111',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#666666',
  },
  table: {
    width: '100%',
  },
  // Header row
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginBottom: 1,
  },
  thNo: {
    width: '8%',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  thNama: {
    width: '40%',
    paddingVertical: 6,
    paddingHorizontal: 4,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  thHpp: {
    width: '20%',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'right',
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  thJual: {
    width: '20%',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'right',
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  thMargin: {
    width: '12%',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  // Data rows
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    borderBottomStyle: 'solid',
  },
  tdNo: {
    width: '8%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    color: '#555555',
    fontSize: 9,
  },
  tdNama: {
    width: '40%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontFamily: 'Helvetica',
    color: '#111111',
    fontSize: 9,
  },
  tdHpp: {
    width: '20%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'right',
    fontFamily: 'Helvetica',
    color: '#111111',
    fontSize: 9,
  },
  tdJual: {
    width: '20%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'right',
    fontFamily: 'Helvetica',
    color: '#111111',
    fontSize: 9,
  },
  tdMargin: {
    width: '12%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    color: '#333333',
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#999999',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    borderTopStyle: 'solid',
    marginTop: 2,
    paddingTop: 6,
  },
  totalLabel: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#333333',
    paddingHorizontal: 4,
  },
  totalCount: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#666666',
    paddingHorizontal: 4,
  },
})

const calcMargin = (hpp, jual) => {
  if (!hpp || !jual || hpp <= 0 || jual <= 0) return '–'
  return `${Math.round(((jual - hpp) / hpp) * 100)}%`
}

const ProductsPdfDocument = ({ products, exportDate }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ReKal — Daftar Produk HPP</Text>
        <Text style={styles.subtitle}>Diekspor pada: {exportDate}</Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.tableHeaderRow}>
          <Text style={styles.thNo}>No</Text>
          <Text style={styles.thNama}>Nama Produk</Text>
          <Text style={styles.thHpp}>HPP</Text>
          <Text style={styles.thJual}>Harga Jual</Text>
          <Text style={styles.thMargin}>Margin</Text>
        </View>

        {/* Data Rows */}
        {products.map((product, index) => (
          <View
            key={product.id}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={styles.tdNo}>{index + 1}</Text>
            <Text style={styles.tdNama}>{product.name}</Text>
            <Text style={styles.tdHpp}>{formatRupiah(product.production_cost)}</Text>
            <Text style={styles.tdJual}>{formatRupiah(product.estimated_selling_price)}</Text>
            <Text style={styles.tdMargin}>
              {calcMargin(product.production_cost, product.estimated_selling_price)}
            </Text>
          </View>
        ))}

        {/* Total row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total produk</Text>
          <Text style={styles.totalCount}>{products.length} produk</Text>
        </View>
      </View>

      {/* Footer - page number */}
      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
)

export { ProductsPdfDocument }
