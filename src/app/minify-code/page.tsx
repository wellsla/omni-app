"use client";

import React, { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Minimize, Copy, Check, ArrowRight } from 'lucide-react';
import { minifyCode } from '@/ai/flows/minify-code';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Language = 'javascript' | 'css' | 'html';

export default function MinifyCodePage() {
    const [language, setLanguage] = useState<Language>('javascript');
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleMinifyCode = async () => {
        if (!inputCode.trim()) {
            toast({
                title: 'No Code Provided',
                description: 'Please enter some code to minify.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setOutputCode('');

        try {
            const result = await minifyCode({ code: inputCode, language });
            if (result && result.minifiedCode) {
                setOutputCode(result.minifiedCode);
                toast({ title: 'Code Minified Successfully!' });
            } else {
                throw new Error('Minification failed to produce a result.');
            }
        } catch (error) {
            console.error('Minification error:', error);
            toast({
                title: 'Minification Error',
                description: error instanceof Error ? error.message : "An unexpected error occurred.",
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!outputCode) return;
        navigator.clipboard.writeText(outputCode);
        setCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setCopied(false), 2000);
    };
    
    const inputSize = new Blob([inputCode]).size;
    const outputSize = new Blob([outputCode]).size;
    const sizeReduction = inputSize > 0 ? ((inputSize - outputSize) / inputSize * 100).toFixed(2) : 0;

    return (
        <>
            <PageHeader
                title="Minify & Uglify Code"
                description="Reduce the file size of your code by removing unnecessary characters and shortening variable names."
            />
            <Card>
                <CardHeader>
                    <Tabs defaultValue={language} onValueChange={(v) => setLanguage(v as Language)}>
                        <TabsList>
                            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                            <TabsTrigger value="css">CSS</TabsTrigger>
                            <TabsTrigger value="html">HTML</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                         <Label htmlFor="input-code">Source Code</Label>
                         <Textarea
                            id="input-code"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            placeholder={`Paste your ${language} code here...`}
                            className="h-96 resize-none font-mono"
                            aria-label="Input code"
                        />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="output-code">Minified Code</Label>
                        <div className="relative">
                            {isLoading ? (
                                <div className="space-y-2 p-4 border rounded-md animate-pulse h-full min-h-[420px]">
                                    {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" style={{width: `${Math.random() * 40 + 50}%`}} />)}
                                </div>
                            ) : (
                                <Textarea
                                    id="output-code"
                                    value={outputCode}
                                    readOnly
                                    placeholder={`Minified ${language} code will be displayed here.`}
                                    className="h-96 resize-none font-mono bg-muted/50"
                                    aria-label="Minified code"
                                />
                            )}
                            {outputCode && !isLoading && (
                                <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy minified code" className="absolute top-2 right-2">
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                     <Button onClick={handleMinifyCode} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Minimize className="mr-2 h-4 w-4" />}
                        Minify Code
                    </Button>
                    {outputCode && !isLoading && (
                        <div className="text-sm text-muted-foreground flex items-center gap-4 rounded-lg border p-3 w-full">
                            <span>Original Size: <strong>{(inputSize / 1024).toFixed(2)} KB</strong></span>
                            <ArrowRight className="h-4 w-4" />
                            <span>Minified Size: <strong>{(outputSize / 1024).toFixed(2)} KB</strong></span>
                            <ArrowRight className="h-4 w-4" />
                             <span>Reduction: <strong className="text-green-600">{sizeReduction}%</strong></span>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </>
    );
}
