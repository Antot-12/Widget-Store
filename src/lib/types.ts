
import type { Models } from "appwrite";

export interface Widget {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imageHint: string;
  tags: string[];
  keyFeatures: string[];
  whatsNew: string;
  moreInfo: string;
}

export interface WidgetOfTheDay {
    widget: Widget;
    reason: string;
}

export interface Comment extends Models.Document {
    widgetId: string;
    author: string;
    text: string;
    rating: number;
}

export interface SiteSettings extends Models.Document {
    email: string;
    address: string;
    phone: string;
    website: string;
    facebook: string;
    twitter: string;
    github: string;
    linkedin: string;
}

export interface FaqItem extends Models.Document {
  question: string;
  answer: string;
}

export interface CategoryItem extends Models.Document {
  name: string;
}
