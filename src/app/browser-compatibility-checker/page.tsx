
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  checkBrowserCompatibility,
  type CheckBrowserCompatibilityOutput,
} from '@/ai/flows/check-browser-compatibility';
import { Loader2, Globe, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const browsers = [
  { id: 'chrome', label: 'Google Chrome' },
  { id: 'firefox', label: 'Mozilla Firefox' },
  { id: 'safari', label: 'Apple Safari' },
  { id: 'edge', label: 'Microsoft Edge' },
  { id: 'opera', label: 'Opera' },
];

const formSchema = z.object({
  code: z.string().min(10, 'Please enter at least 10 characters of code.'),
  language: z.enum(['css', 'javascript', 'html']),
  selectedBrowsers: z.array(z.string()).min(1, 'Please select at least one browser.'),
});

type FormData = z.infer<typeof formSchema>;

export default function BrowserCompatibilityCheckerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CheckBrowserCompatibilityOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '.container {\n  display: grid;\n  gap: 1rem;\n  backdrop-filter: blur(10px);\n}',
      language: 'css',
      selectedBrowsers: ['chrome', 'firefox', 'safari'],
    },
  });

  const onAnalyze = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await checkBrowserCompatibility({
        code: data.code,
        language: data.language,
        browsers: data.selectedBrowsers,
      });
      if (result) {
        setAnalysisResult(result);
        toast({ title: 'Analysis Complete!', description: `Found ${result.issues.length} potential issues.` });
      } else {
        throw new Error('The analysis returned no data.');
      }
    } catch (error) {
      console.error('Browser compatibility error:', error);
      toast({ title: 'Analysis Failed', description: (error as Error).message, variant: 'destructive' });
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
        <Skeleton className="h-4 w-full" />
        <div className="border rounded-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b">
              <div className="w-1/4 space-y-2"><Skeleton className="h-4 w-full" /></div>
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
        title="Browser Compatibility Checker"
        description="Analyze your HTML, CSS, or JavaScript code for potential cross-browser compatibility issues."
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <form onSubmit={form.handleSubmit(onAnalyze)}>
            <CardHeader>
              <CardTitle>Code &amp; Configuration</CardTitle>
              <CardDescription>Paste your code and select the target browsers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Controller
                  name="language"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code Snippet</Label>
                <Textarea
                  id="code"
                  {...form.register('code')}
                  placeholder="Paste your code here..."
                  className="h-64 font-mono"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                )}
              </div>
              <div className="space-y-3">
                <Label>Target Browsers</Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {browsers.map((browser) => (
                    <Controller
                      key={browser.id}
                      name="selectedBrowsers"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={browser.id}
                            checked={field.value?.includes(browser.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), browser.id])
                                : field.onChange((field.value || []).filter((value) => value !== browser.id));
                            }}
                          />
                          <Label htmlFor={browser.id} className="cursor-pointer">
                            {browser.label}
                          </Label>
                        </div>
                      )}
                    />
                  ))}
                </div>
                {form.formState.errors.selectedBrowsers && (
                  <p className="text-sm text-destructive">{form.formState.errors.selectedBrowsers.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                Analyze Compatibility
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
                    <h3 className="text-xl font-semibold">No Compatibility Issues Found!</h3>
                    <p className="mt-1 max-w-sm">The provided code seems to be well-supported across the selected browsers.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Unsupported In</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.issues.map((issue, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{issue.feature}</TableCell>
                        <TableCell>
                          {issue.unsupportedIn.length > 0 ? (
                             <div className="flex flex-wrap gap-1">
                                {issue.unsupportedIn.map(browser => <Badge key={browser} variant="destructive">{browser}</Badge>)}
                            </div>
                          ) : (
                            <Badge variant="secondary">None</Badge>
                          )}
                        </TableCell>
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
