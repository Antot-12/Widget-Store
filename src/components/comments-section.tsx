
"use client";

import { useState, useEffect, useRef } from 'react';
import { databases, WIDGETS_DB_ID, COMMENTS_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import type { Comment } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageCircle, Star, Bold, Italic, Strikethrough, Smile, Quote, Code, Link as LinkIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { MarkdownRenderer } from './markdown-renderer';

interface CommentsSectionProps {
  widgetId: string;
  onCommentsLoaded: (comments: Comment[]) => void;
}

const EMOJIS = ['😀', '😍', '👍', '🔥', '❤️', '😂', '🤔', '😢', '🎉', '💡', '🚀', '💯'];

export function CommentsSection({ widgetId, onCommentsLoaded }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async () => {
    if (!WIDGETS_DB_ID || !COMMENTS_COLLECTION_ID) {
        console.error("Appwrite environment variables are not set.");
        toast({
            title: "Configuration Error",
            description: "Appwrite database or collection ID is missing.",
            variant: "destructive"
        })
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(
        WIDGETS_DB_ID,
        COMMENTS_COLLECTION_ID,
        [Query.equal('widgetId', widgetId)]
      );
      const fetchedComments = response.documents as unknown as Comment[];
      // Sort by creation date, newest first
      fetchedComments.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
      setComments(fetchedComments);
      onCommentsLoaded(fetchedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast({
        title: 'Error',
        description: 'Could not load comments. Please check your Appwrite collection permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (widgetId) {
      fetchComments();
    }
  }, [widgetId]);

  const applyMarkdown = (markdownTemplate: string, selectedText: string) => {
    const textarea = commentInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newText = newComment.substring(0, start) + markdownTemplate.replace('{{text}}', selectedText) + newComment.substring(end);
    setNewComment(newText);

    textarea.focus();
    setTimeout(() => {
        const newCursorPos = start + markdownTemplate.indexOf('{{text}}');
        textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    }, 0);
  }

  const handleFormat = (format: 'bold' | 'italic' | 'strike' | 'quote' | 'code' | 'link') => {
    const textarea = commentInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.substring(start, end) || 'your text';
    
    let markdown;
    switch(format) {
        case 'bold': 
            applyMarkdown('**{{text}}**', selectedText);
            break;
        case 'italic': 
            applyMarkdown('_{{text}}_', selectedText);
            break;
        case 'strike':
            applyMarkdown('~~{{text}}~~', selectedText);
            break;
        case 'quote':
            applyMarkdown('> {{text}}', selectedText);
            break;
        case 'code':
            applyMarkdown('`{{text}}`', selectedText);
            break;
        case 'link':
            const url = prompt("Enter the URL:", "https://");
            if (url) {
                applyMarkdown(`[{{text}}](${url})`, selectedText);
            }
            break;
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = commentInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = newComment.substring(0, start) + emoji + newComment.substring(end);
    setNewComment(newText);
    textarea.focus();
    setTimeout(() => textarea.setSelectionRange(start + emoji.length, start + emoji.length), 0);
  };

  const validateAuthor = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !author.trim() || rating === 0) {
        toast({ title: 'Error', description: 'Please fill in all fields and provide a rating.', variant: 'destructive' });
        return;
    };

    if (!validateAuthor(author)) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter a real name without numbers or special characters.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await databases.createDocument(
        WIDGETS_DB_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          widgetId: widgetId,
          author: author,
          text: newComment,
          rating: rating
        }
      );
      toast({ title: 'Success', description: 'Your comment has been posted!' });
      setNewComment('');
      setAuthor('');
      setRating(0);
      fetchComments(); // Refresh comments list
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 flex items-center gap-3">
            <MessageCircle className="text-primary w-6 h-6" />
            Community Comments
        </h2>
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 p-4 border rounded-lg bg-card">
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Your Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                      (hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-400'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>
            <Input 
                type="text" 
                placeholder="Your name" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-secondary/50"
            />
            
            <div className="space-y-2">
                 <div className="flex flex-wrap items-center gap-1 border-b border-input pb-2">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('bold')} title="Bold"><Bold className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('italic')} title="Italic"><Italic className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('strike')} title="Strikethrough"><Strikethrough className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('quote')} title="Blockquote"><Quote className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('code')} title="Inline Code"><Code className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('link')} title="Link"><LinkIcon className="h-4 w-4" /></Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Emoji"><Smile className="h-4 w-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                            <div className="grid grid-cols-6 gap-1">
                                {EMOJIS.map(emoji => (
                                    <Button key={emoji} variant="ghost" size="icon" className="text-xl" onClick={() => handleEmojiSelect(emoji)}>
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <Textarea
                    ref={commentInputRef}
                    placeholder="Write a comment... Markdown is supported!"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-secondary/50 border-t-0 rounded-t-none"
                    rows={4}
                />
            </div>
            
            <Button type="submit" className='font-bold'>
                <Send className="mr-2 h-4 w-4" />
                Submit
            </Button>
        </form>

        <div className="space-y-4">
            {isLoading ? (
                <p className="text-muted-foreground">Loading comments...</p>
            ) : comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment.$id} className="bg-secondary/50 p-4 rounded-lg prose prose-sm prose-invert max-w-none">
                        <div className="flex items-center justify-between mb-1 not-prose">
                          <p className="font-bold text-foreground">{comment.author}</p>
                          <div className="flex items-center">
                            {[...Array(comment.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                            {[...Array(5 - comment.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400/30" />)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 not-prose">
                            {new Date(comment.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <MarkdownRenderer content={comment.text} />
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            )}
        </div>
    </div>
  );
}
