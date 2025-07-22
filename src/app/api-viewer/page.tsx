
"use client";

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Download, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { downloadDataUri } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Helper to check for valid JSON
const tryJsonParse = (val: string) => {
    if (!val || val.trim() === '') return true; // Optional fields are valid
    try {
        JSON.parse(val);
        return true;
    } catch {
        return false;
    }
};

// Zod Schemas for Form Validation
const apiInfoSchema = z.object({
  title: z.string().min(1, 'API title is required.'),
  version: z.string().min(1, 'API version is required.'),
});

const parameterSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  in: z.enum(['query', 'header', 'path']).default('query'),
  description: z.string().optional(),
  required: z.boolean().default(false),
});

const requestBodySchema = z.object({
  contentType: z.string().default('application/json'),
  schema: z.string().optional().refine(tryJsonParse, { message: 'Schema must be valid JSON.' }),
});

const responseSchema = z.object({
  statusCode: z.string().regex(/^\d{3}$/, 'Must be a 3-digit status code.'),
  description: z.string().optional(),
  schema: z.string().optional().refine(tryJsonParse, { message: 'Schema must be valid JSON.' }),
});

const endpointSchema = z.object({
  path: z.string().min(1, 'Path is required.').startsWith('/', 'Path must start with a /'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']).default('GET'),
  summary: z.string().min(1, 'A short summary is required.'),
  parameters: z.array(parameterSchema),
  requestBody: requestBodySchema,
  responses: z.array(responseSchema),
});

const groupSchema = z.object({
    name: z.string().min(1, 'Group name is required.'),
    description: z.string().optional(),
    endpoints: z.array(endpointSchema).min(1, 'A group must have at least one endpoint.'),
});

const apiDefinitionSchema = z.object({
  info: apiInfoSchema,
  groups: z.array(groupSchema).min(1, 'At least one group is required.'),
});

type ApiDefinitionFormData = z.infer<typeof apiDefinitionSchema>;

const emptyEndpoint = {
    path: '/',
    method: 'GET' as const,
    summary: 'New Endpoint',
    parameters: [],
    requestBody: { contentType: 'application/json', schema: '' },
    responses: []
};

// --- Helper Functions ---
const getMethodClass = (method: string) => {
    switch (method) {
        case 'GET': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50';
        case 'POST': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50';
        case 'PUT': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50';
        case 'DELETE': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50';
        case 'PATCH': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/50';
        default: return 'text-gray-600 bg-gray-200 dark:text-gray-400 dark:bg-gray-900/50';
    }
};


// Main Component
export default function ApiViewerPage() {
    const { toast } = useToast();
    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ApiDefinitionFormData>({
        resolver: zodResolver(apiDefinitionSchema),
        defaultValues: {
            info: { title: 'My Awesome API', version: '1.0.0' },
            groups: [{
                name: 'User Management',
                description: 'Endpoints related to creating, reading, and updating users.',
                endpoints: [{
                    path: '/users',
                    method: 'GET',
                    summary: 'Get a list of users',
                    parameters: [{ name: 'limit', in: 'query', description: 'Number of items to return', required: false }],
                    requestBody: { contentType: 'application/json', schema: '' },
                    responses: [{ statusCode: '200', description: 'A list of users.', schema: '{\n  "type": "array",\n  "items": {\n    "type": "object"\n  }\n}' }],
                }],
            }]
        },
    });

    const { fields: groups, append: appendGroup, remove: removeGroup } = useFieldArray({
        control,
        name: 'groups',
    });
    
    const onExport = (data: ApiDefinitionFormData) => {
        try {
            // Helper to safely parse and stringify JSON
            const formatJsonSchema = (schemaString: string | undefined): string | undefined => {
                if (!schemaString || schemaString.trim() === '') return undefined;
                try {
                    return JSON.stringify(JSON.parse(schemaString), null, 2);
                } catch (e) {
                    console.error("Invalid JSON schema found:", schemaString, e);
                    return schemaString; 
                }
            };
            
            const postmanCollection = {
                info: {
                    _postman_id: uuidv4(),
                    name: data.info.title,
                    description: `Version: ${data.info.version}`,
                    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
                },
                item: data.groups.map(group => ({
                    name: group.name,
                    description: group.description || '',
                    item: group.endpoints.map(endpoint => {
                        const hasBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method);

                        const request = {
                            method: endpoint.method,
                            header: endpoint.parameters.filter(p => p.in === 'header').map(h => ({ key: h.name, value: '', description: h.description })),
                            body: (hasBody && endpoint.requestBody?.schema) ? {
                                mode: 'raw',
                                raw: formatJsonSchema(endpoint.requestBody.schema),
                                options: { raw: { language: 'json' } }
                            } : undefined,
                            url: {
                                raw: `{{baseUrl}}${endpoint.path}`,
                                host: ["{{baseUrl}}"],
                                path: endpoint.path.startsWith('/') ? endpoint.path.substring(1).split('/') : endpoint.path.split('/'),
                                query: endpoint.parameters.filter(p => p.in === 'query').map(q => ({ key: q.name, value: null, description: q.description }))
                            },
                            description: endpoint.summary,
                        };
                        return {
                            name: endpoint.summary,
                            request,
                            response: endpoint.responses.map(res => ({
                                name: `${res.statusCode} ${res.description || ''}`.trim(),
                                originalRequest: request,
                                status: res.description,
                                code: parseInt(res.statusCode, 10),
                                _postman_previewlanguage: 'json',
                                header: [{ key: 'Content-Type', value: 'application/json' }],
                                cookie: [],
                                body: formatJsonSchema(res.schema)
                            }))
                        };
                    })
                }))
            };

            const collectionJson = JSON.stringify(postmanCollection, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(collectionJson);
            const filename = `${data.info.title.replace(/\s+/g, '_')}_collection.json`;
            
            downloadDataUri(dataUri, filename);
            toast({ title: 'Export Successful!', description: 'Your Postman collection has been downloaded.' });
        } catch (e) {
            console.error("Export failed", e);
            toast({ title: 'Export Failed', description: 'Could not generate the collection file. Check for invalid JSON in your schemas.', variant: 'destructive' });
        }
    };

    return (
        <>
            <PageHeader
                title="API Structure Viewer"
                description="Visually design your API structure, organize endpoints into groups, and export it as a Postman collection."
            />
            <form onSubmit={handleSubmit(onExport)}>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="api-title">API Title</Label>
                                <Input id="api-title" {...register('info.title')} placeholder="e.g., Customer Orders API" />
                                {errors.info?.title && <p className="text-sm text-destructive">{errors.info.title.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="api-version">Version</Label>
                                <Input id="api-version" {...register('info.version')} placeholder="e.g., 1.0.0" />
                                {errors.info?.version && <p className="text-sm text-destructive">{errors.info.version.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {groups.map((group, groupIndex) => (
                           <GroupCard key={group.id} {...{ groupIndex, control, register, removeGroup, errors, watch }} />
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" onClick={() => appendGroup({ name: 'New Group', description: '', endpoints: [emptyEndpoint] })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Group
                        </Button>
                        <Button type="submit" size="lg">
                            <Download className="mr-2 h-4 w-4" /> Export to Postman
                        </Button>
                    </div>
                    {errors.groups?.root && <p className="text-sm text-destructive">{errors.groups.root.message}</p>}

                </div>
            </form>
        </>
    );
}

// --- Sub-components for better structure ---

function GroupCard({ groupIndex, control, register, removeGroup, errors, watch }: any) {
    const { fields: endpoints, append: appendEndpoint, remove: removeEndpoint } = useFieldArray({
        control,
        name: `groups.${groupIndex}.endpoints`,
    });
    
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div className="flex-grow space-y-1.5">
                    <CardTitle>Group</CardTitle>
                    <CardDescription>Organize a set of related endpoints.</CardDescription>
                </div>
                 <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(groupIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Group Name</Label>
                        <Input {...register(`groups.${groupIndex}.name`)} placeholder="e.g., Product API" />
                        {errors.groups?.[groupIndex]?.name && <p className="text-sm text-destructive">{errors.groups[groupIndex].name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Group Description (Optional)</Label>
                        <Input {...register(`groups.${groupIndex}.description`)} placeholder="A short description of the group" />
                    </div>
                </div>

                <Separator />
                
                <h3 className="text-lg font-semibold">Endpoints in this Group</h3>
                <Accordion type="multiple" className="w-full space-y-4">
                    {endpoints.map((endpoint, endpointIndex) => (
                        <EndpointAccordion 
                            key={endpoint.id} 
                            {...{groupIndex, endpointIndex, control, register, removeEndpoint, errors, watch}}
                        />
                    ))}
                </Accordion>
                {errors.groups?.[groupIndex]?.endpoints?.root && <p className="text-sm text-destructive">{errors.groups?.[groupIndex]?.endpoints?.root?.message}</p>}

            </CardContent>
            <CardFooter>
                 <Button type="button" variant="outline" onClick={() => appendEndpoint(emptyEndpoint)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Endpoint to Group
                </Button>
            </CardFooter>
        </Card>
    );
}


function EndpointAccordion({ groupIndex, endpointIndex, control, register, removeEndpoint, errors, watch }: any) {
    const endpointPath = `groups.${groupIndex}.endpoints.${endpointIndex}`;

    const { fields: params, append: appendParam, remove: removeParam } = useFieldArray({ control, name: `${endpointPath}.parameters` });
    const { fields: responses, append: appendResponse, remove: removeResponse } = useFieldArray({ control, name: `${endpointPath}.responses` });
    
    const methodValue = watch(`${endpointPath}.method`);
    const pathValue = watch(`${endpointPath}.path`);
    const summaryValue = watch(`${endpointPath}.summary`);
    
    return (
        <AccordionItem value={`item-${groupIndex}-${endpointIndex}`} className="border bg-card rounded-lg px-4">
            <div className="flex items-center">
                <AccordionTrigger className="flex-1 no-underline hover:no-underline gap-4">
                    <div className="flex items-center gap-4 text-left w-full">
                         <span className={cn('font-mono text-sm font-semibold px-2.5 py-1 rounded-md', getMethodClass(methodValue))}>{methodValue}</span>
                        <code className="text-sm font-semibold">{pathValue}</code>
                        <span className="text-muted-foreground text-sm truncate">{summaryValue}</span>
                    </div>
                </AccordionTrigger>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeEndpoint(endpointIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <AccordionContent className="pt-4">
                <div className="grid sm:grid-cols-8 gap-4 mb-4">
                     <div className="space-y-2 sm:col-span-2">
                        <Label>Method</Label>
                        <Controller control={control} name={`${endpointPath}.method`} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                                <SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem><SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem><SelectItem value="PATCH">PATCH</SelectItem><SelectItem value="OPTIONS">OPTIONS</SelectItem>
                            </SelectContent></Select>
                        )} />
                    </div>
                    <div className="space-y-2 sm:col-span-3">
                        <Label>Path</Label>
                        <Input {...register(`${endpointPath}.path`)} placeholder="/users/{id}" />
                    </div>
                     <div className="space-y-2 sm:col-span-3">
                        <Label>Summary</Label>
                        <Input {...register(`${endpointPath}.summary`)} placeholder="A short description" />
                    </div>
                </div>
                 {errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.path && <p className="text-sm text-destructive -mt-2 mb-2">{errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.path.message}</p>}
                 {errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.summary && <p className="text-sm text-destructive -mt-2 mb-2">{errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.summary.message}</p>}
                
                <Tabs defaultValue="parameters">
                    <TabsList>
                        <TabsTrigger value="parameters">Parameters</TabsTrigger>
                        <TabsTrigger value="requestBody">Request Body</TabsTrigger>
                        <TabsTrigger value="responses">Responses</TabsTrigger>
                    </TabsList>

                    <TabsContent value="parameters" className="mt-4">
                         <div className="space-y-4">
                            {params.map((param, pIndex) => (
                                <div key={param.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 bg-muted/50 rounded-lg">
                                    <Input {...register(`${endpointPath}.parameters.${pIndex}.name`)} placeholder="Name" className="sm:col-span-3" />
                                    <Controller control={control} name={`${endpointPath}.parameters.${pIndex}.in`} render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger className="sm:col-span-2"><SelectValue /></SelectTrigger><SelectContent>
                                            <SelectItem value="query">Query</SelectItem><SelectItem value="header">Header</SelectItem><SelectItem value="path">Path</SelectItem>
                                        </SelectContent></Select>
                                    )} />
                                    <Input {...register(`${endpointPath}.parameters.${pIndex}.description`)} placeholder="Description" className="sm:col-span-5" />
                                    <div className="flex items-center gap-2 sm:col-span-1">
                                      <Controller name={`${endpointPath}.parameters.${pIndex}.required`} control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
                                      <Label className="text-xs">Req.</Label>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeParam(pIndex)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <Button type="button" size="sm" variant="outline" onClick={() => appendParam({ name: '', in: 'query', description: '', required: false })}><PlusCircle className="mr-2 h-4 w-4" /> Add Parameter</Button>
                         </div>
                    </TabsContent>

                    <TabsContent value="requestBody" className="mt-4 space-y-2">
                        <Label>Request Body Schema (JSON)</Label>
                        <Textarea {...register(`${endpointPath}.requestBody.schema`)} placeholder='{ "type": "object", "properties": { "name": { "type": "string" } } }' className="font-mono h-40" />
                        {errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.requestBody?.schema && <p className="text-sm text-destructive">{errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.requestBody.schema.message}</p>}
                    </TabsContent>
                    
                    <TabsContent value="responses" className="mt-4">
                        <div className="space-y-4">
                            {responses.map((resp, rIndex) => (
                                <div key={resp.id} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                        <Input {...register(`${endpointPath}.responses.${rIndex}.statusCode`)} placeholder="Status Code" className="sm:col-span-2" />
                                        <Input {...register(`${endpointPath}.responses.${rIndex}.description`)} placeholder="Description" className="sm:col-span-9" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeResponse(rIndex)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                    {errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.responses?.[rIndex]?.statusCode && <p className="text-sm text-destructive">{errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.responses[rIndex].statusCode.message}</p>}
                                    <Textarea {...register(`${endpointPath}.responses.${rIndex}.schema`)} placeholder="Response body schema (JSON)..." className="font-mono h-24" />
                                    {errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.responses?.[rIndex]?.schema && <p className="text-sm text-destructive">{errors.groups?.[groupIndex]?.endpoints?.[endpointIndex]?.responses[rIndex].schema.message}</p>}
                                </div>
                            ))}
                            <Button type="button" size="sm" variant="outline" onClick={() => appendResponse({ statusCode: '200', description: '', schema: ''})}><PlusCircle className="mr-2 h-4 w-4" /> Add Response</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </AccordionContent>
        </AccordionItem>
    );
}
