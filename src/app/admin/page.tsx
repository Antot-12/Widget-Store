

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, LogIn, LayoutDashboard, Settings, PlusCircle, Trash2, Pencil, BarChart, Shapes, Users, MessageSquare, Star, Settings2, HelpCircle, ArrowUpDown, Search } from 'lucide-react';
import { ALL_WIDGETS } from '../data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Widget, Comment, SiteSettings, FaqItem, CategoryItem } from '@/lib/types';
import { databases } from '@/lib/appwrite';
import { Skeleton } from '@/components/ui/skeleton';
import { getSiteSettings, updateSiteSettings, createSiteSettings, getFaqs, createFaq, updateFaq, deleteFaq, getCategories, createCategory, updateCategory, deleteCategory } from '../actions';
import { Separator } from '@/components/ui/separator';

type SortDescriptor<T> = {
  column: keyof T;
  direction: 'ascending' | 'descending';
};


export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>(ALL_WIDGETS);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // FAQ State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<Partial<FaqItem> | null>(null);

  // Category State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<CategoryItem> | null>(null);
  
  // Edit Widget State
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const [currentWidget, setCurrentWidget] = useState<Widget | null>(null);

  // Filtering and Sorting State
  const [widgetFilter, setWidgetFilter] = useState('');
  const [commentFilter, setCommentFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [faqFilter, setFaqFilter] = useState('');

  const [widgetSort, setWidgetSort] = useState<SortDescriptor<Widget>>({ column: 'name', direction: 'ascending' });
  const [commentSort, setCommentSort] = useState<SortDescriptor<Comment>>({ column: 'author', direction: 'ascending' });
  const [categorySort, setCategorySort] = useState<SortDescriptor<CategoryItem>>({ column: 'name', direction: 'ascending' });
  const [faqSort, setFaqSort] = useState<SortDescriptor<FaqItem>>({ column: 'question', direction: 'ascending' });


  const WIDGETS_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const COMMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!;

  const fetchAllComments = async () => {
    setIsLoadingComments(true);
    try {
      if (!WIDGETS_DB_ID || !COMMENTS_COLLECTION_ID) {
        throw new Error("Appwrite environment variables are not loaded");
      }
      const response = await databases.listDocuments(
        WIDGETS_DB_ID,
        COMMENTS_COLLECTION_ID
      );
      const fetchedComments = response.documents as unknown as Comment[];
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast({
        title: 'Error',
        description: 'Could not load comments from Appwrite.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const settings = await getSiteSettings();
      setSiteSettings(settings);
    } catch (error) {
      console.error("Error fetching site settings from action:", error);
      toast({
          title: 'Error loading settings',
          description: 'Could not fetch site settings from Appwrite.',
          variant: 'destructive'
      });
    } finally {
      setIsLoadingSettings(false);
    }
  }

  const fetchFaqs = async () => {
    setIsLoadingFaqs(true);
    try {
        const fetchedFaqs = await getFaqs();
        setFaqs(fetchedFaqs);
    } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        toast({
            title: 'Error',
            description: 'Could not load FAQs from the database.',
            variant: 'destructive',
        });
    } finally {
        setIsLoadingFaqs(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
            title: 'Error',
            description: 'Could not load categories from the database.',
            variant: 'destructive',
        });
    } finally {
        setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllComments();
      fetchSettings();
      fetchFaqs();
      fetchCategories();
    }
  }, [isLoggedIn]);

  // Generic sort handler
  const createSortHandler = <T,>(
    setSort: React.Dispatch<React.SetStateAction<SortDescriptor<T>>>,
    currentSort: SortDescriptor<T>
  ) => (column: keyof T) => {
    const isAsc = currentSort.column === column && currentSort.direction === 'ascending';
    setSort({ column, direction: isAsc ? 'descending' : 'ascending' });
  };
  
  const handleWidgetSort = createSortHandler(setWidgetSort, widgetSort);
  const handleCommentSort = createSortHandler(setCommentSort, commentSort);
  const handleCategorySort = createSortHandler(setCategorySort, categorySort);
  const handleFaqSort = createSortHandler(setFaqSort, faqSort);

  const filteredAndSortedWidgets = useMemo(() => {
    return widgets
      .filter(widget => 
        widget.name.toLowerCase().includes(widgetFilter.toLowerCase()) || 
        widget.category.toLowerCase().includes(widgetFilter.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[widgetSort.column] as string | number;
        const bValue = b[widgetSort.column] as string | number;
        if (aValue < bValue) return widgetSort.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return widgetSort.direction === 'ascending' ? 1 : -1;
        return 0;
      });
  }, [widgets, widgetFilter, widgetSort]);
  
  const filteredAndSortedComments = useMemo(() => {
    const widgetMap = new Map(widgets.map(w => [w.id, w.name]));
    return comments
        .filter(comment => {
            const widgetName = widgetMap.get(comment.widgetId) || '';
            return comment.author.toLowerCase().includes(commentFilter.toLowerCase()) ||
                   comment.text.toLowerCase().includes(commentFilter.toLowerCase()) ||
                   widgetName.toLowerCase().includes(commentFilter.toLowerCase());
        })
        .sort((a, b) => {
            const aValue = a[commentSort.column] as string | number;
            const bValue = b[commentSort.column] as string | number;
            if (aValue < bValue) return commentSort.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return commentSort.direction === 'ascending' ? 1 : -1;
            return 0;
        });
  }, [comments, commentFilter, commentSort, widgets]);

  const filteredAndSortedCategories = useMemo(() => {
    return categories
      .filter(category => category.name.toLowerCase().includes(categoryFilter.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[categorySort.column] as string | number;
        const bValue = b[categorySort.column] as string | number;
        if (aValue < bValue) return categorySort.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return categorySort.direction === 'ascending' ? 1 : -1;
        return 0;
      });
  }, [categories, categoryFilter, categorySort]);

  const filteredAndSortedFaqs = useMemo(() => {
    return faqs
      .filter(faq => 
        faq.question.toLowerCase().includes(faqFilter.toLowerCase()) || 
        faq.answer.toLowerCase().includes(faqFilter.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[faqSort.column] as string;
        const bValue = b[faqSort.column] as string;
        if (aValue < bValue) return faqSort.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return faqSort.direction === 'ascending' ? 1 : -1;
        return 0;
      });
  }, [faqs, faqFilter, faqSort]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome, admin!',
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password.',
        variant: 'destructive',
      });
    }
  };

  const handleWidgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newWidgetData = Object.fromEntries(formData.entries());
    
    const newWidget: Widget = {
      id: String(widgets.length + 1),
      name: newWidgetData.name as string,
      description: newWidgetData.description as string,
      category: newWidgetData.category as string,
      tags: (newWidgetData.tags as string).split(',').map(tag => tag.trim()),
      imageUrl: `https://picsum.photos/400/225?random=${widgets.length + 1}`,
      imageHint: newWidgetData.imageHint as string,
      keyFeatures: (newWidgetData.keyFeatures as string).split(',').map(f => f.trim()),
      whatsNew: newWidgetData.whatsNew as string,
      moreInfo: newWidgetData.moreInfo as string,
    };

    setWidgets(prev => [...prev, newWidget]);

    toast({
        title: 'Widget Submitted!',
        description: `${newWidget.name} has been added to the store.`,
    });
    (e.target as HTMLFormElement).reset();
    setActiveTab("manage");
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    toast({
      title: 'Widget Deleted',
      description: 'The widget has been removed from the store.',
    });
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await databases.deleteDocument(WIDGETS_DB_ID, COMMENTS_COLLECTION_ID, commentId);
      setComments(prev => prev.filter(c => c.$id !== commentId));
      toast({
        title: 'Comment Deleted',
        description: 'The comment has been removed.',
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the comment.',
        variant: 'destructive',
      });
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const newSettingsData = {
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        website: formData.get('website') as string,
        facebook: formData.get('facebook') as string,
        twitter: formData.get('twitter') as string,
        github: formData.get('github') as string,
        linkedin: formData.get('linkedin') as string,
    };

    let result;
    if (siteSettings?.$id) {
        result = await updateSiteSettings({ documentId: siteSettings.$id, ...newSettingsData });
    } else {
        result = await createSiteSettings(newSettingsData);
    }

    if (result.success) {
        toast({
            title: 'Settings Saved!',
            description: 'Your contact and social information has been updated.',
        });
        fetchSettings(); 
    } else {
        toast({
            title: 'Error',
            description: 'Failed to save settings to the database.',
            variant: 'destructive'
        })
    }
  };

  const handleFaqFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const faqData = {
        question: formData.get('question') as string,
        answer: formData.get('answer') as string,
    };

    if (!faqData.question || !faqData.answer) {
        toast({ title: 'Error', description: 'Question and answer cannot be empty.', variant: 'destructive' });
        return;
    }

    let result;
    if (currentFaq?.$id) {
        // Update existing FAQ
        result = await updateFaq({ documentId: currentFaq.$id, ...faqData });
    } else {
        // Create new FAQ
        result = await createFaq(faqData);
    }

    if (result.success && result.document) {
        toast({
            title: `FAQ ${currentFaq?.$id ? 'Updated' : 'Created'}!`,
            description: 'The FAQ has been saved to the database.',
        });
        fetchFaqs();
        setIsFaqDialogOpen(false);
        setCurrentFaq(null);
    } else {
        toast({
            title: 'Error',
            description: 'Failed to save the FAQ.',
            variant: 'destructive',
        });
    }
};

