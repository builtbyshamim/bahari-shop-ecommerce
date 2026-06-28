import * as XLSX from 'xlsx';
import moment from 'moment';

const currency = (n: number) => Number(n).toFixed(2);

function autoWidth(ws: XLSX.WorkSheet, data: any[][]) {
  const colWidths: number[] = [];
  data.forEach((row) => {
    row.forEach((cell, i) => {
      const len = String(cell ?? '').length;
      colWidths[i] = Math.min(50, Math.max(colWidths[i] ?? 8, len + 2));
    });
  });
  ws['!cols'] = colWidths.map((w) => ({ wch: w }));
}

function download(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

// ── Orders / Sales ────────────────────────────────────────────
export function exportOrdersExcel(data: any, dateLabel: string) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const sumRows = [
    ['Orders & Sales Report', '', dateLabel],
    [],
    ['Metric', 'Value'],
    ['Total Orders', data.summary.totalOrders],
    ['Total Revenue (৳)', currency(data.summary.totalRevenue)],
    ['Total Discount (৳)', currency(data.summary.totalDiscount)],
    ['Total Delivery (৳)', currency(data.summary.totalDelivery)],
    ['Avg Order Value (৳)', currency(data.summary.avgOrderValue)],
    ['Total Items', data.summary.totalItems],
    [],
    ['By Status', 'Count', 'Revenue (৳)'],
    ...(data.summary.byStatus || []).map((s: any) => [s.status, s.count, currency(s.revenue)]),
    [],
    ['By Payment Method', 'Count', 'Revenue (৳)'],
    ...(data.summary.byPaymentMethod || []).map((p: any) => [p.method, p.count, currency(p.revenue)]),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(sumRows);
  autoWidth(wsSummary, sumRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Orders sheet
  const headers = [
    'Order No', 'Customer', 'Phone', 'Email', 'Items',
    'Sub Total', 'Discount', 'Delivery', 'Total',
    'Payment Method', 'Payment Status', 'Status', 'Source', 'Created By', 'Date',
  ];
  const rows = (data.rows || []).map((r: any) => [
    r.orderNumber, r.customer, r.phone, r.email, r.items,
    currency(r.subTotal), currency(r.discount), currency(r.deliveryCharge), currency(r.totalPrice),
    r.paymentMethod, r.paymentStatus, r.status, r.source, r.createdBy,
    moment(r.date).format('DD/MM/YYYY HH:mm'),
  ]);
  const wsOrders = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  autoWidth(wsOrders, [headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders');

  download(wb, `Orders_Report_${dateLabel.replace(/\s/g, '_')}.xlsx`);
}

// ── Transactions (Income / Expense) ──────────────────────────
export function exportTransactionsExcel(data: any, dateLabel: string, type?: string) {
  const wb = XLSX.utils.book_new();
  const title = type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Report` : 'Income & Expense Report';

  const sumRows = [
    [title, '', dateLabel],
    [],
    ['Metric', 'Value'],
    ['Total Income (৳)', currency(data.summary.totalIncome)],
    ['Total Expense (৳)', currency(data.summary.totalExpense)],
    ['Net Profit/Loss (৳)', currency(data.summary.netProfit)],
    ['Total Transactions', data.summary.count],
    [],
    ['Income by Category', 'Total (৳)'],
    ...(data.summary.byCategoryIncome || []).map((c: any) => [c.category, currency(c.total)]),
    [],
    ['Expense by Category', 'Total (৳)'],
    ...(data.summary.byCategoryExpense || []).map((c: any) => [c.category, currency(c.total)]),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(sumRows);
  autoWidth(wsSummary, sumRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const headers = ['Date', 'Type', 'Category', 'Account', 'Amount (৳)', 'Note', 'Recorded By'];
  const rows = (data.rows || []).map((r: any) => [
    moment(r.date).format('DD/MM/YYYY'), r.type, r.category, r.account,
    currency(r.amount), r.note, r.recordedBy,
  ]);
  const wsData = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  autoWidth(wsData, [headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, wsData, 'Transactions');

  download(wb, `${title.replace(/\s/g, '_')}_${dateLabel.replace(/\s/g, '_')}.xlsx`);
}

// ── Inventory ─────────────────────────────────────────────────
export function exportInventoryExcel(data: any) {
  const wb = XLSX.utils.book_new();
  const today = moment().format('DD-MM-YYYY');

  const sumRows = [
    ['Inventory Report', '', today],
    [],
    ['Metric', 'Value'],
    ['Total Products', data.summary.totalProducts],
    ['Total Stock Value (৳)', currency(data.summary.totalStockValue)],
    ['Low Stock Items', data.summary.lowStockItems],
    ['Out of Stock', data.summary.outOfStockItems],
    ['Tracked Items', data.summary.trackedItems],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(sumRows);
  autoWidth(wsSummary, sumRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const headers = [
    'Product', 'SKU', 'On Hand', 'Reserved', 'Available',
    'Low Stock Threshold', 'Avg Cost (৳)', 'Total Value (৳)',
    'Tracked', 'Allow Backorder', 'Status',
  ];
  const rows = (data.rows || []).map((r: any) => [
    r.product, r.sku, r.qtyOnHand, r.qtyReserved, r.qtyAvailable,
    r.lowStockThreshold, currency(r.avgCostPrice), currency(r.totalValue),
    r.isTracked ? 'Yes' : 'No', r.allowBackorder ? 'Yes' : 'No', r.status,
  ]);
  const wsInv = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  autoWidth(wsInv, [headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Inventory');

  download(wb, `Inventory_Report_${today}.xlsx`);
}

// ── Campaign Attribution ──────────────────────────────────────
export function exportCampaignExcel(data: any, dateLabel: string) {
  const wb = XLSX.utils.book_new();

  const sumRows = [
    ['Campaign Attribution Report', '', dateLabel],
    [],
    ['Metric', 'Value'],
    ['Total Revenue (৳)', currency(data.summary.totalRevenue)],
    ['Total Orders', data.summary.totalOrders],
    ['Unique Sources', data.summary.uniqueSources],
    ['Tracked Campaigns', data.summary.uniqueCampaigns],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(sumRows);
  autoWidth(wsSummary, sumRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const headers = ['Source', 'Medium', 'Campaign', 'Orders', 'Revenue (৳)', 'Avg Order (৳)', 'Paid Orders', 'Revenue Share %'];
  const rows = (data.rows || []).map((r: any) => [
    r.utmSource, r.utmMedium, r.utmCampaign,
    r.orders, currency(r.revenue), currency(r.avgOrderValue),
    r.paidOrders, `${r.revenueShare}%`,
  ]);
  const wsData = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  autoWidth(wsData, [headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, wsData, 'Campaigns');

  download(wb, `Campaign_Report_${dateLabel.replace(/\s/g, '_')}.xlsx`);
}

// ── Stock Movements ───────────────────────────────────────────
export function exportStockMovementsExcel(data: any, dateLabel: string) {
  const wb = XLSX.utils.book_new();

  const sumRows = [
    ['Stock Movements Report', '', dateLabel],
    [],
    ['Metric', 'Value'],
    ['Total Movements', data.summary.total],
    ['Total Stock In', data.summary.totalIn],
    ['Total Stock Out', data.summary.totalOut],
    ['Purchase Value (৳)', currency(data.summary.purchaseValue)],
    ['Sales Value (৳)', currency(data.summary.salesValue)],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(sumRows);
  autoWidth(wsSummary, sumRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const headers = [
    'Date', 'Product', 'SKU', 'Movement Type', 'Quantity',
    'Qty Before', 'Qty After', 'Unit Cost (৳)', 'Unit Sale (৳)',
    'Total Value (৳)', 'Reference', 'Note',
  ];
  const rows = (data.rows || []).map((r: any) => [
    moment(r.date).format('DD/MM/YYYY HH:mm'),
    r.product, r.sku, r.movementType, r.quantity,
    r.qtyBefore, r.qtyAfter, currency(r.unitCostPrice), currency(r.unitSalePrice),
    currency(r.totalValue), r.referenceType, r.note,
  ]);
  const wsMovements = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  autoWidth(wsMovements, [headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, wsMovements, 'Movements');

  download(wb, `Stock_Movements_${dateLabel.replace(/\s/g, '_')}.xlsx`);
}
