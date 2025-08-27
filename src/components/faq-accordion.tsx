
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MarkdownRenderer } from "./markdown-renderer";
import { HelpCircle } from "lucide-react";
import type { FaqItem as FaqItemType } from "@/lib/types";

interface FaqAccordionProps {
  items: FaqItemType[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {items.map((faq, index) => (
        <AccordionItem
          key={faq.$id || index}
          value={`item-${index + 1}`}
          className="border-b-0 rounded-lg bg-card/80 transition-all hover:bg-card"
        >
          <AccordionTrigger className="text-left text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-4">
              <HelpCircle className="h-6 w-6 text-primary" />
              <span>{faq.question}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-base leading-relaxed px-6">
            <div className="prose prose-sm prose-invert max-w-none">
              <MarkdownRenderer content={faq.answer} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
