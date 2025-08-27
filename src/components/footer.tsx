
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { SpekulusLogo } from "./spekulus-logo";
import { getSiteSettings } from "@/app/actions";
import type { SiteSettings } from "@/lib/types";

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const fetchedSettings = await getSiteSettings();
      setSettings(fetchedSettings);
    };
    fetchSettings();
  }, []);

  const hasSocials = settings && (settings.website || settings.facebook || settings.twitter || settings.github || settings.linkedin);

  return (
    <footer className="bg-[#001A37] border-t border-primary/20 mt-auto py-6 md:py-8 px-4">
      <div className="container mx-auto text-center text-muted-foreground">
        <a href="https://spekulus.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-4 mb-4 text-white hover:text-primary transition-colors group">
          <SpekulusLogo className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" />
          <h2 className="text-2xl font-bold font-headline">Spekulus</h2>
        </a>
        <p className="mb-4 text-sm md:text-base">Your one-stop shop for powerful and beautiful widgets.</p>
        <div className="flex justify-center gap-4 md:gap-6 mb-4">
          <Link href="/" className="hover:text-primary transition-colors text-sm">Home</Link>
          <Link href="/faq" className="hover:text-primary transition-colors text-sm">FAQ</Link>
          <Link href="/contact" className="hover:text-primary transition-colors text-sm">Contact</Link>
          <Link href="/admin" className="hover:text-primary transition-colors text-sm">Admin</Link>
        </div>
         {hasSocials && (
           <div className="flex justify-center gap-4 md:gap-6 mb-4">
             
             
             {settings?.twitter && <Link href={settings.twitter} className="hover:text-primary transition-colors text-sm">Twitter</Link>}
             
             
           </div>
         )}
        <p className="text-xs md:text-sm">&copy; {new Date().getFullYear()} Spekulus Widget Store. All Rights Reserved.</p>
      </div>
    </footer>
  )
}
