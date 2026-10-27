import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatRupiah } from '../utils/formatters'

const styles = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', paddingTop: 30, paddingBottom: 48, paddingHorizontal: 38, fontSize: 9, color: '#20201E', fontFamily: 'Helvetica' },
  header: { marginBottom: 16, padding: 16, backgroundColor: '#20201E', borderLeftWidth: 5, borderLeftColor: '#C86B2A' },
  brand: { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 1.6, color: '#E28A4A', marginBottom: 8 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', marginBottom: 5 },
  subtitle: { fontSize: 8, color: '#D0CECA' },
  table: { width: '100%' },
  headerRow: { flexDirection: 'row', backgroundColor: '#20201E', borderBottomWidth: 2, borderBottomColor: '#C86B2A' },
  row: { flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: '#D9D7D2' },
  rowAlt: { flexDirection: 'row', backgroundColor: '#F3F2EF', borderBottomWidth: 0.6, borderBottomColor: '#D9D7D2' },
  cellHeader: { paddingVertical: 8, paddingHorizontal: 6, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  cell: { paddingVertical: 7, paddingHorizontal: 6, fontSize: 8, color: '#20201E' },
  number: { width: '7%', textAlign: 'center' },
  material: { width: '37%' },
  category: { width: '23%' },
  unit: { width: '13%' },
  price: { width: '20%', textAlign: 'right' },
  summary: { flexDirection: 'row', justifyContent: 'space-between', padding: 9, marginTop: 8, backgroundColor: '#20201E', borderLeftWidth: 4, borderLeftColor: '#C86B2A' },
  summaryLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#FFFFFF' },
  summaryCount: { fontSize: 9, color: '#D0CECA' },
  footer: { position: 'absolute', bottom: 20, left: 38, right: 38, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#B8B5AF', color: '#66635E', fontSize: 8, textAlign: 'right' },
})

const MaterialsPdfDocument = ({ materials, exportDate }) => (
  <Document title="Daftar Material ReKal" author="ReKal">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <Text style={styles.brand}>REKAL / KATALOG PRODUKSI</Text>
        <Text style={styles.title}>Daftar Material</Text>
        <Text style={styles.subtitle}>Diekspor pada {exportDate}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.cellHeader, styles.number]}>No</Text>
          <Text style={[styles.cellHeader, styles.material]}>Nama Material</Text>
          <Text style={[styles.cellHeader, styles.category]}>Kategori</Text>
          <Text style={[styles.cellHeader, styles.unit]}>Satuan</Text>
          <Text style={[styles.cellHeader, styles.price]}>Harga Standar</Text>
        </View>
        {materials.map((material, index) => (
          <View key={material.id} style={index % 2 ? styles.rowAlt : styles.row} wrap={false}>
            <Text style={[styles.cell, styles.number]}>{index + 1}</Text>
            <Text style={[styles.cell, styles.material]}>{material.name}</Text>
            <Text style={[styles.cell, styles.category]}>{material.categories?.name || '—'}</Text>
            <Text style={[styles.cell, styles.unit]}>{material.unit || '—'}</Text>
            <Text style={[styles.cell, styles.price]}>{formatRupiah(material.standard_price)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total material</Text>
        <Text style={styles.summaryCount}>{materials.length} material</Text>
      </View>

      <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
    </Page>
  </Document>
)

export { MaterialsPdfDocument }
