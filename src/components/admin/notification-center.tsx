import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Check, X, Settings, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface NotificationLog {
  id: string;
  recipient: string;
  type: 'email' | 'sms';
  event: string;
  subject?: string;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: string;
  deliveredAt?: string;
  errorMsg?: string;
  createdAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  event: string;
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  active: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Template editor state
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    event: 'booking_confirmed',
    subject: '',
    bodyText: '',
    bodyHtml: '',
    active: true
  });

  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  // Send notification state
  const [sendFormData, setSendFormData] = useState({
    recipient: '',
    type: 'email' as 'email' | 'sms',
    event: 'booking_confirmed',
    subject: '',
    variables: {}
  });

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    try {
      setLoading(true);
      const [logsResponse, templatesResponse] = await Promise.all([
        fetch('/api/notifications/logs', {
          headers: {
            'x-tenant-id': 't_dev',
            'x-user-email': 'admin@schnittwerk.ch'
          }
        }),
        fetch('/api/notifications/templates', {
          headers: {
            'x-tenant-id': 't_dev',
            'x-user-email': 'admin@schnittwerk.ch'
          }
        })
      ]);

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData || []);
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
      toast({
        title: 'Fehler',
        description: 'Benachrichtigungsdaten konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'secondary' | 'default' | 'destructive'> = {
      pending: 'secondary',
      sent: 'default',
      delivered: 'secondary',
      failed: 'destructive'
    };
    
    const labels = {
      pending: 'Ausstehend',
      sent: 'Gesendet',
      delivered: 'Zugestellt',
      failed: 'Fehlgeschlagen'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getEventLabel = (event: string) => {
    const labels = {
      booking_confirmed: 'Termin bestätigt',
      booking_reminder: 'Termin-Erinnerung',
      booking_cancelled: 'Termin storniert',
      waitlist_available: 'Warteliste: Platz frei',
      earlier_appointment_available: 'Früherer Termin verfügbar'
    };
    
    return labels[event as keyof typeof labels] || event;
  };

  const handleSaveTemplate = async () => {
    try {
      const method = selectedTemplate ? 'PUT' : 'POST';
      const url = selectedTemplate 
        ? `/api/notifications/templates/${selectedTemplate.id}`
        : '/api/notifications/templates';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 't_dev',
          'x-user-email': 'admin@schnittwerk.ch'
        },
        body: JSON.stringify(templateFormData)
      });

      if (response.ok) {
        toast({
          title: 'Template gespeichert',
          description: selectedTemplate ? 'Template wurde aktualisiert.' : 'Neues Template erstellt.'
        });
        setShowTemplateDialog(false);
        setSelectedTemplate(null);
        loadNotificationData();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Template konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  };

  const handleSendNotification = async () => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 't_dev',
          'x-user-email': 'admin@schnittwerk.ch'
        },
        body: JSON.stringify(sendFormData)
      });

      if (response.ok) {
        toast({
          title: 'Benachrichtigung gesendet',
          description: `${sendFormData.type === 'email' ? 'E-Mail' : 'SMS'} wurde versendet.`
        });
        setShowSendDialog(false);
        loadNotificationData();
      } else {
        throw new Error('Send failed');
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Benachrichtigung konnte nicht gesendet werden.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Lade Benachrichtigungen...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Benachrichtigungen und Templates
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Senden
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Benachrichtigung senden</DialogTitle>
                <DialogDescription>
                  Senden Sie eine manuelle Benachrichtigung
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Empfänger</Label>
                    <Input
                      placeholder="E-Mail oder Telefonnummer"
                      value={sendFormData.recipient}
                      onChange={(e) => setSendFormData({...sendFormData, recipient: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Typ</Label>
                    <Select 
                      value={sendFormData.type} 
                      onValueChange={(value) => setSendFormData({...sendFormData, type: value as 'email' | 'sms'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">E-Mail</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select 
                    value={sendFormData.event} 
                    onValueChange={(value) => setSendFormData({...sendFormData, event: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking_confirmed">Termin bestätigt</SelectItem>
                      <SelectItem value="booking_reminder">Termin-Erinnerung</SelectItem>
                      <SelectItem value="booking_cancelled">Termin storniert</SelectItem>
                      <SelectItem value="waitlist_available">Warteliste: Platz frei</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {sendFormData.type === 'email' && (
                  <div className="space-y-2">
                    <Label>Betreff</Label>
                    <Input
                      value={sendFormData.subject}
                      onChange={(e) => setSendFormData({...sendFormData, subject: e.target.value})}
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSendNotification}>
                    Senden
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Template erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? 'Template bearbeiten' : 'Neues Template'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={templateFormData.name}
                      onChange={(e) => setTemplateFormData({...templateFormData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Typ</Label>
                    <Select 
                      value={templateFormData.type}
                      onValueChange={(value) => setTemplateFormData({...templateFormData, type: value as 'email' | 'sms'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">E-Mail</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select 
                    value={templateFormData.event}
                    onValueChange={(value) => setTemplateFormData({...templateFormData, event: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking_confirmed">Termin bestätigt</SelectItem>
                      <SelectItem value="booking_reminder">Termin-Erinnerung</SelectItem>
                      <SelectItem value="booking_cancelled">Termin storniert</SelectItem>
                      <SelectItem value="waitlist_available">Warteliste: Platz frei</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {templateFormData.type === 'email' && (
                  <div className="space-y-2">
                    <Label>Betreff</Label>
                    <Input
                      value={templateFormData.subject}
                      onChange={(e) => setTemplateFormData({...templateFormData, subject: e.target.value})}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Nachrichtentext</Label>
                  <Textarea
                    rows={6}
                    value={templateFormData.bodyText}
                    onChange={(e) => setTemplateFormData({...templateFormData, bodyText: e.target.value})}
                    placeholder="Verwenden Sie {{variable}} für dynamische Inhalte"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={templateFormData.active}
                      onCheckedChange={(checked) => setTemplateFormData({...templateFormData, active: checked})}
                    />
                    <Label>Aktiv</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      Speichern
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Benachrichtigungslog</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Suchen nach Empfänger oder Event..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="sent">Gesendet</SelectItem>
                    <SelectItem value="delivered">Zugestellt</SelectItem>
                    <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="email">E-Mail</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Keine Benachrichtigungen gefunden.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {log.type === 'email' ? (
                            <Mail className="h-4 w-4" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          <span className="font-medium">{log.recipient}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {getEventLabel(log.event)}
                          {log.subject && ` • ${log.subject}`}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                          {log.sentAt && ` • Gesendet: ${format(new Date(log.sentAt), 'HH:mm', { locale: de })}`}
                        </p>
                        
                        {log.errorMsg && (
                          <p className="text-xs text-red-600">
                            Fehler: {log.errorMsg}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-2">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Keine Templates vorhanden. Erstellen Sie Ihr erstes Template.
                  </p>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.name}</span>
                          <Badge variant="outline">
                            {template.type === 'email' ? 'E-Mail' : 'SMS'}
                          </Badge>
                          {template.active ? (
                            <Badge variant="default">Aktiv</Badge>
                          ) : (
                            <Badge variant="secondary">Inaktiv</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {getEventLabel(template.event)}
                          {template.subject && ` • ${template.subject}`}
                        </p>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.bodyText}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setTemplateFormData({
                            name: template.name,
                            type: template.type,
                            event: template.event,
                            subject: template.subject || '',
                            bodyText: template.bodyText,
                            bodyHtml: template.bodyHtml || '',
                            active: template.active
                          });
                          setShowTemplateDialog(true);
                        }}
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
