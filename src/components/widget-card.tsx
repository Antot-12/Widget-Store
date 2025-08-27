
"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import type { Widget } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "./tag-badge";

type WidgetCardProps = {
  widget: Widget;
};

export function WidgetCard({ widget }: WidgetCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if ('id' in widget) {
      router.push(`/widget/${widget.id}`);
    }
  };

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('id' in widget) {
      router.push(`/widget/${widget.id}`);
    }
  };

  const cardWrapperClass = "block h-full overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/30 hover:shadow-2xl border border-transparent hover:border-primary/30 rounded-lg";
  const isClickable = 'id' in widget;


  return (
     <Card 
      className={`${cardWrapperClass} bg-card h-full flex flex-col ${isClickable ? 'cursor-pointer' : ''} animate-fade-in`}
      onClick={isClickable ? handleCardClick : undefined}
    >
      {'imageUrl' in widget && (
        <div className="aspect-video overflow-hidden relative">
          <Image
            src={widget.imageUrl}
            alt={widget.name}
            fill
            className="object-cover"
            data-ai-hint={'imageHint' in widget ? widget.imageHint : ''}
          />
           {'category' in widget && <Badge variant="secondary" className="absolute top-2 right-2 bg-black/50 text-white backdrop-blur-sm text-xs">{widget.category}</Badge>}
        </div>
      )}
      <CardHeader className="p-4">
        <CardTitle className="text-md md:text-lg font-headline">{widget.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <CardDescription className="text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-4">
          {widget.description}
        </CardDescription>
        {'tags' in widget && widget.tags && (
          <div className="flex flex-wrap gap-2" onClick={handleTagClick}>
            {widget.tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button size="sm" className="w-full font-bold" onClick={handleOpenClick}>
          <Rocket className="mr-2 h-4 w-4" />
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
