import { useState, useMemo } from 'react';
import { format, isFuture, isToday, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

interface JournalCalendarProps {
  entryDates: string[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function JournalCalendar({ entryDates, selectedDate, onDateSelect }: JournalCalendarProps) {
  const [month, setMonth] = useState<Date>(selectedDate);

  // Convert string dates to Date objects for matching
  const entryDateSet = useMemo(() => {
    return new Set(entryDates.map(d => d)); // Keep as strings for easy lookup
  }, [entryDates]);

  // Custom modifier for dates with entries
  const modifiers = useMemo(() => ({
    hasEntry: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return entryDateSet.has(dateStr);
    },
    future: (date: Date) => isFuture(date) && !isToday(date),
  }), [entryDateSet]);

  const modifiersStyles = {
    hasEntry: {
      backgroundColor: 'hsl(var(--primary) / 0.15)',
      fontWeight: '600',
    },
    future: {
      opacity: 0.4,
      pointerEvents: 'none' as const,
    },
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    // Prevent future dates
    if (isFuture(date) && !isToday(date)) return;
    onDateSelect(date);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-serif">Journal Calendar</CardTitle>
        </div>
        <CardDescription>
          View your past entries. Dates with entries are highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          disabled={(date) => isFuture(date) && !isToday(date)}
          className="rounded-md border pointer-events-auto"
        />
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/15 border border-primary/30" />
            <span>Has entries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary border border-primary" />
            <span>Selected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
