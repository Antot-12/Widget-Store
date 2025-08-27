
'use client';

import { useState, useEffect, use } from 'react';
import { ALL_WIDGETS } from '@/app/data';
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/components/tag-badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Rocket, Star, Newspaper, CheckCircle, Info, FileBox, Languages, ShieldCheck, UserCircle, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CommentsSection } from '@/components/comments-section';
import type { Comment } from '@/lib/types';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export default function WidgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isInstalled, setIsInstalled] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const widget = ALL_WIDGETS.find(w => w.id === id);

  useEffect(() => {
    if (widget) {
      const installedState = localStorage.getItem(`widget-${widget.id}-installed`) === 'true';
      setIsInstalled(installedState);
    }
  }, [widget]);

  const handleInstallToggle = () => {
    if (widget) {
      const newInstalledState = !isInstalled;
      setIsInstalled(newInstalledState);
      localStorage.setItem(`widget-${widget.id}-installed`, String(newInstalledState));
    }
  };

  const averageRating = comments.length > 0
    ? comments.reduce((acc, comment) => acc + comment.rating, 0) / comments.length
    : 0;
    
  const ratingStars = Array.from({ length: 5 }, (_, i) => {
    const fill = i < Math.round(averageRating);
    return (
      <Star
        key={i}
        className={`w-5 h-5 ${fill ? 'text-amber-400 fill-amber-400' : 'text-amber-400/50'}`}
      />
    );
  });
  
  const infoItems = widget?.moreInfo ? Object.fromEntries(
    widget.moreInfo
      .trim()
      .split('\n')
      .slice(2) // Skip header and separator
      .map(line => {
        const parts = line.split('|').map(s => s.trim()).filter(Boolean);
        if (parts.length < 2) return [];
        return [parts[0].replace(/\*\*/g, ''), parts[1]]; // Key, Value
      }).filter(p => p.length > 0)
  ) : {};


  if (!widget) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Widget not found</h1>
        <Link href="/">
          <Button variant="link" className="mt-4">Go back to home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      <div className="mb-4">
        <Button asChild variant="ghost" className="pl-2 pr-4 h-11 text-base transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95">
          <Link href="/" className="inline-flex items-center gap-2 text-primary">
            <ArrowLeft className="w-5 h-5" />
            Back to widgets
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-8 lg:gap-12">
        <div>
          <div className="aspect-video relative overflow-hidden rounded-lg mb-4 shadow-lg">
            <Image 
              src={widget.imageUrl} 
              alt={widget.name}
              fill
              className="object-cover"
              data-ai-hint={widget.imageHint}
            />
          </div>
        </div>

        <div>
           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className='mb-4 sm:mb-0'>
              <h1 className="text-3xl md:text-4xl font-bold font-headline">{widget.name}</h1>
              <TagBadge variant="secondary" className="text-sm mt-2 inline-block">{widget.category}</TagBadge>
            </div>
            <Button onClick={handleInstallToggle} size="lg" className="font-bold min-w-[120px] w-full sm:w-auto">
              <Rocket className="mr-2 h-4 w-4" />
              {isInstalled ? "Open" : "Install"}
            </Button>
          </div>

          <p className="text-muted-foreground text-lg mb-6">{widget.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {widget.tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          
          <div className="space-y-8">
            {widget.keyFeatures && widget.keyFeatures.length > 0 && (
                <>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 flex items-center gap-3">
                            <CheckCircle className="text-primary w-6 h-6" />
                            Key Features
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground columns-1 md:columns-2">
                            {widget.keyFeatures.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                    <Separator />
                </>
            )}

            {widget.whatsNew && (
                 <>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 flex items-center gap-3">
                            <Newspaper className="text-primary w-6 h-6" />
                            What's New
                        </h2>
                        <div className="bg-card p-4 rounded-lg prose prose-sm prose-invert max-w-none text-muted-foreground">
                            <MarkdownRenderer content={widget.whatsNew} />
                        </div>
                    </div>
                    <Separator />
                </>
            )}
            
            {widget.moreInfo && Object.keys(infoItems).length > 0 && (
                <>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 flex items-center gap-3">
                            <Info className="text-primary w-6 h-6" />
                            More Information
                        </h2>
                        <div className="bg-card p-4 rounded-lg text-foreground grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {infoItems['Version'] && <div className="flex items-center gap-3"><FileBox className="w-5 h-5 text-primary" /><div><span className="font-bold text-foreground">Version:</span> <span className="text-muted-foreground">{infoItems['Version']}</span></div></div>}
                            {infoItems['Languages'] && <div className="flex items-center gap-3"><Languages className="w-5 h-5 text-primary" /><div><span className="font-bold text-foreground">Languages:</span> <span className="text-muted-foreground">{infoItems['Languages']}</span></div></div>}
                            {infoItems['Permissions'] && <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-primary" /><div><span className="font-bold text-foreground">Permissions:</span> <span className="text-muted-foreground"><MarkdownRenderer content={infoItems['Permissions']} /></span></div></div>}
                            {infoItems['Developer'] && <div className="flex items-center gap-3"><UserCircle className="w-5 h-5 text-primary" /><div><span className="font-bold text-foreground">Developer:</span> <span className="text-muted-foreground">{infoItems['Developer']}</span></div></div>}
                            {infoItems['Website'] && <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-primary" /><div><span className="font-bold text-foreground">Website:</span> <span className="text-muted-foreground"><MarkdownRenderer content={infoItems['Website']} /></span></div></div>}
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            <div>
              <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 flex items-center gap-3">
                <Star className="text-primary w-6 h-6" />
                User Reviews
              </h2>
               <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {ratingStars}
                  </div>
                  {comments.length > 0 ? (
                     <p className="text-sm text-muted-foreground">{averageRating.toFixed(1)} stars from {comments.length} review{comments.length > 1 ? 's' : ''}</p>
                  ) : (
                     <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  )}
              </div>
              <CommentsSection widgetId={widget.id} onCommentsLoaded={setComments} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
