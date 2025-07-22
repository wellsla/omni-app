
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
import { runLighthouseAudit, type RunLighthouseAuditOutput } from '@/ai/flows/run-lighthouse-audit';
import { Loader2, Search, Zap, Accessibility, ShieldCheck, BarChart, ChevronDown, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." }),
});
type FormData = z.infer<typeof formSchema>;

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-destructive';
};

const impactIcons = {
  High: <AlertTriangle className="h-4 w-4 text-destructive" />,
  Medium: <Info className="h-4 w-4 text-yellow-500" />,
  Low: <CheckCircle className="h-4 w-4 text-green-500" />,
};

const ScoreGauge = ({ score }: { score: number }) => (
    <div className="relative h-32 w-32">
        <svg className="h-full w-full" viewBox="0 0 36 36" transform="rotate(-90)">
            <circle
                className="text-muted"
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            />
            <circle
                className={cn("transition-all duration-500", getScoreColor(score))}
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
            />
        </svg>
        <div className={cn("absolute inset-0 flex items-center justify-center text-3xl font-bold", getScoreColor(score))}>
            {score}
        </div>
    </div>
);


const CategoryResult = ({ title, data, icon }: { title: string, data: RunLighthouseAuditOutput[keyof RunLighthouseAuditOutput], icon: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-grow">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{data.recommendations.length} recommendations</CardDescription>
                </div>
                <ScoreGauge score={data.score} />
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="recommendations">
                    <AccordionTrigger>View Recommendations</AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-4">
                            {data.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">{impactIcons[rec.impact]}</div>
                                    <div className="text-sm">
                                        <p>{rec.description}</p>
                                        <Badge variant="outline" className="mt-1">{rec.impact} Impact</Badge>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);

export default function LighthouseAuditPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<RunLighthouseAuditOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { url: '' },
    });

    const onAnalyze = async (data: FormData) => {
        setIsLoading(true);
        setAnalysisResult(null);
        try {
            const result = await runLighthouseAudit({ url: data.url });
            if (result) {
                setAnalysisResult(result);
                toast({ title: "Audit Complete!", description: "AI-powered Lighthouse simulation finished." });
            } else {
                throw new Error("The audit returned no data.");
            }
        } catch (error) {
            console.error("Lighthouse audit error:", error);
            toast({ title: "Audit Failed", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const renderSkeleton = () => (
        <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex items-center gap-4">
                       <Skeleton className="h-12 w-12 rounded-full" />
                       <div className="flex-grow space-y-2">
                         <Skeleton className="h-6 w-3/4" />
                         <Skeleton className="h-4 w-1/2" />
                       </div>
                       <Skeleton className="h-32 w-32 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <>
            <PageHeader
                title="Lighthouse Audit"
                description="Enter a URL to run an AI-powered Lighthouse simulation for your website."
            />
            <Card className="mb-8">
                <form onSubmit={form.handleSubmit(onAnalyze)}>
                    <CardHeader>
                        <CardTitle>Analyze Website Performance</CardTitle>
                        <CardDescription>Enter a public URL to begin the audit.</CardDescription>
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
                                Run Audit
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
            
            {isLoading && renderSkeleton()}

            {analysisResult && (
                <div className="grid gap-6 md:grid-cols-2">
                    <CategoryResult title="Performance" data={analysisResult.performance} icon={<Zap className="h-8 w-8 text-primary" />} />
                    <CategoryResult title="Accessibility" data={analysisResult.accessibility} icon={<Accessibility className="h-8 w-8 text-primary" />} />
                    <CategoryResult title="Best Practices" data={analysisResult.bestPractices} icon={<ShieldCheck className="h-8 w-8 text-primary" />} />
                    <CategoryResult title="SEO" data={analysisResult.seo} icon={<BarChart className="h-8 w-8 text-primary" />} />
                </div>
            )}
        </>
    );
}
