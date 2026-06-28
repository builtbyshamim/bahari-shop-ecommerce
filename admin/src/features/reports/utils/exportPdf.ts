import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

const BRAND = '#ff6d29';
const currency = (n: number) => `${Number(n).toFixed(2)}`;

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(BRAND);
  doc.rect(0, 0, 297, 18, 'F');
  doc.setTextColor('#ffffff');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 297 - 14, 12, { align: 'right' });
  doc.setTextColor('#000000');
}

function addSummaryBox(doc: jsPDF, items: { label: string; value: string }[], startY = 24) {
  const colW = (297 - 28) / Math.min(items.length, 4);
  items.slice(0, 4).forEach((item, i) => {
    const x = 14 + i * colW;
    doc.setFillColor('#fff7f2');
    doc.roundedRect(x, startY, colW - 4, 18, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor('#888888');
    doc.text(item.label, x + 4, startY + 6);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#1a1a1a');
    doc.text(item.value, x + 4, startY + 14);
    doc.setFont('helvetica', 'normal');
  });
  // second row if >4 items
  if (items.length > 4) {
    items.slice(4, 8).forEach((item, i) => {
      const x = 14 + i * colW;
      const y = startY + 22;
      doc.setFillColor('#fff7f2');
      doc.roundedRect(x, y, colW - 4, 18, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor('#888888');
      doc.text(item.label, x + 4, y + 6);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#1a1a1a');
      doc.text(item.value, x + 4, y + 14);
      doc.setFont('helvetica', 'normal');
    });
  }
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor('#aaaaaa');
    doc.text(
      `Generated on ${moment().format('DD MMM YYYY HH:mm')} | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 6,
    );
  }
}

// ── Orders / Sales PDF ────────────────────────────────────────
export function exportOrdersPdf(data: any, dateLabel: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  addHeader(doc, 'Orders & Sales Report', dateLabel);

  const tableStart = data.summary ? 50 : 28;

  addSummaryBox(doc, [
    { label: 'Total Orders', value: String(data.summary.totalOrders) },
    { label: 'Total Revenue', value: `৳${currency(data.summary.totalRevenue)}` },
    { label: 'Total Discount', value: `৳${currency(data.summary.totalDiscount)}` },
    { label: 'Avg Order Value', value: `৳${currency(data.summary.avgOrderValue)}` },
  ]);

  autoTable(doc, {
    startY: tableStart,
    head: [['Order No', 'Customer', 'Phone', 'Items', 'Sub Total', 'Discount', 'Delivery', 'Total', 'Payment', 'Status', 'Date']],
    body: (data.rows || []).map((r: any) => [
      r.orderNumber,
      r.customer,
      r.phone,
      r.items,
      `৳${currency(r.subTotal)}`,
      `৳${currency(r.discount)}`,
      `৳${currency(r.deliveryCharge)}`,
      `৳${currency(r.totalPrice)}`,
      r.paymentStatus,
      r.status,
      moment(r.date).format('DD/MM/YY'),
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND, textColor: '#ffffff', fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: '#fafafa' },
    columnStyles: { 0: { cellWidth: 28 }, 7: { fontStyle: 'bold' } },
  });

  addFooter(doc);
  doc.save(`Orders_Report_${dateLabel.replace(/\s/g, '_')}.pdf`);
}

// ── Transactions PDF ──────────────────────────────────────────
export function exportTransactionsPdf(data: any, dateLabel: string, type?: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const title = type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Report` : 'Income & Expense Report';
  addHeader(doc, title, dateLabel);

  addSummaryBox(doc, [
    { label: 'Total Income', value: `৳${currency(data.summary.totalIncome)}` },
    { label: 'Total Expense', value: `৳${currency(data.summary.totalExpense)}` },
    { label: 'Net Profit/Loss', value: `৳${currency(data.summary.netProfit)}` },
    { label: 'Transactions', value: String(data.summary.count) },
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Type', 'Category', 'Account', 'Amount (৳)', 'Note', 'Recorded By']],
    body: (data.rows || []).map((r: any) => [
      moment(r.date).format('DD/MM/YYYY'),
      r.type.toUpperCase(),
      r.category,
      r.account,
      currency(r.amount),
      r.note || '—',
      r.recordedBy || '—',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND, textColor: '#ffffff', fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: '#fafafa' },
    bodyStyles: {
      didParseCell: (cellData: any) => {
        if (cellData.column.index === 1) {
          cellData.cell.styles.textColor =
            cellData.cell.raw === 'INCOME' ? '#16a34a' : '#dc2626';
          cellData.cell.styles.fontStyle = 'bold';
        }
      },
    } as any,
  });

  addFooter(doc);
  doc.save(`${title.replace(/\s/g, '_')}_${dateLabel.replace(/\s/g, '_')}.pdf`);
}

// ── Inventory PDF ─────────────────────────────────────────────
export function exportInventoryPdf(data: any) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const today = moment().format('DD MMM YYYY');
  addHeader(doc, 'Inventory Report', today);

  addSummaryBox(doc, [
    { label: 'Total Products', value: String(data.summary.totalProducts) },
    { label: 'Stock Value', value: `৳${currency(data.summary.totalStockValue)}` },
    { label: 'Low Stock', value: String(data.summary.lowStockItems) },
    { label: 'Out of Stock', value: String(data.summary.outOfStockItems) },
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Product', 'SKU', 'On Hand', 'Reserved', 'Available', 'Threshold', 'Avg Cost (৳)', 'Total Value (৳)', 'Status']],
    body: (data.rows || []).map((r: any) => [
      r.product, r.sku, r.qtyOnHand, r.qtyReserved, r.qtyAvailable,
      r.lowStockThreshold, currency(r.avgCostPrice), currency(r.totalValue), r.status,
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND, textColor: '#ffffff', fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: '#fafafa' },
  });

  addFooter(doc);
  doc.save(`Inventory_Report_${moment().format('DD-MM-YYYY')}.pdf`);
}

// ── Stock Movements PDF ───────────────────────────────────────
export function exportStockMovementsPdf(data: any, dateLabel: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  addHeader(doc, 'Stock Movements Report', dateLabel);

  addSummaryBox(doc, [
    { label: 'Total Movements', value: String(data.summary.total) },
    { label: 'Total Stock In', value: String(data.summary.totalIn) },
    { label: 'Total Stock Out', value: String(data.summary.totalOut) },
    { label: 'Purchase Value', value: `৳${currency(data.summary.purchaseValue)}` },
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Product', 'SKU', 'Type', 'Qty', 'Before', 'After', 'Unit Cost', 'Unit Sale', 'Total Value', 'Note']],
    body: (data.rows || []).map((r: any) => [
      moment(r.date).format('DD/MM/YY HH:mm'),
      r.product, r.sku, r.movementType, r.quantity,
      r.qtyBefore, r.qtyAfter, currency(r.unitCostPrice), currency(r.unitSalePrice),
      currency(r.totalValue), r.note || '—',
    ]),
    styles: { fontSize: 6.5, cellPadding: 1.5 },
    headStyles: { fillColor: BRAND, textColor: '#ffffff', fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: '#fafafa' },
  });

  addFooter(doc);
  doc.save(`Stock_Movements_${dateLabel.replace(/\s/g, '_')}.pdf`);
}
