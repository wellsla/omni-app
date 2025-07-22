
"use client";

import React, { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { convertCodeLanguage } from '@/ai/flows/convert-code-language';
import { Skeleton } from '@/components/ui/skeleton';

const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'rust', label: 'Rust' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
];

export default function LanguageConverterPage() {
    const [sourceLang, setSourceLang] = useState('javascript');
    const [targetLang, setTargetLang] = useState('python');
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleConvertCode = async () => {
        if (!inputCode.trim()) {
            toast({
                title: 'No Code Provided',
                description: 'Please enter some code to convert.',
                variant: 'destructive',
            });
            return;
        }
        if (sourceLang === targetLang) {
            toast({
                title: 'Cannot Convert',
                description: 'Source and target languages must be different.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setOutputCode('');

        try {
            const result = await convertCodeLanguage({ code: inputCode, sourceLanguage: sourceLang, targetLanguage: targetLang });
            if (result && result.convertedCode) {
                setOutputCode(result.convertedCode);
                toast({ title: 'Code Converted Successfully!' });
            } else {
                throw new Error('Conversion failed to produce a result.');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast({
                title: 'Conversion Error',
                description: errorMessage,
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

    return (
        <>
            <PageHeader
                title="Language Converter"
                description="Translate code snippets from one programming language to another using AI."
            />
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                         <div className="flex-1 space-y-2">
                            <Label htmlFor="source-language">Source Language</Label>
                            <Select value={sourceLang} onValueChange={setSourceLang}>
                                <SelectTrigger id="source-language"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {supportedLanguages.map(lang => (
                                        <SelectItem key={`src-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="target-language">Target Language</Label>
                            <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger id="target-language"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {supportedLanguages.map(lang => (
                                        <SelectItem key={`tgt-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                             <Label htmlFor="input-code">Source Code</Label>
                             <Textarea
                                id="input-code"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder={`Paste your ${sourceLang} code here...`}
                                className="h-96 resize-none font-mono"
                                aria-label="Input code"
                            />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="output-code">Converted Code</Label>
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
                                        placeholder={`Converted ${targetLang} code will be displayed here.`}
                                        className="h-96 resize-none font-mono bg-muted/50"
                                        aria-label="Converted code"
                                    />
                                )}
                                {outputCode && !isLoading && (
                                    <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy converted code" className="absolute top-2 right-2">
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleConvertCode} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
                        Convert Code
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}
