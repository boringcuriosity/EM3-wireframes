import { cn } from '@/lib/utils';
import goodflipLogo from '@/assets/goodflip-logo.webp';

interface GoodFlipLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function GoodFlipLogo({ className, size = 'md', showText = true }: GoodFlipLogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img src={goodflipLogo} alt="GoodFlip" width={icon} height={icon} className="object-contain" />
      {showText && (
        <span className={cn('font-bold tracking-tight', text)} style={{ color: '#0D8C7F' }}>
          GoodFlip
        </span>
      )}
    </div>
  );
}
