import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';

const mockData = [
  { name: 'Jan', sales: 4000, orders: 24 },
  { name: 'Feb', sales: 3000, orders: 18 },
  { name: 'Mar', sales: 5000, orders: 35 },
  { name: 'Apr', sales: 4500, orders: 28 },
  { name: 'May', sales: 6000, orders: 42 },
  { name: 'Jun', sales: 5500, orders: 38 },
];

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChartIcon className="w-6 h-6 text-brand-600" /> Reports & Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">View business performance and insights</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6 col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Overview (Last 6 Months)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="left" orientation="left" stroke="#14b8a6" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="Sales (INR)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="orders" name="Order Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