const handleOpenFaqDialog = (faq: Partial<FaqItem> | null = null) => {
    setCurrentFaq(faq);
    setIsFaqDialogOpen(true);
};

const handleDeleteFaq = async (faqId: string) => {
    const result = await deleteFaq(faqId);
    if (result.success) {
        toast({
            title: 'FAQ Deleted',
            description: 'The FAQ has been removed from the database.',
        });
        setFaqs(prev => prev.filter(f => f.$id !== faqId));
    } else {
        toast({
            title: 'Error',
            description: 'Failed to delete the FAQ.',
            variant: 'destructive',
        });
    }
};

// --- Category Handlers ---
const handleCategoryFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const categoryData = {
        name: formData.get('name') as string,
    };

    if (!categoryData.name) {
        toast({ title: 'Error', description: 'Category name cannot be empty.', variant: 'destructive' });
        return;
    }

    let result;
    if (currentCategory?.$id) {
        // Update existing Category
        result = await updateCategory({ documentId: currentCategory.$id, ...categoryData });
    } else {
        // Create new Category
        result = await createCategory(categoryData);
    }

    if (result.success && result.document) {
        toast({
            title: `Category ${currentCategory?.$id ? 'Updated' : 'Created'}!`,
            description: 'The category has been saved to the database.',
        });
        fetchCategories();
        setIsCategoryDialogOpen(false);
        setCurrentCategory(null);
    } else {
        toast({
            title: 'Error',
            description: 'Failed to save the category.',
            variant: 'destructive',
        });
    }
};

