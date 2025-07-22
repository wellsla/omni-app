
"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateLoremIpsum } from '@/ai/flows/generate-lorem-ipsum';
import { Loader2, FileText, Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  count: z.coerce.number().int().min(1, "Please enter a number of 1 or more.").max(100, "You can generate a maximum of 100 at a time."),
  type: z.enum(['words', 'sentences', 'paragraphs']),
});

type FormData = z.infer<typeof formSchema>;

export default function LoremIpsumGeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            count: 5,
            type: 'paragraphs',
        },
    });

    const onGenerate = async (data: FormData) => {
        setIsLoading(true);
        setGeneratedText('');
        try {
            const result = await generateLoremIpsum(data);
            if (result && result.text) {
                setGeneratedText(result.text);
                toast({ title: 'Text Generated!', description: `Generated ${data.count} ${data.type} of Lorem Ipsum.` });
            } else {
                throw new Error('The AI failed to generate text.');
            }
        } catch (error) {
            console.error("Lorem Ipsum generation error:", error);
            toast({ title: 'Generation Failed', description: (error as Error).message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <PageHeader
                title="Lorem Ipsum Generator"
                description="Generate placeholder text in words, sentences, or paragraphs."
            />
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <form onSubmit={form.handleSubmit(onGenerate)}>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Specify the amount and type of text to generate.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="count">Amount</Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        {...form.register('count')}
                                    />
                                    {form.formState.errors.count && <p className="text-sm text-destructive">{form.formState.errors.count.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Controller
                                        name="type"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="words">Words</SelectItem>
                                                    <SelectItem value="sentences">Sentences</SelectItem>
                                                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                Generate Text
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Result</CardTitle>
                            <CardDescription>Your generated text will appear here.</CardDescription>
                        </div>
                        {generatedText && !isLoading && (
                             <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy generated text">
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2 p-4 border rounded-md animate-pulse h-64">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-11/12" />
                                <Skeleton className="h-4 w-full" />
                                <br />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-10/12" />
                            </div>
                        ) : (
                             <Textarea
                                value={generatedText}
                                readOnly
                                placeholder="Generated Lorem Ipsum text will be displayed here."
                                className="h-64 resize-none font-mono bg-muted/50"
                                aria-label="Generated Lorem Ipsum"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
