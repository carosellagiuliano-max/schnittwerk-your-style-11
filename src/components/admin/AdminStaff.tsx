import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, Calendar, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';

const ADMIN_HEADERS = {
  'x-user-role': 'admin',
  'x-user-email': 'admin@dev.local'
};

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

interface Staff {
  id: string;
  name: string;
  active: boolean;
  imageUrl?: string;
}

interface Schedule {
  id: string;
  weekday: number;
  startMin: number;
  endMin: number;
}

interface TimeOff {
  id: string;
  dateFrom: string;
  dateTo: string;
  reason?: string;
}

export function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [activeTab, setActiveTab] = useState('staff');

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    weekday: 0,
    startHour: 9,
    startMin: 0,
    endHour: 17,
    endMin: 0
  });

  // TimeOff form state
  const [timeOffForm, setTimeOffForm] = useState({
    dateFrom: '',
    dateTo: '',
    reason: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      loadSchedules(selectedStaff.id);
      loadTimeOffs(selectedStaff.id);
    }
  }, [selectedStaff]);

  const loadStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff', { headers: ADMIN_HEADERS });
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      logger.error('Failed to load staff:', error as error as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async (staffId: string) => {
    try {
      const response = await fetch(`/api/admin/staff/${staffId}/schedules`, { headers: ADMIN_HEADERS });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      logger.error('Failed to load schedules:', error as error as Error);
    }
  };

  const loadTimeOffs = async (staffId: string) => {
    try {
      const response = await fetch(`/api/admin/staff/${staffId}/timeoff`, { headers: ADMIN_HEADERS });
      if (response.ok) {
        const data = await response.json();
        setTimeOffs(data);
      }
    } catch (error) {
      logger.error('Failed to load timeoffs:', error as Error);
    }
  };

  const createStaff = async () => {
    if (!newStaffName.trim()) return;

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify({ name: newStaffName })
      });

      if (response.ok) {
        const newStaff = await response.json();
        setStaff(prev => [...prev, newStaff]);
        setNewStaffName('');
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      logger.error('Failed to create staff:', error as Error);
    }
  };

  const toggleStaffActive = async (staffMember: Staff) => {
    try {
      const response = await fetch(`/api/admin/staff/${staffMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify({ active: !staffMember.active })
      });

      if (response.ok) {
        setStaff(prev => prev.map(s => 
          s.id === staffMember.id ? { ...s, active: !s.active } : s
        ));
      }
    } catch (error) {
      logger.error('Failed to update staff:', error as Error);
    }
  };

  const deleteStaff = async (staffId: string) => {
    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS
      });

      if (response.ok) {
        setStaff(prev => prev.filter(s => s.id !== staffId));
        if (selectedStaff?.id === staffId) {
          setSelectedStaff(null);
        }
      }
    } catch (error) {
      logger.error('Failed to delete staff:', error as Error);
    }
  };

  const addSchedule = async () => {
    if (!selectedStaff) return;

    const startMin = scheduleForm.startHour * 60 + scheduleForm.startMin;
    const endMin = scheduleForm.endHour * 60 + scheduleForm.endMin;

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify({
          weekday: scheduleForm.weekday,
          startMin,
          endMin
        })
      });

      if (response.ok) {
        const newSchedule = await response.json();
        setSchedules(prev => [...prev, newSchedule]);
        setIsScheduleDialogOpen(false);
        setScheduleForm({ weekday: 0, startHour: 9, startMin: 0, endHour: 17, endMin: 0 });
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Hinzufügen der Arbeitszeit');
      }
    } catch (error) {
      logger.error('Failed to add schedule:', error as Error);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!selectedStaff) return;

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS
      });

      if (response.ok) {
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      }
    } catch (error) {
      logger.error('Failed to delete schedule:', error as Error);
    }
  };

  const addTimeOff = async () => {
    if (!selectedStaff || !timeOffForm.dateFrom || !timeOffForm.dateTo) return;

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}/timeoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify({
          dateFrom: new Date(timeOffForm.dateFrom).toISOString(),
          dateTo: new Date(timeOffForm.dateTo).toISOString(),
          reason: timeOffForm.reason
        })
      });

      if (response.ok) {
        const newTimeOff = await response.json();
        setTimeOffs(prev => [...prev, newTimeOff]);
        setIsTimeOffDialogOpen(false);
        setTimeOffForm({ dateFrom: '', dateTo: '', reason: '' });
      }
    } catch (error) {
      logger.error('Failed to add timeoff:', error as Error);
    }
  };

  const deleteTimeOff = async (timeOffId: string) => {
    if (!selectedStaff) return;

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}/timeoff/${timeOffId}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS
      });

      if (response.ok) {
        setTimeOffs(prev => prev.filter(t => t.id !== timeOffId));
      }
    } catch (error) {
      logger.error('Failed to delete timeoff:', error as Error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Mitarbeiter verwalten</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Mitarbeiter hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Mitarbeiter hinzufügen</DialogTitle>
              <DialogDescription>
                Geben Sie den Namen des neuen Mitarbeiters ein.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="staffName">Name</Label>
                <Input
                  id="staffName"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="z.B. Max Mustermann"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={createStaff}>Hinzufügen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Mitarbeiter</TabsTrigger>
          {selectedStaff && (
            <>
              <TabsTrigger value="schedules">Arbeitszeiten</TabsTrigger>
              <TabsTrigger value="timeoffs">Abwesenheiten</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Mitarbeiter</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Mitarbeiter und deren Status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((staffMember) => (
                    <TableRow key={staffMember.id}>
                      <TableCell className="font-medium">{staffMember.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={staffMember.active}
                            onCheckedChange={() => toggleStaffActive(staffMember)}
                          />
                          <Badge variant={staffMember.active ? "default" : "secondary"}>
                            {staffMember.active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStaff(staffMember);
                              setActiveTab('schedules');
                            }}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Arbeitszeiten
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteStaff(staffMember.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedStaff && (
          <>
            <TabsContent value="schedules">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Arbeitszeiten - {selectedStaff.name}</CardTitle>
                      <CardDescription>
                        Verwalten Sie die regulären Arbeitszeiten.
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Arbeitszeit hinzufügen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Arbeitszeit hinzufügen</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Wochentag</Label>
                              <Select value={scheduleForm.weekday.toString()} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, weekday: parseInt(value) }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {WEEKDAYS.map((day, index) => (
                                    <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Startzeit</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={scheduleForm.startHour}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, startHour: parseInt(e.target.value) || 0 }))}
                                    placeholder="Std"
                                  />
                                  <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="15"
                                    value={scheduleForm.startMin}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, startMin: parseInt(e.target.value) || 0 }))}
                                    placeholder="Min"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Endzeit</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={scheduleForm.endHour}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, endHour: parseInt(e.target.value) || 0 }))}
                                    placeholder="Std"
                                  />
                                  <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="15"
                                    value={scheduleForm.endMin}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, endMin: parseInt(e.target.value) || 0 }))}
                                    placeholder="Min"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                              Abbrechen
                            </Button>
                            <Button onClick={addSchedule}>Hinzufügen</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" onClick={() => setSelectedStaff(null)}>
                        <X className="w-4 h-4 mr-1" />
                        Zurück
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wochentag</TableHead>
                        <TableHead>Startzeit</TableHead>
                        <TableHead>Endzeit</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>{WEEKDAYS[schedule.weekday]}</TableCell>
                          <TableCell>{formatTime(schedule.startMin)}</TableCell>
                          <TableCell>{formatTime(schedule.endMin)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSchedule(schedule.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeoffs">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Abwesenheiten - {selectedStaff.name}</CardTitle>
                      <CardDescription>
                        Verwalten Sie Urlaub und andere Abwesenheiten.
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={isTimeOffDialogOpen} onOpenChange={setIsTimeOffDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Abwesenheit hinzufügen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Abwesenheit hinzufügen</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="dateFrom">Von Datum</Label>
                              <Input
                                id="dateFrom"
                                type="date"
                                value={timeOffForm.dateFrom}
                                onChange={(e) => setTimeOffForm(prev => ({ ...prev, dateFrom: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dateTo">Bis Datum</Label>
                              <Input
                                id="dateTo"
                                type="date"
                                value={timeOffForm.dateTo}
                                onChange={(e) => setTimeOffForm(prev => ({ ...prev, dateTo: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="reason">Grund (optional)</Label>
                              <Textarea
                                id="reason"
                                value={timeOffForm.reason}
                                onChange={(e) => setTimeOffForm(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="z.B. Urlaub, Krankheit, etc."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTimeOffDialogOpen(false)}>
                              Abbrechen
                            </Button>
                            <Button onClick={addTimeOff}>Hinzufügen</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" onClick={() => setSelectedStaff(null)}>
                        <X className="w-4 h-4 mr-1" />
                        Zurück
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Von</TableHead>
                        <TableHead>Bis</TableHead>
                        <TableHead>Grund</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeOffs.map((timeOff) => (
                        <TableRow key={timeOff.id}>
                          <TableCell>{new Date(timeOff.dateFrom).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(timeOff.dateTo).toLocaleDateString()}</TableCell>
                          <TableCell>{timeOff.reason || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteTimeOff(timeOff.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
