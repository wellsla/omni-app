
"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { analyzeAccessibility, type AnalyzeAccessibilityOutput } from '@/ai/flows/analyze-accessibility';
import { Loader2, Accessibility as AccessibilityIcon, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  htmlCode: z.string().min(20, 'Please enter at least 20 characters of HTML code.'),
});
type FormData = z.infer<typeof formSchema>;


export default function AccessibilityCheckerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeAccessibilityOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            htmlCode: `<!DOCTYPE html>
<html>
<head>
  <title>Sample Page</title>
</head>
<body>
  <header>
    <nav>
      <a href="/home">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  
  <h1>Welcome to my website</h1>
  <img src="photo.jpg">
  
  <form>
    <p>Sign up for our newsletter:</p>
    <input id="email" placeholder="Your email...">
    <button>Subscribe</button>
  </form>
</body>
</html>`
        }
    });

    const onAnalyze = async (data: FormData) => {
        setIsLoading(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeAccessibility({ htmlCode: data.htmlCode });
            if (result) {
                setAnalysisResult(result);
                toast({ title: "Analysis Complete!", description: `Found ${result.issues.length} potential issues.` });
            } else {
                throw new Error("The analysis returned no data.");
            }
        } catch (error) {
            console.error("Accessibility analysis error:", error);
            toast({ title: "Analysis Failed", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderSkeleton = () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border rounded-md">
                    {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b">
                        <div className="w-1/4 space-y-2"><Skeleton className="h-4 w-full" /></div>
                        <div className="w-1/2 space-y-2"><Skeleton className="h-4 w-full" /></div>
                    </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <PageHeader
                title="Accessibility Checker"
                description="Paste your HTML code to check for common accessibility issues."
            />
            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                <form onSubmit={form.handleSubmit(onAnalyze)}>
                    <CardHeader>
                        <CardTitle>HTML Code</CardTitle>
                        <CardDescription>Paste your raw HTML code to be analyzed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="htmlCode"
                            {...form.register('htmlCode')}
                            placeholder="<p>Your HTML here...</p>"
                            className="h-80 font-mono"
                        />
                        {form.formState.errors.htmlCode && (
                            <p className="text-sm text-destructive mt-2">{form.formState.errors.htmlCode.message}</p>
                        )}
                    </CardContent>
                    <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AccessibilityIcon className="mr-2 h-4 w-4" />}
                        Check Accessibility
                    </Button>
                    </CardFooter>
                </form>
                </Card>

                {isLoading && renderSkeleton()}

                {analysisResult && (
                <Card>
                    <CardHeader>
                    <CardTitle>Analysis Report</CardTitle>
                    <CardDescription>{analysisResult.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {analysisResult.issues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-16">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold">No Accessibility Issues Found!</h3>
                            <p className="mt-1 max-w-sm">The provided code seems to follow basic accessibility standards.</p>
                        </div>
                    ) : (
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Issue</TableHead>
                            <TableHead>Recommendation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analysisResult.issues.map((issue, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-mono text-xs"><Badge variant="outline">{issue.feature}</Badge></TableCell>
                                <TableCell className="text-xs">{issue.recommendation}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    )}
                    </CardContent>
                </Card>
                )}
            </div>
        </>
    );
}
