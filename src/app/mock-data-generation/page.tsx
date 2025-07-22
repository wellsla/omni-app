
"use client";

import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateMockData, type GenerateMockDataInput } from '@/ai/flows/generate-mock-data';
import { generateSqlInserts, type GenerateSqlInsertsInput } from '@/ai/flows/generate-sql-inserts';
import { generateSqlUpdates, type GenerateSqlUpdatesInput } from '@/ai/flows/generate-sql-updates';
import { Loader2, Copy, ListPlus, Database, PlusCircle, Trash2, Edit } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// --- Simple List Generation ---
const simpleListSchema = z.object({
  dataType: z.string().min(1, "Data type is required."),
  count: z.coerce.number().int().min(1, "Count must be at least 1.").max(50, "Count must be 50 or less."),
});
type SimpleListFormData = z.infer<typeof simpleListSchema>;

const simpleDataTypes = [
  { value: "full name", label: "Full Names" },
  { value: "address", label: "Addresses" },
  { value: "email", label: "Email Addresses" },
  { value: "phone number", label: "Phone Numbers" },
  { value: "company name", label: "Company Names" },
  { value: "job title", label: "Job Titles" },
  { value: "city", label: "Cities" },
  { value: "country", label: "Countries" },
];

// --- SQL INSERT Generation ---
const sqlInsertSchema = z.object({
    tableName: z.string().min(1, "Table name is required.").regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid table name format."),
    sqlDialect: z.enum(['postgresql', 'mysql', 'mssql']),
    count: z.coerce.number().int().min(1, "At least one row is required.").max(50, "Max 50 rows."),
    fields: z.array(z.object({
        name: z.string().min(1, "Column name is required.").regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid column name format."),
        type: z.string().min(1, "Data type is required."),
    })).min(1, "At least one column is required."),
});
type SqlInsertFormData = z.infer<typeof sqlInsertSchema>;


// --- SQL UPDATE Generation ---
const sqlUpdateSchema = z.object({
    tableName: z.string().min(1, "Table name is required.").regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid table name format."),
    sqlDialect: z.enum(['postgresql', 'mysql', 'mssql']),
    count: z.coerce.number().int().min(1, "At least one row is required.").max(50, "Max 50 rows."),
    whereClause: z.string().min(1, "WHERE clause is required."),
    fields: z.array(z.object({
        name: z.string().min(1, "Column name is required.").regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid column name format."),
        type: z.string().min(1, "Data type is required."),
    })).min(1, "At least one column to update is required."),
});
type SqlUpdateFormData = z.infer<typeof sqlUpdateSchema>;

