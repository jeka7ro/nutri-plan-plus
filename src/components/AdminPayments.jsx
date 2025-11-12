import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import localApi from '@/api/localClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Switch component inline since it might not exist
const Switch = ({ id, checked, onCheckedChange, ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
      checked ? 'bg-emerald-600' : 'bg-gray-200'
    }`}
    {...props}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard, Settings, Activity, TrendingUp, AlertCircle, CheckCircle,
  Eye, Edit, Trash2, Plus, RefreshCw, DollarSign, Euro, Banknote,
  Globe, Shield, Zap, Clock, BarChart3
} from "lucide-react";

const AdminPayments = () => {
  const [activeProcessor, setActiveProcessor] = useState(null);
  const [showAddProcessor, setShowAddProcessor] = useState(false);
  const [newProcessorData, setNewProcessorData] = useState({
    name: '',
    processor_type: '',
    region: '',
    api_key: '',
    secret_key: '',
    webhook_url: '',
    commission_rate: 0,
    currency: 'RON',
    supported_methods: [],
    test_mode: true
  });
  
  const queryClient = useQueryClient();

  // Fetch payment processors from API
  const { data: paymentProcessors = [], isLoading: processorsLoading } = useQuery({
    queryKey: ['paymentProcessors'],
    queryFn: () => localApi.admin.paymentProcessors.list(),
    retry: false,
  });

  // Fetch transactions from API
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['paymentTransactions'],
    queryFn: () => localApi.admin.paymentTransactions.list({ limit: 50 }),
    retry: false,
  });

  // Create processor mutation
  const createProcessorMutation = useMutation({
    mutationFn: (processorData) => localApi.admin.paymentProcessors.create(processorData),
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentProcessors']);
      setShowAddProcessor(false);
      setNewProcessorData({
        name: '',
        processor_type: '',
        region: '',
        api_key: '',
        secret_key: '',
        webhook_url: '',
        commission_rate: 0,
        currency: 'RON',
        supported_methods: [],
        test_mode: true
      });
    },
  });

  // Mock data pentru procesatori de plăți (fallback)
  const mockProcessors = [
    {
      id: 'viva_ro',
      name: 'VIVA Wallet',
      region: 'România',
      status: 'active',
      apiKey: 'viva_****_****',
      secretKey: '****',
      webhookUrl: 'https://eatnfit.app/webhooks/viva',
      commission: 1.9,
      currency: 'RON',
      methods: ['card', 'transfer', 'wallet'],
      monthlyVolume: 15420.50,
      monthlyTransactions: 89,
      lastTransaction: '2024-11-12T14:30:00Z',
      testMode: false,
      logo: '🇷🇴'
    },
    {
      id: 'revolut_eu',
      name: 'Revolut Business',
      region: 'Europa',
      status: 'active',
      apiKey: 'rev_****_****',
      secretKey: '****',
      webhookUrl: 'https://eatnfit.app/webhooks/revolut',
      commission: 1.2,
      currency: 'EUR',
      methods: ['card', 'transfer', 'revolut_pay'],
      monthlyVolume: 8750.00,
      monthlyTransactions: 45,
      lastTransaction: '2024-11-12T12:15:00Z',
      testMode: false,
      logo: '💳'
    },
    {
      id: 'stripe_global',
      name: 'Stripe',
      region: 'Global',
      status: 'active',
      apiKey: 'sk_live_****',
      secretKey: '****',
      webhookUrl: 'https://eatnfit.app/webhooks/stripe',
      commission: 2.9,
      currency: 'USD',
      methods: ['card', 'apple_pay', 'google_pay', 'sepa'],
      monthlyVolume: 12300.00,
      monthlyTransactions: 67,
      lastTransaction: '2024-11-12T13:45:00Z',
      testMode: false,
      logo: '🌍'
    },
    {
      id: 'paypal_global',
      name: 'PayPal',
      region: 'Global',
      status: 'inactive',
      apiKey: 'paypal_****',
      secretKey: '****',
      webhookUrl: 'https://eatnfit.app/webhooks/paypal',
      commission: 3.4,
      currency: 'USD',
      methods: ['paypal', 'card'],
      monthlyVolume: 0,
      monthlyTransactions: 0,
      lastTransaction: null,
      testMode: true,
      logo: '💙'
    }
  ]);

  // Mock transactions data
  const mockTransactions = [
    {
      id: 'tx_001',
      processor: 'viva_ro',
      amount: 29.99,
      currency: 'RON',
      status: 'completed',
      customer: 'maria.popescu@email.com',
      date: '2024-11-12T14:30:00Z',
      method: 'card',
      fee: 0.57
    },
    {
      id: 'tx_002',
      processor: 'revolut_eu',
      amount: 19.99,
      currency: 'EUR',
      status: 'completed',
      customer: 'john.doe@email.com',
      date: '2024-11-12T12:15:00Z',
      method: 'revolut_pay',
      fee: 0.24
    },
    {
      id: 'tx_003',
      processor: 'stripe_global',
      amount: 39.99,
      currency: 'USD',
      status: 'pending',
      customer: 'sarah.wilson@email.com',
      date: '2024-11-12T13:45:00Z',
      method: 'apple_pay',
      fee: 1.16
    }
  ];

  useEffect(() => {
    setTransactions(mockTransactions);
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      error: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    
    const variant = variants[status] || variants.inactive;
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'active' ? 'Activ' : status === 'inactive' ? 'Inactiv' : 'Eroare'}
      </Badge>
    );
  };

  const getRegionFlag = (region) => {
    const flags = {
      'România': '🇷🇴',
      'Europa': '🇪🇺',
      'Global': '🌍',
      'SUA': '🇺🇸'
    };
    return flags[region] || '🌍';
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency || 'RON'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ro-RO');
  };

  const totalStats = {
    totalVolume: paymentProcessors.reduce((sum, p) => sum + p.monthlyVolume, 0),
    totalTransactions: paymentProcessors.reduce((sum, p) => sum + p.monthlyTransactions, 0),
    activeProcessors: paymentProcessors.filter(p => p.status === 'active').length,
    avgCommission: paymentProcessors.reduce((sum, p) => sum + p.commission, 0) / paymentProcessors.length
  };

  return (
    <div className="space-y-6">
      {/* Header cu statistici generale */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="ios-card border-none ios-shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Volum Total Luna</p>
                <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">
                  {formatCurrency(totalStats.totalVolume, 'RON')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="ios-card border-none ios-shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Tranzacții Luna</p>
                <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">
                  {totalStats.totalTransactions}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="ios-card border-none ios-shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Procesatori Activi</p>
                <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">
                  {totalStats.activeProcessors}/{paymentProcessors.length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="ios-card border-none ios-shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Comision Mediu</p>
                <p className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">
                  {totalStats.avgCommission.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab-uri principale */}
      <Tabs defaultValue="processors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="processors">
            <CreditCard className="w-4 h-4 mr-2" />
            Procesatori
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Activity className="w-4 h-4 mr-2" />
            Tranzacții
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analiză
          </TabsTrigger>
        </TabsList>

        {/* Tab Procesatori */}
        <TabsContent value="processors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Procesatori de Plăți</h3>
            <Dialog open={showAddProcessor} onOpenChange={setShowAddProcessor}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Procesator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adaugă Procesator de Plăți</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Nume Procesator</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează procesator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viva">VIVA Wallet</SelectItem>
                        <SelectItem value="revolut">Revolut Business</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="euplatesc">EuPlătesc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Regiune</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează regiunea" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="romania">🇷🇴 România</SelectItem>
                        <SelectItem value="europa">🇪🇺 Europa</SelectItem>
                        <SelectItem value="sua">🇺🇸 SUA</SelectItem>
                        <SelectItem value="global">🌍 Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input placeholder="Introdu API Key" />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input type="password" placeholder="Introdu Secret Key" />
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://eatnfit.app/webhooks/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Comision (%)</Label>
                    <Input type="number" step="0.1" placeholder="2.9" />
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <Switch id="test-mode" />
                    <Label htmlFor="test-mode">Mod Test (Sandbox)</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddProcessor(false)}>
                    Anulează
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Salvează Procesator
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {paymentProcessors.map((processor) => (
              <Card key={processor.id} className="ios-card border-none ios-shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{processor.logo}</div>
                      <div>
                        <h4 className="font-semibold text-lg">{processor.name}</h4>
                        <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          {getRegionFlag(processor.region)} {processor.region}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(processor.status)}
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Volum Luna</p>
                      <p className="font-semibold">{formatCurrency(processor.monthlyVolume, processor.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Tranzacții</p>
                      <p className="font-semibold">{processor.monthlyTransactions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Comision</p>
                      <p className="font-semibold">{processor.commission}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-[rgb(var(--ios-text-secondary))]">Ultima Tranzacție</p>
                      <p className="font-semibold text-xs">
                        {processor.lastTransaction ? formatDate(processor.lastTransaction) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {processor.methods.map((method) => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-[rgb(var(--ios-text-secondary))]">
                        API: {processor.apiKey}
                      </span>
                      {processor.testMode && (
                        <Badge variant="outline" className="text-orange-600">
                          <Zap className="w-3 h-3 mr-1" />
                          Test Mode
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Detalii
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Tranzacții */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="ios-card border-none ios-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tranzacții Recente</span>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizează
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Tranzacție</TableHead>
                    <TableHead>Procesator</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Sumă</TableHead>
                    <TableHead>Metodă</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                      <TableCell>
                        {paymentProcessors.find(p => p.id === tx.processor)?.name}
                      </TableCell>
                      <TableCell>{tx.customer}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(tx.amount, tx.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tx.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {tx.status === 'completed' ? 'Completată' :
                           tx.status === 'pending' ? 'În așteptare' : 'Eșuată'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Analiză */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <CardTitle>Performanță pe Procesatori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentProcessors.map((processor) => (
                    <div key={processor.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{processor.logo}</span>
                        <span className="font-medium">{processor.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(processor.monthlyVolume, processor.currency)}</p>
                        <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          {processor.monthlyTransactions} tranzacții
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <CardTitle>Comparație Comisioane</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentProcessors
                    .sort((a, b) => a.commission - b.commission)
                    .map((processor) => (
                    <div key={processor.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{processor.logo}</span>
                        <span className="font-medium">{processor.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{processor.commission}%</p>
                        <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          ~{formatCurrency(processor.monthlyVolume * processor.commission / 100, processor.currency)} taxe
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
