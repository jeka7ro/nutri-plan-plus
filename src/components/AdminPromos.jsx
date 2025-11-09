import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Gift, Plus, Edit, Trash2, Copy, CheckCircle, TrendingUp, Users, Award
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminPromos() {
  const queryClient = useQueryClient();
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount_percent: 0,
    discount_amount: 0,
    max_uses: 100,
    expires_at: ''
  });

  // Fetch promo codes
  const { data: promosData } = useQuery({
    queryKey: ['adminPromos'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?type=promos', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      if (!response.ok) return { promos: [], stats: { total: 0, active: 0, used: 0 } };
      return response.json();
    },
  });

  const promos = promosData?.promos || [];
  const stats = promosData?.stats || { total: 0, active: 0, used: 0 };

  // Create promo mutation
  const createPromoMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/admin/users?type=promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create promo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPromos']);
      setShowAddPromo(false);
      setNewPromo({ code: '', discount_percent: 0, discount_amount: 0, max_uses: 100, expires_at: '' });
    }
  });

  // Update promo mutation
  const updatePromoMutation = useMutation({
    mutationFn: async ({ promoId, ...data }) => {
      const response = await fetch('/api/admin/users?type=promos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ promoId, ...data })
      });
      if (!response.ok) throw new Error('Failed to update promo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPromos']);
      setEditingPromo(null);
    }
  });

  // Delete promo mutation
  const deletePromoMutation = useMutation({
    mutationFn: async (promoId) => {
      const response = await fetch('/api/admin/users?type=promos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ promoId })
      });
      if (!response.ok) throw new Error('Failed to delete promo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPromos']);
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple notification (could be enhanced with a toast)
    alert(`Cod copiat: ${text}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-purple-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Coduri</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-3xl font-bold text-white">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-500/10 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Utilizări Totale</p>
                <p className="text-3xl font-bold text-white">{stats.used}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promos Table */}
      <Card className="ios-card border-none ios-shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">🎁 Coduri Promoționale</CardTitle>
            <Button 
              size="sm" 
              className="bg-purple-500 hover:bg-purple-600"
              onClick={() => setShowAddPromo(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Cod
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {promos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nu există coduri promoționale. Adaugă primul cod!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cod</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Utilizări</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiră</TableHead>
                  <TableHead>Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((promo) => {
                  const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
                  const isMaxedOut = promo.used_count >= promo.max_uses;
                  const isActive = !isExpired && !isMaxedOut && promo.is_active;
                  
                  return (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{promo.code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(promo.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.discount_percent > 0 && (
                          <Badge className="bg-orange-500 text-white">
                            {promo.discount_percent}%
                          </Badge>
                        )}
                        {promo.discount_amount > 0 && (
                          <Badge className="bg-emerald-500 text-white">
                            {promo.discount_amount} RON
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-white">{promo.used_count}</span>
                          <span className="text-gray-400">/ {promo.max_uses}</span>
                          <div className="w-20 bg-gray-700 rounded-full h-2 ml-2">
                            <div 
                              className="bg-cyan-500 h-2 rounded-full" 
                              style={{ width: `${(promo.used_count / promo.max_uses * 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            isActive 
                              ? 'bg-green-500 text-white' 
                              : isExpired 
                              ? 'bg-red-500 text-white'
                              : isMaxedOut
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-500 text-white'
                          }
                        >
                          {isActive ? 'Activ' : isExpired ? 'Expirat' : isMaxedOut ? 'Epuizat' : 'Inactiv'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-gray-400">
                          {promo.expires_at 
                            ? format(new Date(promo.expires_at), 'dd MMM yyyy')
                            : 'Niciodată'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingPromo(promo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Ștergi acest cod promoțional?')) {
                                deletePromoMutation.mutate(promo.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Promo Dialog */}
      <Dialog open={showAddPromo} onOpenChange={setShowAddPromo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>🎁 Adaugă Cod Promoțional</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cod *</Label>
              <Input
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2025"
                className="font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Procent (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newPromo.discount_percent}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_percent: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Discount Fix (RON)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newPromo.discount_amount}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_amount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Utilizări Maxime</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPromo.max_uses}
                  onChange={(e) => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) || 100 })}
                />
              </div>
              <div>
                <Label>Data Expirare</Label>
                <Input
                  type="date"
                  value={newPromo.expires_at}
                  onChange={(e) => setNewPromo({ ...newPromo, expires_at: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={() => createPromoMutation.mutate(newPromo)}
              disabled={!newPromo.code || createPromoMutation.isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {createPromoMutation.isLoading ? 'Se salvează...' : '✅ Creează Cod'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Dialog */}
      {editingPromo && (
        <Dialog open={!!editingPromo} onOpenChange={() => setEditingPromo(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>✏️ Editează Cod: {editingPromo.code}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={editingPromo.is_active ? 'active' : 'inactive'} 
                  onValueChange={(v) => {
                    updatePromoMutation.mutate({ 
                      promoId: editingPromo.id, 
                      is_active: v === 'active' 
                    });
                    setEditingPromo({ ...editingPromo, is_active: v === 'active' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activ</SelectItem>
                    <SelectItem value="inactive">Inactiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Utilizări Maxime</Label>
                  <Input
                    type="number"
                    value={editingPromo.max_uses}
                    onChange={(e) => {
                      const max_uses = parseInt(e.target.value) || 100;
                      updatePromoMutation.mutate({ promoId: editingPromo.id, max_uses });
                      setEditingPromo({ ...editingPromo, max_uses });
                    }}
                  />
                </div>
                <div>
                  <Label>Data Expirare</Label>
                  <Input
                    type="date"
                    value={editingPromo.expires_at ? format(new Date(editingPromo.expires_at), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const expires_at = e.target.value;
                      updatePromoMutation.mutate({ promoId: editingPromo.id, expires_at });
                      setEditingPromo({ ...editingPromo, expires_at });
                    }}
                  />
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-500" />
                  Statistici Utilizare
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Utilizări:</p>
                    <p className="font-bold text-white">{editingPromo.used_count} / {editingPromo.max_uses}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Creat la:</p>
                    <p className="font-bold text-white">
                      {format(new Date(editingPromo.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