const sqlDataTypes = [
  { value: 'full name', label: 'Full Name' },
  { value: 'first name', label: 'First Name' },
  { value: 'last name', label: 'Last Name' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone number', label: 'Phone Number' },
  { value: 'street address', label: 'Street Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'country', label: 'Country' },
  { value: 'zip code', label: 'Zip Code' },
  { value: 'company name', label: 'Company Name' },
  { value: 'job title', label: 'Job Title' },
  { value: 'uuid', label: 'UUID' },
  { value: 'date (YYYY-MM-DD)', label: 'Date' },
  { value: 'timestamp', label: 'Timestamp' },
  { value: 'random integer (1-100)', label: 'Integer (1-100)' },
  { value: 'random float (0-1)', label: 'Float (0-1)' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'url', label: 'URL' },
  { value: 'paragraph', label: 'Paragraph' },
];


export default function MockDataGenerationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<string[]>([]);
  const [generatedSqlInserts, setGeneratedSqlInserts] = useState<string>('');
  const [generatedSqlUpdates, setGeneratedSqlUpdates] = useState<string>('');
  const { toast } = useToast();

  // --- Form Hooks ---
  const simpleListForm = useForm<SimpleListFormData>({
    resolver: zodResolver(simpleListSchema),
    defaultValues: { dataType: 'full name', count: 10 },
  });

  const sqlInsertForm = useForm<SqlInsertFormData>({
    resolver: zodResolver(sqlInsertSchema),
    defaultValues: {
      tableName: 'users',
      sqlDialect: 'postgresql',
      count: 10,
      fields: [{ name: 'id', type: 'uuid' }, { name: 'name', type: 'full name' }, { name: 'email', type: 'email' }],
    },
  });
  const { fields: insertFields, append: appendInsert, remove: removeInsert } = useFieldArray({
    control: sqlInsertForm.control,
    name: "fields"
  });

  const sqlUpdateForm = useForm<SqlUpdateFormData>({
    resolver: zodResolver(sqlUpdateSchema),
    defaultValues: {
      tableName: 'products',
      sqlDialect: 'postgresql',
      count: 5,
      whereClause: 'id = {{uuid}}',
      fields: [{ name: 'price', type: 'random integer (10-1000)' }, { name: 'stock_quantity', type: 'random integer (0-100)' }],
    },
  });
  const { fields: updateFields, append: appendUpdate, remove: removeUpdate } = useFieldArray({
    control: sqlUpdateForm.control,
    name: "fields"
  });


  // --- Handlers ---
  const handleSimpleListSubmit = async (data: SimpleListFormData) => {
    setIsLoading(true);
    setGeneratedData([]);
    try {
      const input: GenerateMockDataInput = { dataType: data.dataType, count: data.count };
      const result = await generateMockData(input);
      if (result && result.mockData) {
        setGeneratedData(result.mockData);
        toast({ title: "Data Generated", description: `${result.mockData.length} items of ${data.dataType} generated.` });
      } else {
        throw new Error("Failed to generate data or no data returned.");
      }
    } catch (error) {
      console.error("Mock data generation error:", error);
      toast({ title: "Generation Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSqlInsertSubmit = async (data: SqlInsertFormData) => {
    setIsLoading(true);
    setGeneratedSqlInserts('');
    try {
        const input: GenerateSqlInsertsInput = data;
        const result = await generateSqlInserts(input);
        if (result && result.sqlScript) {
            setGeneratedSqlInserts(result.sqlScript);
            toast({ title: "SQL Generated", description: `Generated ${data.count} INSERT statements for ${data.tableName}.` });
        } else {
            throw new Error("Failed to generate SQL or no script returned.");
        }
    } catch (error) {
        console.error("SQL generation error:", error);
        toast({ title: "Generation Error", description: (error as Error).message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSqlUpdateSubmit = async (data: SqlUpdateFormData) => {
    setIsLoading(true);
    setGeneratedSqlUpdates('');
    try {
        const input: GenerateSqlUpdatesInput = data;
        const result = await generateSqlUpdates(input);
        if (result && result.sqlScript) {
            setGeneratedSqlUpdates(result.sqlScript);
            toast({ title: "SQL Generated", description: `Generated ${data.count} UPDATE statements for ${data.tableName}.` });
        } else {
            throw new Error("Failed to generate SQL or no script returned.");
        }
    } catch (error) {
        console.error("SQL update generation error:", error);
        toast({ title: "Generation Error", description: (error as Error).message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (content: string, type: 'List' | 'SQL') => {
    if (content) {
      navigator.clipboard.writeText(content)
        .then(() => toast({ title: "Copied to Clipboard", description: `Generated ${type} copied.` }))
        .catch(err => toast({ title: "Copy Failed", description: "Could not copy data to clipboard.", variant: "destructive" }));
    }
  };

  return (
    <>
      <PageHeader
        title="Mock Data Generator"
        description="Quickly generate various types of mock data for projects, from simple lists to complete SQL scripts."
      />
      <Tabs defaultValue="simple-list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simple-list">Simple List</TabsTrigger>
          <TabsTrigger value="sql-generator">SQL INSERTs</TabsTrigger>
          <TabsTrigger value="sql-update-generator">SQL UPDATEs</TabsTrigger>
        </TabsList>

        {/* --- Simple List Generator Tab --- */}
        <TabsContent value="simple-list">
           <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-1">
                <form onSubmit={simpleListForm.handleSubmit(handleSimpleListSubmit)}>
                    <CardHeader>
                    <CardTitle>Generate Simple List</CardTitle>
                    <CardDescription>Select data type and quantity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="dataType">Data Type</Label>
                        <Controller name="dataType" control={simpleListForm.control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="dataType"><SelectValue placeholder="Select data type" /></SelectTrigger>
                            <SelectContent>
                                {simpleDataTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        )} />
                        {simpleListForm.formState.errors.dataType && <p className="text-sm text-destructive">{simpleListForm.formState.errors.dataType.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="count">Number of Items</Label>
                        <Controller name="count" control={simpleListForm.control} render={({ field }) => <Input id="count" type="number" {...field} />} />
                        {simpleListForm.formState.errors.count && <p className="text-sm text-destructive">{simpleListForm.formState.errors.count.message}</p>}
                    </div>
                    </CardContent>
                    <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Data'}
                    </Button>
                    </CardFooter>
                </form>
                </Card>

                <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                    <CardTitle>Generated Data</CardTitle>
                    <CardDescription>Review and copy your generated mock data.</CardDescription>
                    </div>
                    {generatedData.length > 0 && <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(generatedData.join('\n'), 'List')}><Copy className="mr-2 h-4 w-4" /> Copy All</Button>}
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="space-y-3 p-4 border rounded-md animate-pulse">
                            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                        </div>
                    )}
                    {!isLoading && generatedData.length === 0 && <div className="flex flex-col items-center justify-center h-60 text-muted-foreground"><ListPlus className="h-12 w-12 mb-2" /><p>Generated data will appear here.</p></div>}
                    {!isLoading && generatedData.length > 0 && (
                    <ScrollArea className="h-80 w-full rounded-md border p-4">
                        <ul className="space-y-1">
                        {generatedData.map((item, index) => <li key={index} className="text-sm p-1 bg-secondary/30 rounded font-mono">{item}</li>)}
                        </ul>
                    </ScrollArea>
                    )}
                </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- SQL INSERT Generator Tab --- */}
        <TabsContent value="sql-generator">
          <div className="grid gap-8 md:grid-cols-2">
            {/* --- SQL Config --- */}
            <Card>
              <form onSubmit={sqlInsertForm.handleSubmit(handleSqlInsertSubmit)}>
                <CardHeader>
                  <CardTitle>SQL Schema Configuration</CardTitle>
                  <CardDescription>Define your table, columns, and dialect to generate INSERT statements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tableName">Table Name</Label>
                      <Controller name="tableName" control={sqlInsertForm.control} render={({ field }) => <Input id="tableName" placeholder="e.g., users" {...field} />} />
                      {sqlInsertForm.formState.errors.tableName && <p className="text-sm text-destructive">{sqlInsertForm.formState.errors.tableName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sqlDialect">SQL Dialect</Label>
                      <Controller name="sqlDialect" control={sqlInsertForm.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="sqlDialect"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="mssql">Microsoft SQL</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                  </div>
                  
                  <Separator />

                  <div>
                     <Label>Columns</Label>
                     <div className="space-y-4 mt-2">
                        {insertFields.map((field, index) => (
                          <div key={field.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor={`fields[${index}].name`} className="text-xs">Column Name</Label>
                                    <Controller name={`fields.${index}.name`} control={sqlInsertForm.control} render={({ field }) => <Input placeholder="e.g., first_name" {...field} />} />
                                </div>
                                <div className="space-y-1">
                                <Label htmlFor={`fields[${index}].type`} className="text-xs">Data Type</Label>
                                    <Controller name={`fields.${index}.type`} control={sqlInsertForm.control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            {sqlDataTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                        </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeInsert(index)} aria-label="Remove column">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                            {sqlInsertForm.formState.errors.fields?.[index]?.name && <p className="text-sm text-destructive">{sqlInsertForm.formState.errors.fields?.[index]?.name?.message}</p>}
                            {sqlInsertForm.formState.errors.fields?.[index]?.type && <p className="text-sm text-destructive">{sqlInsertForm.formState.errors.fields?.[index]?.type?.message}</p>}
                          </div>
                        ))}
                     </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => appendInsert({ name: '', type: '' })} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Column</Button>
                  </div>
                   <div className="space-y-2">
                        <Label htmlFor="sql-insert-count">Number of Rows</Label>
                        <Controller name="count" control={sqlInsertForm.control} render={({ field }) => <Input id="sql-insert-count" type="number" {...field} />} />
                        {sqlInsertForm.formState.errors.count && <p className="text-sm text-destructive">{sqlInsertForm.formState.errors.count.message}</p>}
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate INSERTs
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* --- SQL Results --- */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                    <CardTitle>Generated INSERTs</CardTitle>
                    <CardDescription>Review and copy the generated statements.</CardDescription>
                    </div>
                    {generatedSqlInserts && <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(generatedSqlInserts, 'SQL')}><Copy className="mr-2 h-4 w-4" /> Copy SQL</Button>}
                </CardHeader>
                <CardContent>
                    {isLoading && !generatedSqlUpdates && (
                        <div className="space-y-2 p-4 border rounded-md animate-pulse">
                            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                        </div>
                    )}
                    {!isLoading && !generatedSqlInserts && <div className="flex flex-col items-center justify-center h-60 text-muted-foreground"><Database className="h-12 w-12 mb-2" /><p>SQL script will appear here.</p></div>}
                    {!isLoading && generatedSqlInserts && <ScrollArea className="h-96 w-full rounded-md border"><pre className="p-4 text-sm font-mono whitespace-pre-wrap">{generatedSqlInserts}</pre><ScrollBar orientation="horizontal" /></ScrollArea>}
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* --- SQL UPDATE Generator Tab --- */}
        <TabsContent value="sql-update-generator">
          <div className="grid gap-8 md:grid-cols-2">
            {/* --- SQL UPDATE Config --- */}
            <Card>
              <form onSubmit={sqlUpdateForm.handleSubmit(handleSqlUpdateSubmit)}>
                <CardHeader>
                  <CardTitle>SQL UPDATE Configuration</CardTitle>
                  <CardDescription>Define your table, SET fields, and WHERE clause to generate UPDATEs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="updateTableName">Table Name</Label>
                      <Controller name="tableName" control={sqlUpdateForm.control} render={({ field }) => <Input id="updateTableName" placeholder="e.g., products" {...field} />} />
                      {sqlUpdateForm.formState.errors.tableName && <p className="text-sm text-destructive">{sqlUpdateForm.formState.errors.tableName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="updateSqlDialect">SQL Dialect</Label>
                      <Controller name="sqlDialect" control={sqlUpdateForm.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="updateSqlDialect"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="mssql">Microsoft SQL</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="whereClause">WHERE Clause Template</Label>
                      <Controller name="whereClause" control={sqlUpdateForm.control} render={({ field }) => <Input id="whereClause" placeholder="e.g., id = {{uuid}} or status = 'active'" {...field} />} />
                      <p className="text-xs text-muted-foreground">Use placeholders like <code className="bg-muted px-1 rounded font-mono">{'{{uuid}}'}</code> or <code className="bg-muted px-1 rounded font-mono">{'{{row_index}}'}</code>.</p>
                      {sqlUpdateForm.formState.errors.whereClause && <p className="text-sm text-destructive">{sqlUpdateForm.formState.errors.whereClause.message}</p>}
                    </div>
                  
                  <Separator />

                  <div>
                     <Label>Columns to SET</Label>
                     <div className="space-y-4 mt-2">
                        {updateFields.map((field, index) => (
                           <div key={field.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor={`updateFields[${index}].name`} className="text-xs">Column Name</Label>
                                    <Controller name={`fields.${index}.name`} control={sqlUpdateForm.control} render={({ field }) => <Input placeholder="e.g., price" {...field} />} />
                                </div>
                                <div className="space-y-1">
                                   <Label htmlFor={`updateFields[${index}].type`} className="text-xs">New Data Type</Label>
                                    <Controller name={`fields.${index}.type`} control={sqlUpdateForm.control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            {sqlDataTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                        </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeUpdate(index)} aria-label="Remove column">
                                   <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                                {sqlUpdateForm.formState.errors.fields?.[index]?.name && <p className="text-sm text-destructive">{sqlUpdateForm.formState.errors.fields?.[index]?.name?.message}</p>}
                                {sqlUpdateForm.formState.errors.fields?.[index]?.type && <p className="text-sm text-destructive">{sqlUpdateForm.formState.errors.fields?.[index]?.type?.message}</p>}
                          </div>
                        ))}
                     </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => appendUpdate({ name: '', type: '' })} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Column</Button>
                  </div>
                   <div className="space-y-2">
                        <Label htmlFor="sql-update-count">Number of Statements</Label>
                        <Controller name="count" control={sqlUpdateForm.control} render={({ field }) => <Input id="sql-update-count" type="number" {...field} />} />
                        {sqlUpdateForm.formState.errors.count && <p className="text-sm text-destructive">{sqlUpdateForm.formState.errors.count.message}</p>}
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate UPDATEs
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* --- SQL UPDATE Results --- */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                    <CardTitle>Generated UPDATEs</CardTitle>
                    <CardDescription>Review and copy the generated statements.</CardDescription>
                    </div>
                    {generatedSqlUpdates && <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(generatedSqlUpdates, 'SQL')}><Copy className="mr-2 h-4 w-4" /> Copy SQL</Button>}
                </CardHeader>
                <CardContent>
                    {isLoading && !generatedSqlInserts && (
                        <div className="space-y-2 p-4 border rounded-md animate-pulse">
                            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                        </div>
                    )}
                    {!isLoading && !generatedSqlUpdates && <div className="flex flex-col items-center justify-center h-60 text-muted-foreground"><Edit className="h-12 w-12 mb-2" /><p>SQL script will appear here.</p></div>}
                    {!isLoading && generatedSqlUpdates && <ScrollArea className="h-96 w-full rounded-md border"><pre className="p-4 text-sm font-mono whitespace-pre-wrap">{generatedSqlUpdates}</pre><ScrollBar orientation="horizontal" /></ScrollArea>}
                </CardContent>
             </Card>
          </div>
        </TabsContent>

      </Tabs>
    </>
  );
}
    
