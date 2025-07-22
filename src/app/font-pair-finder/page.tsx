"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { findFontPairings, type FindFontPairingsOutput } from '@/ai/flows/find-font-pairings';
import { Loader2, Wand, Copy, Check, Type } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type FontPairing = FindFontPairingsOutput['pairings'][0];

const formSchema = z.object({
  prompt: z.string().min(10, "Please enter a more descriptive prompt (at least 10 characters)."),
});
type FormData = z.infer<typeof formSchema>;

const FontCard = ({ pairing }: { pairing: FontPairing }) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        const importStatement = `@import url('${pairing.googleFontsUrl}');`;
        navigator.clipboard.writeText(importStatement);
        setCopied(true);
        toast({ title: `Copied CSS @import rule!` });
        setTimeout(() => setCopied(false), 2000);
    };

    const headlineStyle = { fontFamily: `'${pairing.headlineFont}', sans-serif` };
    const bodyStyle = { fontFamily: `'${pairing.bodyFont}', sans-serif` };

    return (
        <Card className="flex flex-col">
             <Head>
                <link rel="stylesheet" href={pairing.googleFontsUrl} />
            </Head>
            <CardHeader>
                <CardTitle style={headlineStyle} className="text-2xl">{pairing.headlineFont} & {pairing.bodyFont}</CardTitle>
                <CardDescription className="text-sm">{pairing.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div>
                    <h3 style={headlineStyle} className="text-3xl font-bold truncate">Headline Example</h3>
                    <p style={headlineStyle} className="text-lg text-muted-foreground">The quick brown fox jumps over the lazy dog.</p>
                </div>
                 <div>
                    <h4 style={bodyStyle} className="font-bold text-lg">Body Text Example</h4>
                    <p style={bodyStyle} className="text-muted-foreground">Grumpy wizards make toxic brew for the evil Queen and Jack. A quick movement of the enemy will jeopardize six gunboats. The job of repairing the osmosis equipment isn't going to be simple.</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full" onClick={handleCopy}>
                    {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                    Copy @import URL
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function FontPairFinderPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [fontPairings, setFontPairings] = useState<FindFontPairingsOutput | null>(null);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: 'A friendly and professional pairing for a modern SaaS website'
        }
    });

    const onGenerate = async (data: FormData) => {
        setIsLoading(true);
        setFontPairings(null);
        try {
            const result = await findFontPairings({ prompt: data.prompt });
            if (result && result.pairings) {
                setFontPairings(result);
                toast({ title: "Font Pairings Generated!", description: `Found ${result.pairings.length} great combinations.` });
            } else {
                throw new Error("Failed to generate font pairings.");
            }
        } catch (error) {
            console.error("Font pairing generation error:", error);
            toast({ title: "Generation Error", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Font Pair Finder"
                description="Describe the mood or style you're aiming for, and let AI suggest beautiful Google Font pairings."
            />
            <div className="space-y-8">
                <Card>
                    <form onSubmit={handleSubmit(onGenerate)}>
                        <CardHeader>
                            <CardTitle>Describe Your Desired Style</CardTitle>
                            <CardDescription>Enter a prompt describing the feel you want for your typography.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <Input
                                    {...register('prompt')}
                                    placeholder="e.g., An elegant and classic look for a luxury brand"
                                />
                                {errors.prompt && <p className="text-sm text-destructive">{errors.prompt.message}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                                Generate Pairings
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {isLoading && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                           <Card key={i} className="animate-pulse">
                               <CardHeader><Skeleton className="h-7 w-3/4" /></CardHeader>
                               <CardContent className="space-y-6">
                                   <div className="space-y-2">
                                       <Skeleton className="h-8 w-1/2" />
                                       <Skeleton className="h-5 w-full" />
                                   </div>
                                    <div className="space-y-2">
                                       <Skeleton className="h-5 w-1/3" />
                                       <Skeleton className="h-4 w-full" />
                                       <Skeleton className="h-4 w-full" />
                                       <Skeleton className="h-4 w-3/4" />
                                   </div>
                               </CardContent>
                               <CardFooter>
                                   <Skeleton className="h-10 w-full" />
                               </CardFooter>
                           </Card>
                        ))}
                    </div>
                )}
                
                {fontPairings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fontPairings.pairings.map((pairing) => (
                            <FontCard key={`${pairing.headlineFont}-${pairing.bodyFont}`} pairing={pairing} />
                        ))}
                    </div>
                )}
                 {!isLoading && !fontPairings && (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
                        <Type className="h-16 w-16 mb-4" />
                        <h3 className="text-xl font-semibold">Your font pairings will appear here</h3>
                        <p className="mt-1 max-w-sm">Enter a prompt and click "Generate" to discover beautiful font combinations.</p>
                    </div>
                )}
            </div>
        </>
    );
}
