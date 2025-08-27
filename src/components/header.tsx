
"use client";

import Link from "next/link";
import { useState } from "react";
import { SpekulusLogo } from "@/components/spekulus-logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, HelpCircle, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="bg-[#001A37] py-4 px-4 sticky top-0 z-50 shadow-lg border-b border-primary/20">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-4 group">
          <SpekulusLogo className="h-8 w-8 text-primary group-hover:rotate-90 transition-transform duration-300" />
          <div>
            <h1 className="text-2xl font-bold text-white font-headline">
              Spekulus
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">widget store</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-white" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#001A37] border-primary/20 p-0">
               <SheetHeader className="p-4 border-b border-primary/20">
                 <SheetTitle>
                    <Link href="/" className="flex items-center gap-4 group" onClick={() => setIsSheetOpen(false)}>
                        <SpekulusLogo className="h-8 w-8 text-primary group-hover:rotate-90 transition-transform duration-300" />
                        <div>
                            <h1 className="text-2xl font-bold text-white font-headline text-left">
                            Spekulus
                            </h1>
                            <p className="text-xs text-muted-foreground -mt-1 text-left">widget store</p>
                        </div>
                    </Link>
                 </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg p-3 text-lg font-medium text-white hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
