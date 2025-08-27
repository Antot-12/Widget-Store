
"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import type { WidgetOfTheDay } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Sparkles } from "lucide-react";

type WidgetOfTheDayCardProps = {
  data: WidgetOfTheDay;
};

export function WidgetOfTheDayCard({ data }: WidgetOfTheDayCardProps) {
  const router = useRouter();
  const { widget, reason } = data;

  const handleCardClick = () => {
    router.push(`/widget/${widget.id}`);
  };
  
  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/widget/${widget.id}`);
  };

  return (
     <Card 
      className="block h-full overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 shadow-xl hover:shadow-cyan-500/30 hover:shadow-2xl border border-transparent hover:border-primary/30 rounded-lg bg-card cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="grid grid-cols-1 gap-0">
        <div className="aspect-video overflow-hidden relative">
          <Image
            src={widget.imageUrl}
            alt={widget.name}
            fill
            className="object-cover"
            data-ai-hint={widget.imageHint}
          />
        </div>
        <div className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl font-headline">{widget.name}</CardTitle>
                <CardDescription className="text-sm">{widget.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                 <div className="mt-2 text-sm bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-primary">Why it's our pick:</h4>
                        <p className="text-primary/90">{reason}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full md:w-auto font-bold ml-auto" onClick={handleOpenClick}>
                <Rocket className="mr-2 h-4 w-4" />
                Open
                </Button>
            </CardFooter>
        </div>
      </div>
    </Card>
  );
}
