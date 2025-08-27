

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WidgetCard } from "@/components/widget-card";
import type { Widget, WidgetOfTheDay, CategoryItem } from "@/lib/types";
import { getWidgetOfTheDay, getCategories } from "@/app/actions";
import { Search, X as ClearIcon, Star, CalendarHeart, Dices } from "lucide-react";
import { ALL_WIDGETS } from "@/app/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { WidgetOfTheDayCard } from "@/components/widget-of-the-day-card";
import { Skeleton } from "@/components/ui/skeleton";


function HomePageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState("All");
  const [widgetOfTheDay, setWidgetOfTheDay] = useState<WidgetOfTheDay | null>(null);
  const [isWotdLoading, setIsWotdLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    async function fetchWotd() {
      setIsWotdLoading(true);
      try {
        const wotd = await getWidgetOfTheDay();
        setWidgetOfTheDay(wotd);
      } catch (error) {
        console.error(error);
        setWidgetOfTheDay(null);
      } finally {
        setIsWotdLoading(false);
      }
    }
    async function fetchCategories() {
        setIsLoadingCategories(true);
        try {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingCategories(false);
        }
    }
    fetchWotd();
    fetchCategories();
  }, []);

  const categoryNames = useMemo(() => ["All", ...categories.map(c => c.name)], [categories]);

  const featuredWidgets = useMemo(() => {
    const featuredIds = ['1', '5', '8', '11'];
    return ALL_WIDGETS.filter(w => featuredIds.includes(w.id));
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ALL_WIDGETS.forEach(widget => {
      widget.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      // Check against dynamic category names
      const matchingCategory = categoryNames.find(c => c.toLowerCase() === initialSearch.toLowerCase());
      if (matchingCategory) {
        setActiveCategory(matchingCategory);
      } else {
        setActiveCategory("All");
      }
    }
  }, [initialSearch, categoryNames]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery("");
  };

  const handleRandomSearch = () => {
    if (allTags.length > 0) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      setSearchQuery(randomTag);
      setActiveCategory("All");
    }
  };

  const filteredWidgets = useMemo(() => {
    let widgets = ALL_WIDGETS;

    if (activeCategory !== "All") {
      widgets = widgets.filter(widget => widget.category === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      widgets = widgets.filter(widget => 
        widget.name.toLowerCase().includes(lowerCaseQuery) || 
        widget.description.toLowerCase().includes(lowerCaseQuery) ||
        (widget.tags && widget.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
      );
    }
    
    return widgets;
  }, [activeCategory, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const isSearching = searchQuery.trim() !== '';


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg">
        <div className="relative">
           <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-primary" onClick={handleRandomSearch}>
              <Search className="h-5 w-5" />
            </Button>
          <Input
            type="text"
            placeholder="Search all widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card text-foreground placeholder:text-muted-foreground text-base focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:ring-offset-background pl-10 pr-24"
          />
           <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            {searchQuery && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={clearSearch}>
                <ClearIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
             <Button
              onClick={handleRandomSearch}
              variant="outline"
              className="h-8 px-3 ml-1 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Dices className="h-4 w-4 mr-2" />
              Random
            </Button>
          </div>
        </div>
      </div>
      
      {isSearching ? (
        <section>
          <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-3">
            Search Results
          </h3>
          {filteredWidgets.length > 0 ? (
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWidgets.map((widget) => (
                  <WidgetCard key={widget.id} widget={widget} />
                ))}
            </div>
          ) : (
             <div className="text-center py-10 bg-card/50 rounded-lg">
                <p className="text-lg text-muted-foreground">No widgets found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search or category.</p>
              </div>
          )}
           <hr className="my-10 border-border/50"/>
        </section>
      ) : null}


      <section className="mb-10">
        <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-3">
          <CalendarHeart className="text-primary w-6 h-6" />
          Widget of the Day
        </h3>
        {isWotdLoading ? (
           <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
        ) : widgetOfTheDay ? (
          <WidgetOfTheDayCard data={widgetOfTheDay} />
        ) : (
          <div className="text-center py-10 bg-card rounded-lg">
            <p className="text-muted-foreground">Could not load Widget of the Day. <br /> The AI model may be offline or experiencing issues.</p>
          </div>
        )}
      </section>

       <div className="flex justify-center mb-10">
        <Select value={activeCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[240px] bg-card text-foreground border-primary/50">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingCategories ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
                categoryNames.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
      </div>

      <section className="mb-10">
        <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-3">
          <Star className="text-amber-400 w-6 h-6" />
          Featured Widgets
        </h3>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {featuredWidgets.map((widget) => (
              <CarouselItem key={widget.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                 <div className="p-1 h-full">
                  <WidgetCard widget={widget} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>
      
      {!isSearching && (
        <>
          <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-3">
            {activeCategory === "All" && !searchQuery ? "All Widgets" : "Filtered Results"}
          </h3>

          {filteredWidgets.length > 0 ? (
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWidgets.map((widget) => (
                  <WidgetCard key={widget.id} widget={widget} />
                ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card/50 rounded-lg">
                <p className="text-lg text-muted-foreground">No widgets found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different filter.</p>
              </div>
          )}
        </>
      )}

    </div>
  );
}


export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </React.Suspense>
  );
}
