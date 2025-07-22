
"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dynamic from 'next/dynamic';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Share2, Download, PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const Mermaid = dynamic(() => import('@/components/mermaid'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />
});

// Zod Schema for form validation
const attributeSchema = z.object({
  name: z.string().min(1, "Attribute name cannot be empty."),
  type: z.string().optional(),
});

const classSchema = z.object({
  name: z.string().min(1, "Class name cannot be empty."),
  attributes: z.array(attributeSchema),
});

const relationshipSchema = z.object({
  source: z.string().min(1, "Source class is required."),
  target: z.string().min(1, "Target class is required."),
  type: z.enum(['inheritance', 'composition', 'aggregation', 'association']),
  label: z.string().optional(),
});

const diagramSchema = z.object({
  classes: z.array(classSchema).min(1, "You must define at least one class."),
  relationships: z.array(relationshipSchema),
});

type DiagramFormData = z.infer<typeof diagramSchema>;

export default function ClassDiagramGeneratorPage() {
    const [mermaidSyntax, setMermaidSyntax] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<DiagramFormData>({
        resolver: zodResolver(diagramSchema),
        defaultValues: {
            classes: [{ name: 'MyClass', attributes: [{ name: 'myAttribute', type: 'string' }] }],
            relationships: [],
        },
    });

    const { fields: classes, append: appendClass, remove: removeClass } = useFieldArray({ control, name: "classes" });
    const { fields: relationships, append: appendRelationship, remove: removeRelationship } = useFieldArray({ control, name: "relationships" });

    const watchedClasses = watch('classes');
    const classNames = watchedClasses.map(c => c.name).filter(Boolean);

    const generateMermaidSyntax = (data: DiagramFormData): string => {
      let syntax = 'classDiagram\n';

      data.classes.forEach(cls => {
        if (!cls.name) return;
        syntax += `  class ${cls.name.replace(/\s+/g, '_')} {\n`;
        cls.attributes.forEach(attr => {
          if (attr.name) {
            syntax += `    ${attr.type ? `${attr.type} ` : ''}${attr.name.replace(/\s+/g, '_')}\n`;
          }
        });
        syntax += '  }\n';
      });

      const relMap = {
        inheritance: '<|--',
        composition: '*--',
        aggregation: 'o--',
        association: '-->',
      };
      
      data.relationships.forEach(rel => {
        if (rel.source && rel.target && rel.type) {
          const sourceName = rel.source.replace(/\s+/g, '_');
          const targetName = rel.target.replace(/\s+/g, '_');
          syntax += `  ${sourceName} ${relMap[rel.type]} ${targetName}${rel.label ? ` : "${rel.label}"` : ''}\n`;
        }
      });

      return syntax;
    };
    
    const onGenerate = (data: DiagramFormData) => {
        setIsGenerating(true);
        setMermaidSyntax('');
        try {
            const syntax = generateMermaidSyntax(data);
            setMermaidSyntax(syntax);
            toast({ title: 'Diagram Syntax Generated!' });
        } catch (e) {
            console.error("Mermaid syntax generation error:", e);
            toast({
                title: "Syntax Generation Error",
                description: "There was an issue generating the diagram syntax.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleDownload = (svgData: string) => {
        if (!svgData) return;
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'class-diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <PageHeader
                title="Class Diagram Generator"
                description="Define your classes, attributes, and relationships to generate a visual diagram."
            />
            <div className="grid gap-8 md:grid-cols-2">
                {/* Input Card */}
                <Card className="shadow-lg">
                    <form onSubmit={handleSubmit(onGenerate)}>
                        <CardHeader>
                            <CardTitle>Diagram Definition</CardTitle>
                            <CardDescription>Add classes and their relationships below.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Classes Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Classes</h3>
                                <div className="space-y-4">
                                    {classes.map((classField, classIndex) => (
                                        <Card key={classField.id} className="p-4 bg-muted/50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1 w-full pr-2">
                                                    <Label htmlFor={`classes[${classIndex}].name`}>Class Name</Label>
                                                    <Input {...register(`classes.${classIndex}.name`)} placeholder="e.g., User" />
                                                    {errors.classes?.[classIndex]?.name && <p className="text-sm text-destructive">{errors.classes[classIndex].name.message}</p>}
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeClass(classIndex)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <h4 className="text-sm font-medium mb-2">Attributes</h4>
                                            <AttributeArray control={control} classIndex={classIndex} register={register}/>
                                        </Card>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendClass({ name: '', attributes: [] })} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Class</Button>
                            </div>

                            <Separator />
                            
                            {/* Relationships Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Relationships</h3>
                                <div className="space-y-4">
                                    {relationships.map((relField, relIndex) => (
                                        <Card key={relField.id} className="p-4 bg-muted/50">
                                           <div className="grid grid-cols-[1fr,1fr] gap-4">
                                               {/* Source and Target */}
                                               <div className="space-y-1">
                                                    <Label>Source</Label>
                                                    <Controller control={control} name={`relationships.${relIndex}.source`} render={({ field }) => (
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{classNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select>
                                                    )} />
                                               </div>
                                               <div className="space-y-1">
                                                    <Label>Target</Label>
                                                    <Controller control={control} name={`relationships.${relIndex}.target`} render={({ field }) => (
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{classNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select>
                                                    )} />
                                               </div>
                                               {/* Type and Label */}
                                               <div className="space-y-1">
                                                    <Label>Type</Label>
                                                     <Controller control={control} name={`relationships.${relIndex}.type`} render={({ field }) => (
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                                                            <SelectItem value="association">Association</SelectItem>
                                                            <SelectItem value="inheritance">Inheritance</SelectItem>
                                                            <SelectItem value="composition">Composition</SelectItem>
                                                            <SelectItem value="aggregation">Aggregation</SelectItem>
                                                        </SelectContent></Select>
                                                     )} />
                                               </div>
                                               <div className="space-y-1">
                                                    <Label>Label (Optional)</Label>
                                                    <Input {...register(`relationships.${relIndex}.label`)} placeholder="e.g., places" />
                                               </div>
                                           </div>
                                            <div className="flex justify-end mt-2">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeRelationship(relIndex)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendRelationship({ source: '', target: '', type: 'association', label: '' })} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Relationship</Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isGenerating} className="w-full">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                                Generate Diagram
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Output Card */}
                <Card className="shadow-lg">
                     <Mermaid chart={mermaidSyntax} onDownload={handleDownload}/>
                </Card>
            </div>
        </>
    );
}


// Sub-component for managing attributes to keep main component cleaner
function AttributeArray({ classIndex, control, register }: { classIndex: number, control: any, register: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `classes.${classIndex}.attributes`
    });

    return (
        <div className="space-y-2">
            {fields.map((item, attrIndex) => (
                <div key={item.id} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor={`classes.${classIndex}.attributes.${attrIndex}.name`} className="text-xs">Name</Label>
                        <Input {...register(`classes.${classIndex}.attributes.${attrIndex}.name`)} placeholder="id" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <Label htmlFor={`classes.${classIndex}.attributes.${attrIndex}.type`} className="text-xs">Type</Label>
                        <Input {...register(`classes.${classIndex}.attributes.${attrIndex}.type`)} placeholder="string" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(attrIndex)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', type: '' })} className="mt-2 text-xs h-7"><PlusCircle className="mr-1 h-3 w-3" /> Add Attribute</Button>
        </div>
    );
}
