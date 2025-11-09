import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, TrendingUp, CheckCircle, Activity, Plus, Search, Filter, X, Edit, Trash2,
  Mail, Phone, Calendar, MessageSquare, Award
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminCRM() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [filters, setFilters] = useState({ stage: '', source: '', search: '' });
  const [newLead, setNewLead] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    source: 'manual',
    notes: ''
  });

  // Fetch leads
  const { data: crmData } = useQuery({
    queryKey: ['crmLeads', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.source) params.append('source', filters.source);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/admin/users?type=crm&${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      if (!response.ok) return { leads: [], stats: [] };
      return response.json();
    },
  });

  const leads = crmData?.leads || [];
  const stats = crmData?.stats || [];

  // Pipeline stats
  const pipelineStats = {
    total: leads.length,
    qualified: stats.find(s => s.stage === 'qualified')?.count || 0,
    converted: stats.find(s => s.stage === 'converted')?.count || 0,
    conversionRate: leads.length > 0 ? ((stats.find(s => s.stage === 'converted')?.count || 0) / leads.length * 100).toFixed(1) : 0
  };

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/admin/users?type=crm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create lead');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['crmLeads']);
      setShowAddLead(false);
      setNewLead({ email: '', first_name: '', last_name: '', phone: '', source: 'manual', notes: '' });
    }
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, ...data }) => {
      const response = await fetch('/api/admin/users?type=crm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ leadId, ...data })
      });
      if (!response.ok) throw new Error('Failed to update lead');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['crmLeads']);
    }
  });

  const stageColors = {
    new: 'bg-blue-500',
    contacted: 'bg-cyan-500',
    qualified: 'bg-purple-500',
    converted: 'bg-green-500',
    lost: 'bg-gray-500'
  };

  const stageLabels = {
    new: 'Nou',
    contacted: 'Contactat',
    qualified: 'Calificat',
    converted: 'Convertit',
    lost: 'Pierdut'
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Leads</p>
                <p className="text-3xl font-bold text-white">{pipelineStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Calificați</p>
                <p className="text-3xl font-bold text-white">{pipelineStats.qualified}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Convertiți</p>
                <p className="text-3xl font-bold text-white">{pipelineStats.converted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-500/10 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="text-3xl font-bold text-white">{pipelineStats.conversionRate}%</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="ios-card border-none ios-shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">🎯 CRM Leads</CardTitle>
            <Button 
              size="sm" 
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setShowAddLead(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Caută email, nume..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.stage} onValueChange={(v) => setFilters({ ...filters, stage: v })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Toate stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toate</SelectItem>
                <SelectItem value="new">Nou</SelectItem>
                <SelectItem value="contacted">Contactat</SelectItem>
                <SelectItem value="qualified">Calificat</SelectItem>
                <SelectItem value="converted">Convertit</SelectItem>
                <SelectItem value="lost">Pierdut</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.source} onValueChange={(v) => setFilters({ ...filters, source: v })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Toate surse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toate</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nu există leads încă. Adaugă primul lead!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-[rgb(var(--ios-bg-tertiary))]">
                    <TableCell onClick={() => setSelectedLead(lead)}>
                      <div>
                        <p className="font-semibold text-white">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-300">{lead.phone || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${stageColors[lead.stage]} text-white`}>
                        {stageLabels[lead.stage]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{lead.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-gray-400">
                        {format(new Date(lead.created_at), 'dd MMM yyyy')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>➕ Adaugă Lead Nou</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prenume</Label>
                <Input
                  value={newLead.first_name}
                  onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                  placeholder="Ion"
                />
              </div>
              <div>
                <Label>Nume</Label>
                <Input
                  value={newLead.last_name}
                  onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                  placeholder="Popescu"
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                placeholder="email@exemplu.ro"
                required
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                placeholder="+40 712 345 678"
              />
            </div>
            <div>
              <Label>Sursă</Label>
              <Select value={newLead.source} onValueChange={(v) => setNewLead({ ...newLead, source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                placeholder="Note despre lead..."
                rows={3}
              />
            </div>
            <Button
              onClick={() => createLeadMutation.mutate(newLead)}
              disabled={!newLead.email || createLeadMutation.isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {createLeadMutation.isLoading ? 'Se salvează...' : '✅ Adaugă Lead'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Details Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                👤 {selectedLead.first_name} {selectedLead.last_name}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalii</TabsTrigger>
                <TabsTrigger value="activities">Activități</TabsTrigger>
                <TabsTrigger value="conversion">Conversie</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Stage</Label>
                    <Select 
                      value={selectedLead.stage} 
                      onValueChange={(v) => {
                        updateLeadMutation.mutate({ leadId: selectedLead.id, stage: v });
                        setSelectedLead({ ...selectedLead, stage: v });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nou</SelectItem>
                        <SelectItem value="contacted">Contactat</SelectItem>
                        <SelectItem value="qualified">Calificat</SelectItem>
                        <SelectItem value="converted">Convertit</SelectItem>
                        <SelectItem value="lost">Pierdut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lead Score (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedLead.score}
                      onChange={(e) => {
                        const score = parseInt(e.target.value) || 0;
                        updateLeadMutation.mutate({ leadId: selectedLead.id, score });
                        setSelectedLead({ ...selectedLead, score });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    {selectedLead.email}
                  </div>
                </div>

                <div>
                  <Label>Telefon</Label>
                  <div className="flex items-center gap-2 text-white">
                    <Phone className="w-4 h-4 text-cyan-500" />
                    {selectedLead.phone || '-'}
                  </div>
                </div>

                <div>
                  <Label>Sursă</Label>
                  <Badge variant="outline">{selectedLead.source}</Badge>
                </div>

                <div>
                  <Label>Note</Label>
                  <Textarea
                    value={selectedLead.notes || ''}
                    onChange={(e) => {
                      updateLeadMutation.mutate({ leadId: selectedLead.id, notes: e.target.value });
                      setSelectedLead({ ...selectedLead, notes: e.target.value });
                    }}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="activities">
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Activități CRM - În dezvoltare...</p>
                  <p className="text-sm mt-2">Email-uri trimise, apeluri, note, etc.</p>
                </div>
              </TabsContent>

              <TabsContent value="conversion">
                <div className="space-y-4">
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-white mb-2">Conversie în Utilizator</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Transformă acest lead într-un utilizator activ al platformei
                      </p>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600">
                        <Award className="w-4 h-4 mr-2" />
                        Convertește în User
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