const handleOpenCategoryDialog = (category: Partial<CategoryItem> | null = null) => {
    setCurrentCategory(category);
    setIsCategoryDialogOpen(true);
};

const handleDeleteCategory = async (categoryId: string) => {
    const result = await deleteCategory(categoryId);
    if (result.success) {
        toast({
            title: 'Category Deleted',
            description: 'The category has been removed from the database.',
        });
        setCategories(prev => prev.filter(f => f.$id !== categoryId));
    } else {
        toast({
            title: 'Error',
            description: 'Failed to delete the category.',
            variant: 'destructive',
        });
    }
};

const handleWidgetUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedData = Object.fromEntries(formData.entries());

    if (!currentWidget) return;

    const updatedWidget = {
      ...currentWidget,
      name: updatedData.name as string,
      description: updatedData.description as string,
      category: updatedData.category as string,
      keyFeatures: (updatedData.keyFeatures as string).split(',').map(f => f.trim()),
      whatsNew: updatedData.whatsNew as string,
      moreInfo: updatedData.moreInfo as string,
    };

    setWidgets(prev => prev.map(w => w.id === updatedWidget.id ? updatedWidget : w));

    toast({
        title: 'Widget Updated!',
        description: `${updatedWidget.name} has been updated.`,
    });
    setIsWidgetDialogOpen(false);
    setCurrentWidget(null);
};

