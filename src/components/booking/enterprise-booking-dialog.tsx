import React, { useState } from 'react';
import { Calendar, Clock, Users, Repeat, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface EnterpriseBookingProps {
  children: React.ReactNode;
}

export function EnterpriseBookingDialog({ children }: EnterpriseBookingProps) {
  const [open, setOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'single' | 'recurring' | 'group' | 'earlier'>('single');
  
  // Recurring booking states
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [maxOccurrences, setMaxOccurrences] = useState(10);
  
  // Group booking states
  const [groupSize, setGroupSize] = useState(2);
  const [participants, setParticipants] = useState([
    { name: '', email: '', phone: '' }
  ]);
  
  // Earlier appointment states
  const [currentBookingId, setCurrentBookingId] = useState('');
  const [flexibleTiming, setFlexibleTiming] = useState(true);
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  const addParticipant = () => {
    if (participants.length < 20) {
      setParticipants([...participants, { name: '', email: '', phone: '' }]);
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    setParticipants(participants.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const handleRecurringBooking = async () => {
    try {
      const response = await fetch('/api/bookings/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 't_dev',
          'x-user-email': 'customer@example.com'
        },
        body: JSON.stringify({
          serviceId: 'demo-service-id',
          staffId: 'demo-staff-id',
          customerEmail: 'customer@example.com',
          startDate: new Date().toISOString(),
          frequency: recurringFrequency,
          timeSlot: '14:00',
          maxOccurrences
        })
      });

      if (response.ok) {
        toast({
          title: 'Serientermin erstellt!',
          description: `${maxOccurrences} Termine im ${recurringFrequency === 'weekly' ? 'wöchentlichen' : recurringFrequency === 'biweekly' ? 'zweiwöchentlichen' : 'monatlichen'} Rhythmus gebucht.`
        });
        setOpen(false);
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Serientermin konnte nicht erstellt werden.',
        variant: 'destructive'
      });
    }
  };

  const handleGroupBooking = async () => {
    try {
      const response = await fetch('/api/bookings/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 't_dev',
          'x-user-email': 'customer@example.com'
        },
        body: JSON.stringify({
          serviceId: 'demo-service-id',
          staffId: 'demo-staff-id',
          primaryEmail: 'customer@example.com',
          groupName: `Gruppe ${participants.length} Personen`,
          startAt: new Date().toISOString(),
          maxParticipants: groupSize,
          pricePerPerson: 45,
          participants: participants.filter(p => p.name && p.email)
        })
      });

      if (response.ok) {
        toast({
          title: 'Gruppentermin erstellt!',
          description: `Termin für ${participants.filter(p => p.name && p.email).length} Personen gebucht.`
        });
        setOpen(false);
      } else {
        throw new Error('Group booking failed');
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Gruppentermin konnte nicht erstellt werden.',
        variant: 'destructive'
      });
    }
  };

  const handleEarlierAppointment = async () => {
    try {
      const response = await fetch('/api/bookings/earlier-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 't_dev',
          'x-user-email': 'customer@example.com'
        },
        body: JSON.stringify({
          currentBookingId,
          flexibleTiming,
          priority
        })
      });

      if (response.ok) {
        toast({
          title: 'Anfrage gestellt!',
          description: 'Sie werden benachrichtigt, wenn ein früherer Termin verfügbar wird.'
        });
        setOpen(false);
      } else {
        throw new Error('Earlier appointment request failed');
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Anfrage konnte nicht gestellt werden.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Erweiterte Buchungsoptionen</DialogTitle>
          <DialogDescription>
            Wählen Sie zwischen verschiedenen Buchungsarten für Ihre Bedürfnisse
          </DialogDescription>
        </DialogHeader>

        <Tabs value={bookingType} onValueChange={(value) => setBookingType(value as 'single' | 'recurring' | 'group' | 'earlier')}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Einzeltermin</span>
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-1">
              <Repeat className="h-4 w-4" />
              <span className="hidden sm:inline">Serientermin</span>
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Gruppe</span>
            </TabsTrigger>
            <TabsTrigger value="earlier" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Früher</span>
            </TabsTrigger>
          </TabsList>

          {/* Single Booking */}
          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Einzeltermin buchen
                </CardTitle>
                <CardDescription>
                  Reguläre Terminbuchung für eine Person
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Nutzen Sie die normale Terminbuchung im Hauptmenü.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recurring Booking */}
          <TabsContent value="recurring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5" />
                  Serientermin einrichten
                </CardTitle>
                <CardDescription>
                  Regelmäßige Termine im gewählten Rhythmus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Häufigkeit</Label>
                    <Select value={recurringFrequency} onValueChange={(value) => setRecurringFrequency(value as 'weekly' | 'biweekly' | 'monthly')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                        <SelectItem value="biweekly">Alle 2 Wochen</SelectItem>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Anzahl Termine</Label>
                    <Input
                      type="number"
                      min="1"
                      max="52"
                      value={maxOccurrences}
                      onChange={(e) => setMaxOccurrences(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Vorschau:</h4>
                  <p className="text-sm text-muted-foreground">
                    {maxOccurrences} Termine im {
                      recurringFrequency === 'weekly' ? 'wöchentlichen' :
                      recurringFrequency === 'biweekly' ? 'zweiwöchentlichen' : 'monatlichen'
                    } Rhythmus
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Geschätzte Kosten: CHF {(maxOccurrences * 45).toFixed(2)}
                  </Badge>
                </div>

                <Button onClick={handleRecurringBooking} className="w-full">
                  Serientermin erstellen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Group Booking */}
          <TabsContent value="group" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gruppentermin buchen
                </CardTitle>
                <CardDescription>
                  Termin für mehrere Personen gleichzeitig
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximale Teilnehmerzahl</Label>
                  <Input
                    type="number"
                    min="2"
                    max="20"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Teilnehmer</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addParticipant}
                      disabled={participants.length >= groupSize}
                    >
                      + Person hinzufügen
                    </Button>
                  </div>

                  {participants.map((participant, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Name"
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="E-Mail"
                          type="email"
                          value={participant.email}
                          onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Telefon"
                            value={participant.phone}
                            onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                          />
                          {participants.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeParticipant(index)}
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Gruppentarif:</h4>
                  <p className="text-sm text-muted-foreground">
                    CHF 45 pro Person • {participants.filter(p => p.name && p.email).length} bestätigte Teilnehmer
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Gesamtpreis: CHF {(participants.filter(p => p.name && p.email).length * 45).toFixed(2)}
                  </Badge>
                </div>

                <Button onClick={handleGroupBooking} className="w-full">
                  Gruppentermin buchen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earlier Appointment */}
          <TabsContent value="earlier" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Früheren Termin finden
                </CardTitle>
                <CardDescription>
                  Benachrichtigung bei verfügbaren früheren Terminen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Aktuelle Buchungs-ID</Label>
                  <Input
                    placeholder="z.B. booking_123456"
                    value={currentBookingId}
                    onChange={(e) => setCurrentBookingId(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Flexible Zeiten</Label>
                    <p className="text-sm text-muted-foreground">
                      Auch andere Uhrzeiten akzeptieren
                    </p>
                  </div>
                  <Switch
                    checked={flexibleTiming}
                    onCheckedChange={setFlexibleTiming}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priorität</Label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as 'normal' | 'urgent')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Dringend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-medium">Automatische Benachrichtigung</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sie erhalten eine E-Mail/SMS, sobald ein früherer Termin verfügbar wird.
                    Die Anfrage läuft automatisch ab, wenn Ihr ursprünglicher Termin erreicht ist.
                  </p>
                </div>

                <Button
                  onClick={handleEarlierAppointment}
                  className="w-full"
                  disabled={!currentBookingId}
                >
                  Anfrage für früheren Termin stellen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
