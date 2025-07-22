"use client";

import React, { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Copy, Check } from 'lucide-react';
import { formatCode } from '@/ai/flows/format-code';
import { Skeleton } from '@/components/ui/skeleton';

const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'json', label: 'JSON' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'php', label: 'PHP' },
    { value: 'python', label: 'Python' },
    { value: 'sql', label: 'SQL' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'yaml', label: 'YAML' },
];

export default function CodeFormatterPage() {
    const [language, setLanguage] = useState('javascript');
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleFormatCode = async () => {
        if (!inputCode.trim()) {
            toast({
                title: 'No Code Provided',
                description: 'Please enter some code to format.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setOutputCode('');

        try {
            const result = await formatCode({ code: inputCode, language });
            if (result && result.formattedCode) {
                setOutputCode(result.formattedCode);
                toast({ title: 'Code Formatted Successfully!' });
            } else {
                throw new Error('Formatting failed to produce a result.');
            }
        } catch (error) {
            console.error('Formatting error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            const userFriendlyMessage = /503|overloaded/i.test(errorMessage)
                ? 'The AI model is currently busy. Please try again in a few moments.'
                : errorMessage;

            toast({
                title: 'Formatting Error',
                description: userFriendlyMessage,
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
                title="Code Formatter"
                description="Automatically format your code according to standard conventions for various languages."
            />
            <div className="grid gap-8 md:grid-cols-2">
                {/* Input Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Input</CardTitle>
                        <CardDescription>Select a language and paste your code below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="language-select">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger id="language-select">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedLanguages.map(lang => (
                                        <SelectItem key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="input-code">Code</Label>
                            <Textarea
                                id="input-code"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder={`Paste your ${language} code here...`}
                                className="h-96 resize-none font-mono"
                                aria-label="Input code"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleFormatCode} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Format Code
                        </Button>
                    </CardFooter>
                </Card>

                {/* Output Card */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Output</CardTitle>
                            <CardDescription>Your formatted code will appear here.</CardDescription>
                        </div>
                        {outputCode && !isLoading && (
                            <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy formatted code">
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="space-y-2 p-4 border rounded-md animate-pulse h-full min-h-[460px]">
                                {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" style={{width: `${Math.random() * 40 + 50}%`}} />)}
                            </div>
                        ) : (
                            <Textarea
                                value={outputCode}
                                readOnly
                                placeholder="Formatted code will be displayed here."
                                className="h-96 resize-none font-mono bg-muted/50"
                                aria-label="Formatted code"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