const handleOpenWidgetDialog = (widget: Widget) => {
    setCurrentWidget(widget);
    setIsWidgetDialogOpen(true);
}


  if (!isLoggedIn) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the widget upload panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full font-bold">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalWidgets = widgets.length;
  const totalCategories = categories.length;
  const totalInstalls = 5480;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
       <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Admin Panel</h1>
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-7 mb-6">
            <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4"/>Dashboard</TabsTrigger>
            <TabsTrigger value="comments"><MessageSquare className="mr-2 h-4 w-4"/>Comments</TabsTrigger>
            <TabsTrigger value="categories"><Shapes className="mr-2 h-4 w-4"/>Categories</TabsTrigger>
            <TabsTrigger value="faq"><HelpCircle className="mr-2 h-4 w-4"/>FAQ</TabsTrigger>
            <TabsTrigger value="manage"><Settings className="mr-2 h-4 w-4"/>Widgets</TabsTrigger>
            <TabsTrigger value="add"><PlusCircle className="mr-2 h-4 w-4"/>Add New</TabsTrigger>
            <TabsTrigger value="settings"><Settings2 className="mr-2 h-4 w-4"/>Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Widgets</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalWidgets}</div>
                    <p className="text-xs text-muted-foreground">widgets currently in the store</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                    <Shapes className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoadingCategories ? <Skeleton className="h-8 w-12" /> : totalCategories}</div>
                    <p className="text-xs text-muted-foreground">unique widget categories</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalInstalls.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">across all widgets</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoadingComments ? <Skeleton className="h-8 w-12" /> : comments.length}</div>
                    <p className="text-xs text-muted-foreground">across all widgets</p>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Popular Widgets</CardTitle>
                    <CardDescription>The most installed widgets this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {widgets.slice(0,3).map((widget) => (
                            <div key={widget.id} className="flex items-center">
                                <Star className="h-5 w-5 text-amber-400 mr-4"/>
                                <div className="font-medium">{widget.name}</div>
                                <div className="ml-auto text-sm text-muted-foreground">
                                    {Math.floor(Math.random() * 500 + 200).toLocaleString()} installs
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comments">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Comments</CardTitle>
                    <CardDescription>View and delete user-submitted comments and ratings.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Filter by author, comment, or widget..."
                            value={commentFilter}
                            onChange={(e) => setCommentFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleCommentSort('author')}>
                                        Author <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleCommentSort('rating')}>
                                        Rating <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                     <Button variant="ghost" onClick={() => handleCommentSort('text')}>
                                        Comment <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                     <Button variant="ghost" onClick={() => handleCommentSort('widgetId')}>
                                        Widget <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingComments ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAndSortedComments.map((comment) => {
                                const widget = widgets.find(w => w.id === comment.widgetId);
                                return (
                                    <TableRow key={comment.$id}>
                                        <TableCell className="font-medium">{comment.author}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {comment.rating} <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">{comment.text}</TableCell>
                                        <TableCell>{widget?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete this comment. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteComment(comment.$id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="categories">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manage Categories</CardTitle>
                            <CardDescription>Add, edit, and delete widget categories for the store.</CardDescription>
                        </div>
                        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => handleOpenCategoryDialog(null)}><PlusCircle className="mr-2 h-4 w-4"/>Add New Category</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{currentCategory?.$id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                                    <DialogDescription>
                                        Enter the name for the category.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCategoryFormSubmit} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category-name">Category Name</Label>
                                        <Input id="category-name" name="name" defaultValue={currentCategory?.name || ''} required />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit">Save Category</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                         <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Filter by category name..."
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleCategorySort('name')}>
                                            Category Name <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleCategorySort('$createdAt')}>
                                            Date Created <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingCategories ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredAndSortedCategories.map((category) => (
                                    <TableRow key={category.$id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{new Date(category.$createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenCategoryDialog(category)}>
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete this category. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteCategory(category.$id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="faq">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manage FAQs</CardTitle>
                            <CardDescription>Create, edit, and delete Frequently Asked Questions.</CardDescription>
                        </div>
                         <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => handleOpenFaqDialog(null)}><PlusCircle className="mr-2 h-4 w-4"/>Add New FAQ</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{currentFaq?.$id ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below. The answer field supports Markdown.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleFaqFormSubmit} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="faq-question">Question</Label>
                                        <Input id="faq-question" name="question" defaultValue={currentFaq?.question || ''} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="faq-answer">Answer</Label>
                                        <Textarea id="faq-answer" name="answer" defaultValue={currentFaq?.answer || ''} required rows={6} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsFaqDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit">Save FAQ</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Filter by question or answer..."
                                value={faqFilter}
                                onChange={(e) => setFaqFilter(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleFaqSort('question')}>
                                            Question <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleFaqSort('answer')}>
                                            Answer (Excerpt) <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingFaqs ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredAndSortedFaqs.map((faq) => (
                                    <TableRow key={faq.$id}>
                                        <TableCell className="font-medium max-w-sm truncate">{faq.question}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-sm truncate">{faq.answer}</TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenFaqDialog(faq)}>
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete this FAQ. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteFaq(faq.$id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

          <TabsContent value="manage">
             <Card>
                <CardHeader className="flex justify-between items-center flex-row">
                    <div>
                        <CardTitle>Manage Widgets</CardTitle>
                        <CardDescription>View, edit, or delete existing widgets.</CardDescription>
                    </div>
                    <Button onClick={() => setActiveTab("add")}><PlusCircle className="mr-2"/>Add New</Button>
                </CardHeader>
                <CardContent>
                     <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Filter by name or category..."
                            value={widgetFilter}
                            onChange={(e) => setWidgetFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleWidgetSort('name')}>
                                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleWidgetSort('category')}>
                                        Category <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedWidgets.map((widget) => (
                                <TableRow key={widget.id}>
                                    <TableCell className="font-medium">{widget.name}</TableCell>
                                    <TableCell>{widget.category}</TableCell>
                                    <TableCell className="flex gap-2 justify-end">
                                       <Dialog open={isWidgetDialogOpen && currentWidget?.id === widget.id} onOpenChange={(isOpen) => {
                                            if (!isOpen) {
                                                setCurrentWidget(null);
                                            }
                                            setIsWidgetDialogOpen(isOpen);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenWidgetDialog(widget)}><Pencil className="h-4 w-4"/></Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>Edit: {currentWidget?.name}</DialogTitle>
                                                    <DialogDescription>Make changes to the widget details. Click save when you're done.</DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleWidgetUpdate} className="space-y-4 py-4">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-widget-name">Name</Label>
                                                        <Input id="edit-widget-name" name="name" defaultValue={currentWidget?.name} />
                                                    </div>
                                                     <div className="space-y-2">
                                                        <Label htmlFor="edit-widget-category">Category</Label>
                                                        <Select name="category" defaultValue={currentWidget?.category}>
                                                            <SelectTrigger id="edit-widget-category">
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {isLoadingCategories ? (
                                                                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                                                                ) : (
                                                                    categories.map(category => (
                                                                        <SelectItem key={category.$id} value={category.name}>{category.name}</SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                  </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-widget-description">Description</Label>
                                                        <Textarea id="edit-widget-description" name="description" defaultValue={currentWidget?.description} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-widget-key-features">Key Features (comma-separated)</Label>
                                                        <Textarea id="edit-widget-key-features" name="keyFeatures" defaultValue={currentWidget?.keyFeatures.join(', ')} rows={3}/>
                                                    </div>
                                                     <div className="space-y-2">
                                                        <Label htmlFor="edit-widget-whats-new">What's New (Markdown supported)</Label>
                                                        <Textarea id="edit-widget-whats-new" name="whatsNew" defaultValue={currentWidget?.whatsNew} rows={5}/>
                                                    </div>
                                                     <div className="space-y-2">
                                                        <Label htmlFor="edit-widget-more-info">More Information (Markdown supported)</Label>
                                                        <Textarea id="edit-widget-more-info" name="moreInfo" defaultValue={currentWidget?.moreInfo} rows={5}/>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="button" variant="ghost" onClick={() => setIsWidgetDialogOpen(false)}>Cancel</Button>
                                                        <Button type="submit">Save changes</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the widget
                                                    from the store.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteWidget(widget.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Widget</CardTitle>
                <CardDescription>Fill out the form below to add a new widget to the store.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWidgetSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6 flex flex-col">
                        <div>
                          <Label htmlFor="widget-name">Widget Name</Label>
                          <Input id="widget-name" name="name" placeholder="e.g., ChronoFlow" required />
                        </div>

                        <div>
                          <Label htmlFor="widget-description">Description</Label>
                          <Textarea id="widget-description" name="description" placeholder="A short, catchy description of the widget." required />
                        </div>
                        
                        <div>
                          <Label htmlFor="widget-category">Category</Label>
                          <Select name="category" required>
                            <SelectTrigger id="widget-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingCategories ? (
                                  <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                              ) : (
                                  categories.map(category => (
                                      <SelectItem key={category.$id} value={category.name}>{category.name}</SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                         <div>
                          <Label htmlFor="widget-tags">Tags (comma-separated)</Label>
                          <Input id="widget-tags" name="tags" placeholder="e.g., time management, calendar, tasks" required />
                        </div>
                        
                        <div>
                          <Label htmlFor="widget-image-hint">Image AI Hint</Label>
                          <Input id="widget-image-hint" name="imageHint" placeholder="e.g., abstract tech, colorful gradient" required />
                        </div>

                      </div>

                      <div className="space-y-6 flex flex-col">
                        <div>
                          <Label htmlFor="widget-key-features">Key Features (comma-separated)</Label>
                          <Textarea id="widget-key-features" name="keyFeatures" placeholder="Feature 1, Feature 2, Feature 3" required rows={4} />
                        </div>

                        <div>
                          <Label htmlFor="widget-whats-new">What's New (Markdown supported)</Label>
                          <Textarea id="widget-whats-new" name="whatsNew" placeholder="**Version 1.0.1** - Fixed a bug." required rows={4}/>
                        </div>

                        <div>
                          <Label htmlFor="widget-more-info">More Information (Markdown Table)</Label>
                          <Textarea id="widget-more-info" name="moreInfo" placeholder="| Key | Value |&#10;| --- | --- |&#10;| Version | 1.0.1 |" required rows={4}/>
                        </div>
                      </div>
                   </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                      <Label htmlFor="widget-image">Widget Image</Label>
                      <Input id="widget-image" name="image" type="file" className="pt-2"/>
                    </div>
                    
                    <div>
                      <Label htmlFor="widget-package">Widget Package</Label>
                      <Input id="widget-package" name="package" type="file" className="pt-2"/>
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-bold">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Submit Widget
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
                <CardHeader>
                    <CardTitle>Site Settings</CardTitle>
                    <CardDescription>Update your site's contact information and social media links.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingSettings ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <form onSubmit={handleSettingsSubmit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-email">Contact Email</Label>
                                        <Input id="contact-email" name="email" defaultValue={siteSettings?.email || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-phone">Phone Number</Label>
                                        <Input id="contact-phone" name="phone" defaultValue={siteSettings?.phone || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-address">Address</Label>
                                        <Input id="contact-address" name="address" defaultValue={siteSettings?.address || ''} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Social Media & Links</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="social-website">Official Website URL</Label>
                                        <Input id="social-website" name="website" defaultValue={siteSettings?.website || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="social-facebook">Facebook URL</Label>
                                        <Input id="social-facebook" name="facebook" defaultValue={siteSettings?.facebook || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="social-twitter">Twitter URL</Label>
                                        <Input id="social-twitter" name="twitter" defaultValue={siteSettings?.twitter || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="social-github">GitHub URL</Label>
                                        <Input id="social-github" name="github" defaultValue={siteSettings?.github || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="social-linkedin">LinkedIn URL</Label>
                                        <Input id="social-linkedin" name="linkedin" defaultValue={siteSettings?.linkedin || ''} />
                                    </div>
                                </CardContent>
                            </Card>
                             <Button type="submit" className="font-bold">
                                {siteSettings ? 'Save Settings' : 'Create Settings'}
                             </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
          </TabsContent>
       </Tabs>
    </div>
  );
}
