
'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';

interface TagBadgeProps extends BadgeProps {
  tag: string;
}

export function TagBadge({ tag, ...props }: TagBadgeProps) {
  return (
    <Link key={tag} href={`/?search=${encodeURIComponent(tag)}`} passHref>
      <Badge
        variant="secondary"
        className="text-xs px-2 py-1 md:text-sm md:px-4 md:py-2 cursor-pointer transition-all duration-200 ease-in-out hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-105 active:scale-95"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.target as HTMLElement).click();
          }
        }}
        {...props}
      >
        {tag}
      </Badge>
    </Link>
  );
}
