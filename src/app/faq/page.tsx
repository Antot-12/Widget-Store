
"use client";

import { useState, useMemo, useEffect } from "react";
import { FaqAccordion } from "@/components/faq-accordion";
import { Input } from "@/components/ui/input";
import { Search, X as ClearIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFaqs } from "../actions";
import type { FaqItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
        setIsLoading(true);
        const fetchedFaqs = await getFaqs();
        setFaqs(fetchedFaqs);
        setIsLoading(false);
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return faqs;
    }
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, faqs]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions? We've got answers. If you can't find what you're
            looking for, feel free to contact us.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-base rounded-full bg-card border-primary/20 focus:ring-primary"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
              onClick={clearSearch}
            >
              <ClearIcon className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {isLoading ? (
            <div className="space-y-2">
                {Array.from({length: 5}).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        ) : filteredFaqs.length > 0 ? (
          <FaqAccordion items={filteredFaqs} />
        ) : (
          <div className="text-center py-10 bg-card/50 rounded-lg">
            <p className="text-lg text-muted-foreground">No questions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
