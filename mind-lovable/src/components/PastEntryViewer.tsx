import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Pencil, Eye } from 'lucide-react';
import { groupRecordsBySection } from '@/hooks/useJournalData';
import { SavedEntryRenderer } from '@/components/SavedEntryRenderer';
import type { JournalRecord, SectionType } from '@/types/journal';

interface PastEntryViewerProps {
  records: JournalRecord[];
  date: Date;
  isEditable: boolean;
}

export function PastEntryViewer({ records, date, isEditable }: PastEntryViewerProps) {
  const grouped = useMemo(() => groupRecordsBySection(records), [records]);
  
  const sectionsWithData = useMemo(() => {
    return (Object.entries(grouped) as [SectionType, typeof grouped.mood_tracking][])
      .filter(([_, answers]) => answers.length > 0);
  }, [grouped]);

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No entries for this date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {format(date, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                {isToday(date) ? "Today's entries" : 'Past entries'}
              </CardDescription>
            </div>
            <Badge variant={isEditable ? 'default' : 'secondary'} className="gap-1">
              {isEditable ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {isEditable ? 'Editable' : 'View Only'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {sectionsWithData.map(([section, answers]) => (
        <SavedEntryRenderer key={section} section={section} answers={answers} />
      ))}
    </div>
  );
}
