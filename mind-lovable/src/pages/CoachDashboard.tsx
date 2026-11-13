import { useState, useMemo, useEffect } from 'react';
import { Search, Save, Loader2, CalendarDays, Plus, Trash2, StickyNote, Paperclip, X, Image, Video, FileText } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { GoodFlipLogo } from '@/components/GoodFlipLogo';
import { useAllPatients, useTemplateAssignments, useSaveTemplateAssignments } from '@/hooks/useTemplateAssignments';
import { useCoachNotes, useSaveCoachNote, useDeleteCoachNote } from '@/hooks/useCoachNotes';
import type { CoachNote } from '@/hooks/useCoachNotes';
import { formatMobile, normalizeMobile, isValidMobile } from '@/lib/mobile';
import { ALL_TEMPLATES } from '@/types/journal';
import { toast } from 'sonner';

export default function CoachDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMobile, setSelectedMobile] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [fillCounts, setFillCounts] = useState<Record<string, number>>({});
  const [habitNames, setHabitNames] = useState<string[]>(['']);
  const [habitDurationWeeks, setHabitDurationWeeks] = useState(4);
  const [assignDate, setAssignDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<{ name: string; url?: string; type: string }[]>([]);
  
  const assignDateStr = format(assignDate, 'yyyy-MM-dd');
  
  const { data: patients = [], isLoading: patientsLoading } = useAllPatients();
  const { data: assignments, isLoading: assignmentsLoading } = useTemplateAssignments(selectedMobile || '', assignDateStr);
  const saveAssignments = useSaveTemplateAssignments();
  const { data: coachNotes = [], isLoading: notesLoading } = useCoachNotes(selectedMobile || '');
  const saveNote = useSaveCoachNote();
  const deleteNote = useDeleteCoachNote();

  useEffect(() => {
    if (assignments) {
      setSelectedTemplates(new Set(assignments.map(a => a.template_id)));
      const counts: Record<string, number> = {};
      assignments.forEach(a => { counts[a.template_id] = (a as any).fill_count ?? 1; });
      setFillCounts(counts);
      const habitAssignment = assignments.find(a => a.template_id === 'habit_tracker') as any;
      setHabitNames(habitAssignment?.habit_names?.length ? habitAssignment.habit_names : ['']);
      setHabitDurationWeeks(habitAssignment?.habit_duration_weeks ?? 4);
    } else {
      setSelectedTemplates(new Set());
      setFillCounts({});
      setHabitNames(['']);
      setHabitDurationWeeks(4);
    }
  }, [assignments]);


  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase().replace(/\s/g, '');
    return patients.filter(p => p.mobile.toLowerCase().includes(query));
  }, [patients, searchQuery]);

  const handlePatientSelect = (mobile: string) => {
    setSelectedMobile(mobile);
    setSelectedTemplates(new Set());
    setFillCounts({});
    setNewNote('');
    clearAllAttachments();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const oversized = files.find(f => f.size > 20 * 1024 * 1024);
    if (oversized) {
      toast.error('Each file must be under 20MB');
      return;
    }
    const newPreviews = files.map(f => ({
      name: f.name,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      type: f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : 'file',
    }));
    setAttachmentFiles(prev => [...prev, ...files]);
    setAttachmentPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => {
      if (prev[index]?.url) URL.revokeObjectURL(prev[index].url!);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAllAttachments = () => {
    attachmentPreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
    setAttachmentFiles([]);
    setAttachmentPreviews([]);
  };

  const handleAddNote = async () => {
    if (!selectedMobile || (!newNote.trim() && attachmentFiles.length === 0)) return;
    try {
      await saveNote.mutateAsync({
        mobile: selectedMobile,
        noteText: newNote.trim(),
        attachmentFiles: attachmentFiles.length > 0 ? attachmentFiles : undefined,
      });
      setNewNote('');
      clearAllAttachments();
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedMobile) return;
    try {
      await deleteNote.mutateAsync({ noteId, mobile: selectedMobile });
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
        setFillCounts(fc => { const n = { ...fc }; delete n[templateId]; return n; });
      } else {
        next.add(templateId);
        setFillCounts(fc => ({ ...fc, [templateId]: fc[templateId] ?? 1 }));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedMobile) return;
    try {
      const cleanedHabits = habitNames.map(h => h.trim()).filter(Boolean);
      await saveAssignments.mutateAsync({
        mobile: selectedMobile,
        templateIds: Array.from(selectedTemplates),
        assignedDate: assignDateStr,
        fillCounts,
        habitNames: { habit_tracker: cleanedHabits },
        habitDurationWeeks: { habit_tracker: habitDurationWeeks },
      });
      toast.success(`Template assignments saved for ${format(assignDate, 'MMM d, yyyy')}`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save assignments. Please try again.');
    }
  };


  const handleAddNewPatient = () => {
    const normalizedSearch = normalizeMobile(searchQuery);
    if (isValidMobile(searchQuery) || isValidMobile(normalizedSearch)) {
      setSelectedMobile(normalizedSearch);
      setSelectedTemplates(new Set());
    } else {
      toast.error('Please enter a valid 10 or 12 digit mobile number');
    }
  };

  const renderNoteAttachments = (note: CoachNote) => {
    const allAttachments: { url: string; type: string }[] = [];
    if (note.attachment_url) {
      allAttachments.push({ url: note.attachment_url, type: note.attachment_type || 'file' });
    }
    note.attachments.forEach(a => allAttachments.push({ url: a.file_url, type: a.file_type }));

    if (allAttachments.length === 0) return null;

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {allAttachments.map((att, i) => (
          <div key={i}>
            {att.type === 'image' && (
              <a href={att.url} target="_blank" rel="noreferrer" className="block aspect-square rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors">
                <img src={att.url} alt="Attachment" className="w-full h-full object-cover" />
              </a>
            )}
            {att.type === 'video' && (
              <div className="aspect-square rounded-md overflow-hidden border border-border bg-black/5">
                <video src={att.url} controls className="w-full h-full object-cover" />
              </div>
            )}
            {att.type === 'file' && (
              <a href={att.url} target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1 aspect-square rounded-md border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-primary">View</span>
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen goodflip-bg">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <GoodFlipLogo size="md" />
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Patient Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Select Patient</CardTitle>
                <CardDescription>Search by mobile number or add new</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="text" placeholder="Search or enter mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                {searchQuery && filteredPatients.length === 0 && (
                  <Button variant="outline" className="w-full" onClick={handleAddNewPatient}>
                    Assign templates to {searchQuery}
                  </Button>
                )}
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {patientsLoading ? (
                    <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : filteredPatients.length === 0 && !searchQuery ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No patients found. Enter a mobile number to assign templates.</p>
                  ) : (
                    filteredPatients.map((patient) => (
                      <button key={patient.mobile} onClick={() => handlePatientSelect(patient.mobile)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedMobile === patient.mobile ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                        <span className="font-mono text-sm">{formatMobile(patient.mobile)}</span>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Assignment */}
          <div>
            {selectedMobile ? (
              <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle>Assign Templates</CardTitle>
                      <CardDescription>Patient: <span className="font-mono">{formatMobile(selectedMobile)}</span></CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {format(assignDate, 'MMM d, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar mode="single" selected={assignDate}
                            onSelect={(d) => { if (d) { setAssignDate(d); setCalendarOpen(false); } }}
                            disabled={(d) => d < new Date(new Date().toDateString())} />
                        </PopoverContent>
                      </Popover>
                      <Button onClick={handleSave} disabled={saveAssignments.isPending} className="gap-2">
                        {saveAssignments.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {assignmentsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ALL_TEMPLATES.map((template) => (
                        <div key={template.id}
                          className={`flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedTemplates.has(template.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox checked={selectedTemplates.has(template.id)} onCheckedChange={() => handleTemplateToggle(template.id)} className="mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{template.title}</div>
                              <div className="text-sm text-muted-foreground">{template.description}</div>
                            </div>
                          </label>
                          {selectedTemplates.has(template.id) && (
                            <div className="flex items-center gap-2 pl-7">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">Times to fill:</span>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={fillCounts[template.id] ?? 1}
                                onChange={(e) => setFillCounts(prev => ({ ...prev, [template.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 h-7 px-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          )}
                          {selectedTemplates.has(template.id) && template.id === 'habit_tracker' && (
                            <div className="pl-7 space-y-2" onClick={(e) => e.stopPropagation()}>
                              <div className="text-xs text-muted-foreground">Habits for this tracker (added by coach — appears every day):</div>
                              <div className="space-y-1.5">
                                {habitNames.map((name, i) => (
                                  <div key={i} className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={name}
                                      onChange={(e) => setHabitNames(prev => prev.map((h, j) => (j === i ? e.target.value : h)))}
                                      placeholder={`Habit ${i + 1}`}
                                      className="flex-1 h-8 px-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    {habitNames.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setHabitNames(prev => prev.filter((_, j) => j !== i))}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1"
                                onClick={() => setHabitNames(prev => [...prev, ''])}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add habit
                              </Button>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Duration (weeks):</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={52}
                                  value={habitDurationWeeks}
                                  onChange={(e) => setHabitDurationWeeks(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-16 h-7 px-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <span className="text-xs text-muted-foreground">habits stop appearing after this</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coach Notes */}
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Notes for Patient
                  </CardTitle>
                  <CardDescription>Add notes visible to the patient on their dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea placeholder="Write a note for this patient..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="min-h-[60px]" />
                    {/* Attachment previews */}
                    {attachmentPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachmentPreviews.map((preview, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
                            {preview.url ? (
                              <img src={preview.url} alt="Preview" className="h-12 w-12 object-cover rounded" />
                            ) : preview.type === 'video' ? (
                              <Video className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span className="text-xs text-foreground truncate max-w-[100px]">{preview.name}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(i)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={handleFileSelect} multiple />
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                          <Paperclip className="h-3.5 w-3.5" />
                          Attach
                        </div>
                      </label>
                      <div className="flex-1" />
                      <Button onClick={handleAddNote} disabled={saveNote.isPending || (!newNote.trim() && attachmentFiles.length === 0)} size="sm" className="gap-2">
                        {saveNote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Add Note
                      </Button>
                    </div>
                  </div>
                  {notesLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : coachNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">No notes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {(coachNotes as CoachNote[]).map((note) => (
                        <div key={note.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                          {note.note_text && <p className="text-sm text-foreground whitespace-pre-wrap">{note.note_text}</p>}
                          {renderNoteAttachments(note)}
                          <div className="flex justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                Select a patient to assign templates
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
