import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Sparkles } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentClass?: string; // e.g. "text-indigo-500"
  minBullets?: number;
}

// Stores bullets as a newline-joined string for backward-compat with text storage.
export function BulletInput({ value, onChange, placeholder, accentClass = 'text-primary', minBullets = 1 }: Props) {
  const bullets = useMemo(() => {
    const arr = (value || '').split('\n');
    while (arr.length < minBullets) arr.push('');
    return arr;
  }, [value, minBullets]);

  const filledCount = bullets.filter((b) => b.trim().length > 0).length;

  const update = (idx: number, v: string) => {
    const next = [...bullets];
    next[idx] = v;
    onChange(next.join('\n').replace(/\n+$/, ''));
  };

  const add = () => onChange([...bullets, ''].join('\n'));

  const remove = (idx: number) => {
    const next = bullets.filter((_, i) => i !== idx);
    onChange((next.length ? next : ['']).join('\n').replace(/\n+$/, ''));
  };

  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div
          key={i}
          className="group flex items-center gap-1.5 animate-fade-in"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <span
            className={`mt-0 text-base leading-none ${accentClass} ${b.trim() ? 'opacity-100' : 'opacity-40'}`}
          >
            •
          </span>
          <Input
            value={b}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder || 'Add a point...'}
            className="h-8 text-sm bg-card/70 border-border/40 focus-visible:ring-1"
          />
          {bullets.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove bullet"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={add}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
        {filledCount > 0 && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${accentClass} animate-fade-in`}>
            {filledCount >= 3 && <Sparkles className="h-3 w-3" />}
            +{filledCount * 10} XP
          </span>
        )}
      </div>
    </div>
  );
}
