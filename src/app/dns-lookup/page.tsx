'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { dnsLookup, type DnsLookupOutput } from '@/ai/flows/dns-lookup';
import { Loader2, Search, Globe, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'] as const;

const formSchema = z.object({
  domain: z.string().min(3, 'Please enter a valid domain name.'),
  recordType: z.enum(recordTypes),
});
type FormData = z.infer<typeof formSchema>;

export default function DnsLookupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<DnsLookupOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: 'google.com',
      recordType: 'A',
    },
  });

  const onAnalyze = async (data: FormData) => {
    setIsLoading(true);
    setLookupResult(null);
    try {
      const result = await dnsLookup(data);
      if (result) {
        setLookupResult(result);
        if (result.error) {
             toast({ title: 'Lookup Warning', description: result.error, variant: 'destructive' });
        } else if (result.records.length === 0) {
            toast({ title: 'No Records Found', description: `No ${data.recordType} records found for ${data.domain}.` });
        } else {
            toast({ title: 'Lookup Complete!', description: `Found ${result.records.length} records.` });
        }
      } else {
        throw new Error('The lookup returned no data.');
      }
    } catch (error) {
      console.error('DNS lookup error:', error);
      toast({ title: 'Lookup Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderSkeleton = () => (
    <Card>
        <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
    </Card>
  );

  return (
    <>
      <PageHeader
        title="DNS Lookup Tool"
        description="Query different types of DNS records for any domain name."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <form onSubmit={form.handleSubmit(onAnalyze)}>
            <CardHeader>
              <CardTitle>DNS Query</CardTitle>
              <CardDescription>Enter a domain and select a record type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  {...form.register('domain')}
                  placeholder="example.com"
                  disabled={isLoading}
                />
                {form.formState.errors.domain && <p className="text-sm text-destructive">{form.formState.errors.domain.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type</Label>
                 <Controller
                    name="recordType"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <SelectTrigger id="recordType"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {recordTypes.map(type => (
                             <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Lookup Records
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="lg:col-span-2">
            {isLoading && renderSkeleton()}

            {lookupResult && !isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Lookup Results for "{form.getValues('domain')}"</CardTitle>
                  <CardDescription>
                    Found {lookupResult.records.length} {form.getValues('recordType')} records.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lookupResult.error && !lookupResult.records.length ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Lookup Error</AlertTitle>
                      <AlertDescription>{lookupResult.error}</AlertDescription>
                    </Alert>
                  ) : lookupResult.records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-16">
                      <Globe className="h-12 w-12 mb-4" />
                      <h3 className="text-xl font-semibold">No Records Found</h3>
                      <p className="mt-1 max-w-sm">No {form.getValues('recordType')} records were found for this domain.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>TTL</TableHead>
                          <TableHead className="w-full">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lookupResult.records.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">{record.name}</TableCell>
                            <TableCell>{record.TTL}</TableCell>
                            <TableCell className="font-mono text-xs break-all">{record.data}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </>
  );
}
