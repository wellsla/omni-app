
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { analyzeSeo, type AnalyzeSeoOutput } from '@/ai/flows/analyze-seo';
import { Loader2, Search, CheckCircle, AlertTriangle, XCircle, BarChart, Image as ImageIcon, Heading1, CaseSensitive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." }),
});
type FormData = z.infer<typeof formSchema>;

const statusIcons = {
  Good: <CheckCircle className="h-5 w-5 text-green-500" />,
  Warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  Error: <XCircle className="h-5 w-5 text-destructive" />,
};

const ResultCard = ({ title, status, value, recommendation, icon }: { title: string, status: 'Good' | 'Warning' | 'Error', value: string, recommendation: string, icon: React.ReactNode }) => (
  <Card className="bg-muted/30">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
      {statusIcons[status]}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {status !== 'Good' && <p className="text-xs text-muted-foreground pt-1">{recommendation}</p>}
    </CardContent>
  </Card>
);

export default function SeoAnalyzerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeSeoOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            url: ''
        }
    });

    const onAnalyze = async (data: FormData) => {
        setIsLoading(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeSeo({ url: data.url });
            if (result) {
                setAnalysisResult(result);
                toast({ title: "Analysis Complete!", description: `Scored ${result.overallScore}/100 for ${data.url}` });
            } else {
                throw new Error("The analysis returned no data.");
            }
        } catch (error) {
            console.error("SEO analysis error:", error);
            toast({ title: "Analysis Failed", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderSkeleton = () => (
        <div className="space-y-8">
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
             <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <>
            <PageHeader
                title="SEO Analyzer"
                description="Enter a URL to analyze its on-page SEO factors and get actionable recommendations."
            />
            <Card className="mb-8">
                <form onSubmit={form.handleSubmit(onAnalyze)}>
                    <CardHeader>
                        <CardTitle>Analyze Website</CardTitle>
                        <CardDescription>Enter a public URL to begin the SEO analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start gap-2">
                             <div className="grid w-full gap-1.5">
                                <Label htmlFor="url" className="sr-only">URL</Label>
                                <Input
                                    id="url"
                                    {...form.register('url')}
                                    placeholder="https://example.com"
                                    disabled={isLoading}
                                />
                                 {form.formState.errors.url && <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>}
                            </div>
                             <Button type="submit" disabled={isLoading} className="w-full sm:w-auto flex-shrink-0">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Analyze
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
            
            {isLoading && renderSkeleton()}

            {analysisResult && (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Analysis for: <a href={form.getValues('url')} className="text-primary hover:underline break-all">{form.getValues('url')}</a></CardTitle>
                             <div className="pt-2 space-y-2">
                                <Label>Overall Score: {analysisResult.overallScore}/100</Label>
                                <Progress value={analysisResult.overallScore} className="h-3" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold mb-2">Summary</h3>
                            <p className="text-muted-foreground">{analysisResult.summary}</p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <ResultCard title="Meta Title" icon={<CaseSensitive/>} {...analysisResult.metaTitle} />
                        <ResultCard title="Meta Description" icon={<CaseSensitive/>} {...analysisResult.metaDescription} />
                        <ResultCard title="H1 Heading" icon={<Heading1/>} {...analysisResult.h1Count} />
                        <ResultCard title="Image Alt Tags" icon={<ImageIcon/>} {...analysisResult.imageAlts} />
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5"/> Keyword Density</CardTitle>
                            <CardDescription>Top keywords found in the page content.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Keyword</TableHead>
                                        <TableHead className="text-right">Count</TableHead>
                                        <TableHead className="text-right">Density</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysisResult.keywordDensity.map(kw => (
                                        <TableRow key={kw.keyword}>
                                            <TableCell className="font-medium">{kw.keyword}</TableCell>
                                            <TableCell className="text-right">{kw.count}</TableCell>
                                            <TableCell className="text-right">{kw.density}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
