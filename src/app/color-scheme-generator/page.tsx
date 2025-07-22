
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateColorScheme, type GenerateColorSchemeOutput } from '@/ai/flows/generate-color-scheme';
import { Loader2, Wand, Copy, Check, Palette } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Color = GenerateColorSchemeOutput['colors'][0];

const formSchema = z.object({
  prompt: z.string().min(10, "Please enter a more descriptive prompt (at least 10 characters)."),
});
type FormData = z.infer<typeof formSchema>;

const ColorCard = ({ color }: { color: Color }) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(color.hex);
        setCopied(true);
        toast({ title: `Copied ${color.hex} to clipboard!` });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="h-24 w-full" style={{ backgroundColor: color.hex }} />
            <div className="p-4 bg-card">
                <div className="font-bold text-lg">{color.name}</div>
                <div className="text-sm text-muted-foreground">{color.usage}</div>
                <div className="flex items-center justify-between mt-3">
                    <span className="font-mono text-sm tracking-wider">{color.hex}</span>
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default function ColorSchemeGeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [colorScheme, setColorScheme] = useState<GenerateColorSchemeOutput | null>(null);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: 'A modern, calming theme for a meditation app'
        }
    });

    const onGenerate = async (data: FormData) => {
        setIsLoading(true);
        setColorScheme(null);
        try {
            const result = await generateColorScheme({ prompt: data.prompt });
            if (result && result.colors) {
                setColorScheme(result);
                toast({ title: "Color Scheme Generated!", description: `Created a palette with ${result.colors.length} colors.` });
            } else {
                throw new Error("Failed to generate a color scheme.");
            }
        } catch (error) {
            console.error("Color scheme generation error:", error);
            toast({ title: "Generation Error", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Color Scheme Generator"
                description="Describe your desired aesthetic, and let AI generate a beautiful, cohesive color palette for your project."
            />
            <div className="space-y-8">
                <Card>
                    <form onSubmit={handleSubmit(onGenerate)}>
                        <CardHeader>
                            <CardTitle>Describe Your Vision</CardTitle>
                            <CardDescription>Enter a prompt describing the mood, style, or purpose of your color scheme.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <Input
                                    {...register('prompt')}
                                    placeholder="e.g., A vibrant and energetic palette for a fitness brand"
                                />
                                {errors.prompt && <p className="text-sm text-destructive">{errors.prompt.message}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                                Generate Palette
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {isLoading && (
                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <div key={i} className="border rounded-lg shadow-sm animate-pulse">
                             <Skeleton className="h-24 w-full" />
                             <div className="p-4 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex justify-between items-center mt-3">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                             </div>
                           </div>
                        ))}
                    </div>
                )}
                
                {colorScheme && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Palette</CardTitle>
                            <CardDescription>Here is the color scheme generated from your prompt.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {colorScheme.colors.map((color) => (
                                <ColorCard key={color.hex} color={color} />
                            ))}
                        </CardContent>
                    </Card>
                )}
                 {!isLoading && !colorScheme && (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
                        <Palette className="h-16 w-16 mb-4" />
                        <h3 className="text-xl font-semibold">Your generated palette will appear here</h3>
                        <p className="mt-1 max-w-sm">Enter a prompt above and click "Generate" to see the magic happen!</p>
                    </div>
                )}
            </div>
        </>
    );
}
