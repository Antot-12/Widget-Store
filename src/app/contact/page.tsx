
"use client";

import { useState, useEffect } from 'react';
import { ContactForm } from '@/components/contact-form';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, Twitter, Github, Linkedin, Globe } from 'lucide-react';
import Link from 'next/link';
import { getSiteSettings } from '../actions';
import type { SiteSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const fetchedSettings = await getSiteSettings();
      setSettings(fetchedSettings);
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We’d love to hear from you. Whether you have a question, feedback, or just want to say hello, feel free to reach out.
            </p>
        </div>

        <div className="flex flex-col items-center gap-10 md:gap-12">
            <div className="space-y-8 w-full max-w-lg">
                <div>
                    <h2 className="text-2xl font-bold font-headline mb-4 text-center">Contact Information</h2>
                    <p className="text-muted-foreground mb-6 text-center">
                        Fill up the form and our team will get back to you within 24 hours.
                    </p>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-3/4 mx-auto" />
                            <Skeleton className="h-6 w-full mx-auto" />
                            <Skeleton className="h-6 w-1/2 mx-auto" />
                        </div>
                    ) : settings ? (
                        <div className="space-y-4 text-base md:text-lg">
                            {settings.email && (
                                <a href={`mailto:${settings.email}`} className="flex items-center gap-4 hover:text-primary transition-colors justify-center">
                                    <Mail className="w-6 h-6 text-primary" />
                                    <span>{settings.email}</span>
                                </a>
                            )}
                            {settings.address && (
                                <p className="flex items-center gap-4 justify-center">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    <span>{settings.address}</span>
                                </p>
                            )}
                            {settings.phone && (
                                <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="flex items-center gap-4 hover:text-primary transition-colors justify-center">
                                    <Phone className="w-6 h-6 text-primary" />
                                    <span>{settings.phone}</span>
                                </a>
                            )}
                        </div>
                    ) : (
                         <p className="text-center text-muted-foreground">Contact information could not be loaded.</p>
                    )}
                </div>

                <div className="pt-6 border-t border-border">
                     <h2 className="text-2xl font-bold font-headline mb-4 text-center">Follow Us</h2>
                     <div className="flex justify-center gap-4">
                        {isLoading ? (
                           <>
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <Skeleton className="h-12 w-12 rounded-full" />
                            </>
                        ) : settings ? (
                            <>
                                {settings.website && (
                                    <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                                        <Link href={settings.website} target="_blank"><Globe className="h-6 w-6 text-primary" /></Link>
                                    </Button>
                                )}
                                {settings.facebook && (
                                    <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                                        <Link href={settings.facebook} target="_blank">
                                            <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                                        </Link>
                                    </Button>
                                )}
                                {settings.twitter && (
                                    <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                                        <Link href={settings.twitter} target="_blank"><Twitter className="h-6 w-6 text-primary" /></Link>
                                    </Button>
                                )}
                                {settings.github && (
                                    <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                                        <Link href={settings.github} target="_blank"><Github className="h-6 w-6 text-primary" /></Link>
                                    </Button>
                                )}
                                {settings.linkedin && (
                                    <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
                                        <Link href={settings.linkedin} target="_blank"><Linkedin className="h-6 w-6 text-primary" /></Link>
                                    </Button>
                                )}
                            </>
                        ) : (
                             <p className="text-center text-muted-foreground text-sm">Social links could not be loaded.</p>
                        )}
                     </div>
                </div>
            </div>

            <div className="w-full max-w-lg">
                <ContactForm />
            </div>
        </div>
      </div>
    </div>
  );
}
