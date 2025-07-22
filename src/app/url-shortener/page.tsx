
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { shortenUrl } from '@/ai/flows/shorten-url';
import { Loader2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." }),
});
type FormData = z.infer<typeof formSchema>;

export default function UrlShortenerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onGenerate = async (data: FormData) => {
        setIsLoading(true);
        setShortUrl(null);
        try {
            const result = await shortenUrl({ url: data.url });
            if (result && result.shortUrl) {
                setShortUrl(result.shortUrl);
                toast({ title: "URL Shortened Successfully!" });
            } else {
                throw new Error("Failed to shorten the URL.");
            }
        } catch (error) {
            console.error("URL shortening error:", error);
            toast({ title: "Shortening Error", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!shortUrl) return;
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <PageHeader
                title="URL Shortener"
                description="Enter a long URL to generate a shortened, shareable link."
            />
            <div className="flex justify-center">
                <div className="w-full max-w-2xl space-y-8">
                    <Card>
                        <form onSubmit={handleSubmit(onGenerate)}>
                            <CardHeader>
                                <CardTitle>Enter URL</CardTitle>
                                <CardDescription>Paste the long URL you want to shorten.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <Label htmlFor="url" className="sr-only">Long URL</Label>
                                    <Input
                                        id="url"
                                        {...register('url')}
                                        placeholder="https://example.com/very/long/path/to/resource"
                                    />
                                    {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                                    Shorten URL
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {(isLoading || shortUrl) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Shortened URL</CardTitle>
                                <CardDescription>Use this link for easy sharing.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-10 flex-grow" />
                                        <Skeleton className="h-10 w-10" />
                                    </div>
                                ) : shortUrl ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={shortUrl}
                                            readOnly
                                            className="font-mono text-sm bg-muted/50"
                                            aria-label="Shortened URL"
                                        />
                                        <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy shortened URL">
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
