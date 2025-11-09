import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  TrendingUp, DollarSign, Calendar, Download, Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminSales() {
  const [period, setPeriod] = useState('30');

  // Fetch sales data
  const { data: salesData } = useQuery({
    queryKey: ['adminSales', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?type=sales&period=${period}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      if (!response.ok) return { stats: {}, dailyRevenue: [], transactions: [] };
      return response.json();
    },
  });

  const stats = salesData?.stats || { total_revenue: 0, total_transactions: 0, avg_transaction: 0 };
  const dailyRevenue = salesData?.dailyRevenue || [];
  const transactions = salesData?.transactions || [];

  // Export to Excel (simple CSV format for now)
  const exportToExcel = () => {
    const headers = ['ID', 'Utilizator', 'Email', 'Plan', 'Sumă (RON)', 'Data', 'Status'];
    const rows = transactions.map(t => [
      t.id,
      `${t.first_name} ${t.last_name}`,
      t.email,
      t.plan,
      t.amount,
      format(new Date(t.transaction_date), 'dd/MM/yyyy'),
      t.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">💰 Sales Dashboard</h2>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimele 7 zile</SelectItem>
              <SelectItem value="30">Ultimele 30 zile</SelectItem>
              <SelectItem value="90">Ultimele 90 zile</SelectItem>
              <SelectItem value="365">Ultimul an</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportToExcel}
            disabled={transactions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Venit Total</p>
                <p className="text-3xl font-bold text-white">{stats.total_revenue?.toFixed(0)} RON</p>
                <p className="text-xs text-emerald-500 mt-1">↑ Ultimele {period} zile</p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-500/10 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tranzacții</p>
                <p className="text-3xl font-bold text-white">{stats.total_transactions || 0}</p>
                <p className="text-xs text-cyan-500 mt-1">Total comenzi</p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Medie / Tranzacție</p>
                <p className="text-3xl font-bold text-white">{stats.avg_transaction?.toFixed(0)} RON</p>
                <p className="text-xs text-purple-500 mt-1">Valoare medie</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart - Daily Revenue */}
        <Card className="ios-card border-none ios-shadow-lg">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">📈 Venit Zilnic</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    tickFormatter={(date) => format(new Date(date), 'dd MMM')}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    tickFormatter={(value) => `${value} RON`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy')}
                    formatter={(value) => [`${value} RON`, 'Venit']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <p>Nu există date pentru această perioadă</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Transactions per Day */}
        <Card className="ios-card border-none ios-shadow-lg">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">📊 Tranzacții Zilnice</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    tickFormatter={(date) => format(new Date(date), 'dd MMM')}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy')}
                    formatter={(value) => [`${value}`, 'Tranzacții']}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#06b6d4"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <p>Nu există date pentru această perioadă</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="ios-card border-none ios-shadow-lg">
        <CardHeader>
          <CardTitle className="text-[rgb(var(--ios-text-primary))]">🧾 Istoric Tranzacții</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nu există tranzacții pentru această perioadă.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Utilizator</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Sumă</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <span className="text-xs text-gray-400">#{transaction.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white">
                            {transaction.first_name} {transaction.last_name}
                          </p>
                          <p className="text-xs text-gray-400">{transaction.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-500 text-white">
                          {transaction.plan === 'premium_monthly' ? 'Premium Lunar' : 'Premium Prima Lună'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-500">{transaction.amount} RON</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-300">
                          {format(new Date(transaction.transaction_date), 'dd MMM yyyy, HH:mm')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            transaction.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : transaction.status === 'pending'
                              ? 'bg-yellow-500 text-black'
                              : 'bg-red-500 text-white'
                          }
                        >
                          {transaction.status === 'completed' ? 'Finalizat' : 
                           transaction.status === 'pending' ? 'În așteptare' : 
                           'Eșuat'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

