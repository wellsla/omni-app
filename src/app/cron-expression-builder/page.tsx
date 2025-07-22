
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { produce } from 'immer';
import cronstrue from 'cronstrue';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type CronPart = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

interface CronState {
  minute: { type: 'every' | 'specific'; values: number[] };
  hour: { type: 'every' | 'specific'; values: number[] };
  dayOfMonth: { type: 'every' | 'specific'; values: number[] };
  month: { type: 'every' | 'specific'; values: number[] };
  dayOfWeek: { type: 'every' | 'specific'; values: number[] };
}

const initialState: CronState = {
  minute: { type: 'every', values: [] },
  hour: { type: 'every', values: [] },
  dayOfMonth: { type: 'every', values: [] },
  month: { type: 'every', values: [] },
  dayOfWeek: { type: 'every', values: [] },
};

const toCronPart = (part: { type: 'every' | 'specific'; values: number[] }) => {
  if (part.type === 'every' || part.values.length === 0) return '*';
  return part.values.sort((a,b) => a - b).join(',');
};

const NumberGrid = ({ title, max, selected, onToggle, labels, startFrom = 0 }: { title: string, max: number, selected: number[], onToggle: (n: number) => void, labels?: string[], startFrom?: number }) => (
    <div>
        <h4 className="font-semibold text-sm mb-2">{title}</h4>
        <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-12 gap-1">
            {Array.from({ length: max - startFrom + 1 }).map((_, i) => {
                const value = i + startFrom;
                return (
                    <label key={value} className={cn("flex items-center justify-center p-2 border rounded-md text-xs h-9 w-9 cursor-pointer transition-colors",
                      selected.includes(value) ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent/50'
                    )}>
                        <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="sr-only" />
                        {labels ? labels[i] : value}
                    </label>
                )
            })}
        </div>
    </div>
);

export default function CronExpressionBuilderPage() {
    const [state, setState] = useState<CronState>(initialState);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const cronExpression = useMemo(() => {
        return [
            toCronPart(state.minute),
            toCronPart(state.hour),
            toCronPart(state.dayOfMonth),
            toCronPart(state.month),
            toCronPart(state.dayOfWeek)
        ].join(' ');
    }, [state]);

    const humanReadable = useMemo(() => {
        try {
            return cronstrue.toString(cronExpression);
        } catch (e) {
            return e instanceof Error ? e.message : 'Invalid cron expression';
        }
    }, [cronExpression]);

    const handleTypeChange = (part: CronPart, type: 'every' | 'specific') => {
        setState(produce(draft => {
            draft[part].type = type;
        }));
    };
    
    const handleValueToggle = (part: CronPart, value: number) => {
        setState(produce(draft => {
            const values = draft[part].values;
            const index = values.indexOf(value);
            if (index > -1) {
                values.splice(index, 1);
            } else {
                values.push(value);
            }
        }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(cronExpression);
        setCopied(true);
        toast({ title: 'Copied cron expression!' });
        setTimeout(() => setCopied(false), 2000);
    };

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderTabContent = (part: CronPart, max: number, title: string, labels?: string[], startFrom?: number) => (
        <TabsContent value={part} className="space-y-4">
            <RadioGroup value={state[part].type} onValueChange={(v) => handleTypeChange(part, v as any)}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="every" id={`${part}-every`} /><Label htmlFor={`${part}-every`}>Every {title.toLowerCase()}</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="specific" id={`${part}-specific`} /><Label htmlFor={`${part}-specific`}>Specific {title.toLowerCase()}(s)</Label></div>
            </RadioGroup>
            {state[part].type === 'specific' && (
                <NumberGrid title={`Select ${title.toLowerCase()}(s)`} max={max} selected={state[part].values} onToggle={(v) => handleValueToggle(part, v)} labels={labels} startFrom={startFrom}/>
            )}
        </TabsContent>
    );

  return (
    <>
      <PageHeader
        title="Cron Expression Builder"
        description="Visually build and understand cron expressions for scheduling tasks."
      />

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Generated Expression</CardTitle>
            <CardDescription>Your cron expression and its human-readable translation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="relative">
                <Label htmlFor="cron-output">Cron Expression</Label>
                <Input id="cron-output" readOnly value={cronExpression} className="font-mono text-lg bg-muted pr-12 h-12" />
                <Button variant="ghost" size="icon" className="absolute right-2 top-6 h-8 w-8" onClick={handleCopy}>
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
             </div>
             <div>
                <Label>Meaning</Label>
                <p className="text-muted-foreground p-3 bg-muted rounded-md border text-sm">{humanReadable}</p>
             </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Expression Controls</CardTitle>
                <CardDescription>Select values for each part of the expression.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="minute" className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-5">
                        <TabsTrigger value="minute">Minute</TabsTrigger>
                        <TabsTrigger value="hour">Hour</TabsTrigger>
                        <TabsTrigger value="dayOfMonth">Day (Month)</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="dayOfWeek">Day (Week)</TabsTrigger>
                    </TabsList>
                    {renderTabContent('minute', 59, 'Minute')}
                    {renderTabContent('hour', 23, 'Hour')}
                    {renderTabContent('dayOfMonth', 31, 'Day of Month', undefined, 1)}
                    {renderTabContent('month', 12, 'Month', monthLabels, 1)}
                    {renderTabContent('dayOfWeek', 6, 'Day of Week', dayOfWeekLabels, 0)}
                </Tabs>
                <p className="text-xs text-muted-foreground mt-4">Note: Day of month and day of week are combined with an OR. Check your scheduler's documentation for specifics.</p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
