import { useState, useMemo } from 'react';
import { BarChart as BarChartIcon, Download, Calendar, Package, FileText } from 'lucide-react';
import { useSalesReport, useProducts, useProductReport } from '../hooks/useApi';
import { formatCurrency, formatDate } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

type Tab = 'DAILY_SALES' | 'MONTHLY_SALES' | 'STOCK_REPORT' | 'PRODUCT_SALES';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('DAILY_SALES');
  
  // Date range (defaults to this month)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0] as string;
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0] as string;
  });

  const isSalesTab = activeTab === 'DAILY_SALES' || activeTab === 'MONTHLY_SALES';

  const { data: salesData, isLoading: salesLoading } = useSalesReport({ 
    dateFrom: isSalesTab ? new Date(dateFrom).toISOString() : undefined, 
    dateTo: isSalesTab ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)).toISOString() : undefined 
  });
  const { data: stockData, isLoading: stockLoading } = useProducts({ page: 1 });
  const { data: productData, isLoading: productLoading } = useProductReport();

  // Process Daily Sales
  const dailySales = useMemo(() => {
    if (!salesData?.orders) return [];
    const map = new Map<string, { date: string, revenue: number, orders: number }>();
    salesData.orders.forEach(o => {
      const d = o.createdAt.split('T')[0] as string;
      if (!map.has(d)) map.set(d, { date: d, revenue: 0, orders: 0 });
      const entry = map.get(d)!;
      entry.revenue += parseFloat(o.grandTotal.toString());
      entry.orders += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date)); // Sort descending
  }, [salesData]);

  // Process Monthly Sales
  const monthlySales = useMemo(() => {
    if (!salesData?.orders) return [];
    const map = new Map<string, { month: string, revenue: number, orders: number }>();
    salesData.orders.forEach(o => {
      const d = o.createdAt.substring(0, 7); // YYYY-MM
      if (!map.has(d)) map.set(d, { month: d, revenue: 0, orders: 0 });
      const entry = map.get(d)!;
      entry.revenue += parseFloat(o.grandTotal.toString());
      entry.orders += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month)); // Sort descending
  }, [salesData]);

  // KPIs
  const totalRevenue = salesData?.orders.reduce((sum, o) => sum + parseFloat(o.grandTotal.toString()), 0) || 0;
  const totalTransactions = salesData?.orders.length || 0;

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 233); // brand color (sky-500)
    doc.text('Stationery OMS - Reports', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report Type: ${activeTab.replace('_', ' ')}`, 14, 30);
    if (isSalesTab) {
      doc.text(`Date Range: ${dateFrom} to ${dateTo}`, 14, 36);
    }
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);

    // Draw Line
    doc.setDrawColor(200);
    doc.line(14, 45, 196, 45);

    let startY = 55;

    if (activeTab === 'DAILY_SALES') {
      autoTable(doc, {
        startY,
        head: [['Date', 'Orders', 'Revenue (INR)']],
        body: dailySales.map(d => [d.date, d.orders.toString(), d.revenue.toFixed(2)]),
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] }
      });
    } else if (activeTab === 'MONTHLY_SALES') {
      autoTable(doc, {
        startY,
        head: [['Month', 'Orders', 'Revenue (INR)']],
        body: monthlySales.map(m => [m.month, m.orders.toString(), m.revenue.toFixed(2)]),
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] }
      });
    } else if (activeTab === 'STOCK_REPORT') {
      autoTable(doc, {
        startY,
        head: [['Product Name', 'SKU', 'Category', 'Stock Qty']],
        body: (stockData?.items || []).map(p => [p.name, p.sku, p.category.name, p.stockQuantity.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] }
      });
    } else if (activeTab === 'PRODUCT_SALES') {
      autoTable(doc, {
        startY,
        head: [['Product', 'SKU', 'Qty Sold', 'Revenue (INR)']],
        body: (productData || []).map(p => [p.productName, p.sku, p.totalQuantitySold.toString(), p.totalRevenue.toFixed(2)]),
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] }
      });
    }

    doc.save(`Stationery_Report_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded successfully');
  };

  const tabs = [
    { id: 'DAILY_SALES', label: 'Daily Sales', icon: Calendar },
    { id: 'MONTHLY_SALES', label: 'Monthly Sales', icon: Calendar },
    { id: 'PRODUCT_SALES', label: 'Product Sales', icon: FileText },
    { id: 'STOCK_REPORT', label: 'Stock Report', icon: Package },
  ] as const;

  const isLoading = salesLoading || stockLoading || productLoading;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChartIcon className="w-6 h-6 text-brand-600" /> Reports & Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Detailed business insights and data</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t.id ? 'bg-white text-brand-700 border border-b-0 border-gray-200 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {isSalesTab ? (
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input py-1.5 text-sm w-36" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input py-1.5 text-sm w-36" />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">{activeTab === 'STOCK_REPORT' ? 'Current real-time stock levels.' : 'Overall product sales data.'}</div>
        )}

        <button onClick={downloadPDF} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 border-transparent text-white">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {isSalesTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 border-l-4 border-l-brand-500 shadow-sm">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-brand-700">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="card p-5 border-l-4 border-l-gray-300 shadow-sm">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
          </div>
        </div>
      )}

      <div className="card flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="table-container flex-1">
            <table className="data-table">
              {activeTab === 'DAILY_SALES' && (
                <>
                  <thead><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {dailySales.map(d => (
                      <tr key={d.date}>
                        <td className="font-medium">{formatDate(new Date(d.date))}</td>
                        <td>{d.orders}</td>
                        <td className="font-semibold text-brand-700">{formatCurrency(d.revenue)}</td>
                      </tr>
                    ))}
                    {dailySales.length === 0 && <tr><td colSpan={3} className="text-center py-12 text-gray-500">No sales in this period</td></tr>}
                  </tbody>
                </>
              )}
              {activeTab === 'MONTHLY_SALES' && (
                <>
                  <thead><tr><th>Month</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {monthlySales.map(m => (
                      <tr key={m.month}>
                        <td className="font-medium">{m.month}</td>
                        <td>{m.orders}</td>
                        <td className="font-semibold text-brand-700">{formatCurrency(m.revenue)}</td>
                      </tr>
                    ))}
                    {monthlySales.length === 0 && <tr><td colSpan={3} className="text-center py-12 text-gray-500">No sales in this period</td></tr>}
                  </tbody>
                </>
              )}
              {activeTab === 'PRODUCT_SALES' && (
                <>
                  <thead><tr><th>Product Name</th><th>SKU</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {productData?.map(p => (
                      <tr key={p.productId}>
                        <td className="font-medium">{p.productName}</td>
                        <td className="text-gray-500">{p.sku}</td>
                        <td>{p.totalQuantitySold}</td>
                        <td className="font-semibold text-brand-700">{formatCurrency(p.totalRevenue)}</td>
                      </tr>
                    ))}
                    {!productData?.length && <tr><td colSpan={4} className="text-center py-12 text-gray-500">No product sales found</td></tr>}
                  </tbody>
                </>
              )}
              {activeTab === 'STOCK_REPORT' && (
                <>
                  <thead><tr><th>Product Name</th><th>Category</th><th>SKU</th><th>Stock Level</th></tr></thead>
                  <tbody>
                    {stockData?.items.map(p => (
                      <tr key={p.id}>
                        <td className="font-medium">{p.name}</td>
                        <td className="text-gray-500">{p.category.name}</td>
                        <td className="text-gray-500">{p.sku}</td>
                        <td>
                          <span className={`font-semibold ${p.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {p.stockQuantity} {p.unit}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!stockData?.items.length && <tr><td colSpan={4} className="text-center py-12 text-gray-500">No products found</td></tr>}
                  </tbody>
                </>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
