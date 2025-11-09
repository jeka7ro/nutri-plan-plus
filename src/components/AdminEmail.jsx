import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Mail, Plus, Send, Eye, TrendingUp, Users, Calendar, Edit, Trash2, Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminEmail() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState('templates');
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body_html: '',
    category: 'marketing'
  });

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template_id: null,
    target_audience: 'all',
    scheduled_at: ''
  });

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?type=email&action=templates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!response.ok) return { templates: [] };
      return response.json();
    },
  });

  // Fetch campaigns
  const { data: campaignsData } = useQuery({
    queryKey: ['emailCampaigns'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?type=email&action=campaigns', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!response.ok) return { campaigns: [] };
      return response.json();
    },
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['emailAnalytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?type=email&action=analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!response.ok) return { stats: { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 }, history: [] };
      return response.json();
    },
  });

  const templates = templatesData?.templates || [];
  const campaigns = campaignsData?.campaigns || [];
  const analytics = analyticsData?.stats || { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 };
  const history = analyticsData?.history || [];

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/admin/users?type=email&action=templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['emailTemplates']);
      setShowNewTemplate(false);
      setNewTemplate({ name: '', subject: '', body_html: '', category: 'marketing' });
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/admin/users?type=email&action=campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['emailCampaigns']);
      setShowNewCampaign(false);
      setNewCampaign({ name: '', template_id: null, target_audience: 'all', scheduled_at: '' });
    }
  });

  // Simple HTML Editor Toolbar
  const insertTag = (tag) => {
    const textarea = document.getElementById('template-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    let newText = '';
    if (tag === 'bold') newText = `${before}<strong>${selected}</strong>${after}`;
    else if (tag === 'link') newText = `${before}<a href="URL">${selected}</a>${after}`;
    else if (tag === 'button') newText = `${before}<a href="URL" style="background:#10b981;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">${selected || 'Click Here'}</a>${after}`;
    
    setNewTemplate({ ...newTemplate, body_html: newText });
  };

  return (
    <div className="space-y-6">
      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-cyan-500/10 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Trimise</p>
                <p className="text-3xl font-bold text-white">{analytics.sent}</p>
              </div>
              <Send className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Deschise</p>
                <p className="text-3xl font-bold text-white">{analytics.opened}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Clicks</p>
                <p className="text-3xl font-bold text-white">{analytics.clicked}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Open Rate</p>
                <p className="text-3xl font-bold text-white">{analytics.openRate}%</p>
              </div>
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pink-500/10 border-pink-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Click Rate</p>
                <p className="text-3xl font-bold text-white">{analytics.clickRate}%</p>
              </div>
              <Users className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs: Templates, Campaigns, Analytics */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">📧 Templates</TabsTrigger>
          <TabsTrigger value="campaigns">📬 Campanii</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="mt-6">
          <Card className="ios-card border-none ios-shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[rgb(var(--ios-text-primary))]">📧 Email Templates</CardTitle>
                <Button 
                  size="sm" 
                  className="bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => setShowNewTemplate(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nou Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nu există template-uri. Creează primul template!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="bg-[rgb(var(--ios-bg-tertiary))] border-[rgb(var(--ios-border))]">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-white">{template.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{template.subject}</p>
                          </div>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns" className="mt-6">
          <Card className="ios-card border-none ios-shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[rgb(var(--ios-text-primary))]">📬 Email Campanii</CardTitle>
                <Button 
                  size="sm" 
                  className="bg-purple-500 hover:bg-purple-600"
                  onClick={() => setShowNewCampaign(true)}
                  disabled={templates.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Campanie Nouă
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nu există campanii. Creează prima campanie!</p>
                  {templates.length === 0 && (
                    <p className="text-sm text-orange-500 mt-2">⚠️ Creează mai întâi un template</p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanie</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Audiență</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Programat</TableHead>
                      <TableHead>Stats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <p className="font-semibold text-white">{campaign.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-300">{campaign.template_name}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {campaign.target_audience === 'all' ? 'Toți userii' : 
                             campaign.target_audience === 'premium' ? 'Premium' : 
                             campaign.target_audience === 'free' ? 'Free' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              campaign.status === 'sent' ? 'bg-green-500 text-white' :
                              campaign.status === 'scheduled' ? 'bg-orange-500 text-white' :
                              campaign.status === 'draft' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
                            }
                          >
                            {campaign.status === 'sent' ? 'Trimis' :
                             campaign.status === 'scheduled' ? 'Programat' :
                             campaign.status === 'draft' ? 'Draft' : 'Eșuat'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {campaign.scheduled_at 
                              ? format(new Date(campaign.scheduled_at), 'dd MMM yyyy, HH:mm')
                              : '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {campaign.sent_count > 0 ? (
                            <div className="text-xs text-gray-300">
                              <p>Trimise: {campaign.sent_count}</p>
                              <p>Open: {campaign.open_count}</p>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="mt-6">
          <Card className="ios-card border-none ios-shadow-lg">
            <CardHeader>
              <CardTitle className="text-[rgb(var(--ios-text-primary))]">📊 Email Analytics History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nu există istoric. Trimite prima campanie!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanie</TableHead>
                      <TableHead>Trimis</TableHead>
                      <TableHead>Deschis</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <p className="font-semibold text-white">{entry.campaign_name}</p>
                        </TableCell>
                        <TableCell>{entry.sent}</TableCell>
                        <TableCell>{entry.opened}</TableCell>
                        <TableCell>{entry.clicked}</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-500 text-white">
                            {((entry.opened / entry.sent) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500 text-white">
                            {((entry.clicked / entry.sent) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-gray-400">
                            {format(new Date(entry.sent_at), 'dd MMM yyyy')}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Template Dialog */}
      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📧 Creează Template Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nume Template *</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Welcome Email"
                  required
                />
              </div>
              <div>
                <Label>Categorie</Label>
                <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Subject *</Label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                placeholder="Bine ai venit la EatnFit!"
                required
              />
            </div>

            <div>
              <Label>HTML Body *</Label>
              <div className="flex gap-2 mb-2">
                <Button size="sm" variant="outline" onClick={() => insertTag('bold')}>
                  <strong>B</strong>
                </Button>
                <Button size="sm" variant="outline" onClick={() => insertTag('link')}>
                  🔗 Link
                </Button>
                <Button size="sm" variant="outline" onClick={() => insertTag('button')}>
                  Button
                </Button>
              </div>
              <Textarea
                id="template-body"
                value={newTemplate.body_html}
                onChange={(e) => setNewTemplate({ ...newTemplate, body_html: e.target.value })}
                placeholder="<h1>Salut {{first_name}}!</h1><p>Bine ai venit la EatnFit...</p>"
                rows={12}
                className="font-mono"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 Variabile disponibile: {'{'}{'{'} first_name {'}'}{'}'}, {'{'}{'{'} last_name {'}'}{'}'}, {'{'}{'{'} email {'}'}{'}'}
              </p>
            </div>

            <Button
              onClick={() => createTemplateMutation.mutate(newTemplate)}
              disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.body_html || createTemplateMutation.isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              {createTemplateMutation.isLoading ? 'Se salvează...' : '✅ Creează Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📬 Creează Campanie Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nume Campanie *</Label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Welcome Campaign - Noiembrie 2025"
                required
              />
            </div>

            <div>
              <Label>Template *</Label>
              <Select value={newCampaign.template_id} onValueChange={(v) => setNewCampaign({ ...newCampaign, template_id: parseInt(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Audiență</Label>
              <Select value={newCampaign.target_audience} onValueChange={(v) => setNewCampaign({ ...newCampaign, target_audience: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toți userii</SelectItem>
                  <SelectItem value="premium">Doar Premium</SelectItem>
                  <SelectItem value="free">Doar Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Programează (opțional)</Label>
              <Input
                type="datetime-local"
                value={newCampaign.scheduled_at}
                onChange={(e) => setNewCampaign({ ...newCampaign, scheduled_at: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Lasă gol pentru trimitere imediată</p>
            </div>

            <Button
              onClick={() => createCampaignMutation.mutate(newCampaign)}
              disabled={!newCampaign.name || !newCampaign.template_id || createCampaignMutation.isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {createCampaignMutation.isLoading ? 'Se creează...' : '✅ Creează Campanie'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>👀 Preview: {previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <p className="text-white font-semibold">{previewTemplate.subject}</p>
              </div>
              <div>
                <Label>Body (HTML)</Label>
                <div 
                  className="bg-white text-black p-6 rounded-lg border" 
                  dangerouslySetInnerHTML={{ __html: previewTemplate.body_html }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

