
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Brush } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import ColorPicker from '@/components/color-picker';

interface ShadowState {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const ControlSlider = ({ label, value, onValueChange, min, max, step }: { label: string; value: number; onValueChange: (val: number) => void; min: number; max: number; step: number; }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor={label} className="capitalize">{label.replace(/-/g, ' ')}</Label>
            <span className="text-sm text-muted-foreground">{value}px</span>
        </div>
        <Slider id={label} value={[value]} onValueChange={v => onValueChange(v[0])} min={min} max={max} step={step} />
    </div>
);


export default function ShadowGeneratorPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('box-shadow');
    const [copied, setCopied] = useState(false);

    const [boxShadow, setBoxShadow] = useState<ShadowState>({
        offsetX: 5,
        offsetY: 5,
        blur: 15,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.5)',
        inset: false
    });
    
    const [textShadow, setTextShadow] = useState<Omit<ShadowState, 'spread' | 'inset'>>({
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        color: 'rgba(0, 0, 0, 0.7)'
    });

    const boxShadowCss = useMemo(() => {
        const { offsetX, offsetY, blur, spread, color, inset } = boxShadow;
        return `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
    }, [boxShadow]);

    const textShadowCss = useMemo(() => {
        const { offsetX, offsetY, blur, color } = textShadow;
        return `${offsetX}px ${offsetY}px ${blur}px ${color}`;
    }, [textShadow]);

    const handleCopy = () => {
        const cssToCopy = activeTab === 'box-shadow' ? `box-shadow: ${boxShadowCss};` : `text-shadow: ${textShadowCss};`;
        navigator.clipboard.writeText(cssToCopy);
        setCopied(true);
        toast({ title: "Copied CSS to clipboard!" });
        setTimeout(() => setCopied(false), 2000);
    };

  return (
    <>
      <PageHeader
        title="CSS Shadow Generator"
        description="Visually create and customize CSS for box-shadow and text-shadow properties."
      />
      
       <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8 items-start">
            {/* Preview and Code */}
            <div className="lg:sticky lg:top-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 w-full flex items-center justify-center bg-muted/50 rounded-lg p-8">
                        {activeTab === 'box-shadow' ? (
                            <div
                                className="w-48 h-48 bg-background rounded-2xl flex items-center justify-center text-muted-foreground transition-all duration-200"
                                style={{ boxShadow: boxShadowCss }}
                            >
                                Box Preview
                            </div>
                        ) : (
                            <h1
                                className="text-5xl font-extrabold text-card-foreground transition-all duration-200"
                                style={{ textShadow: textShadowCss }}
                            >
                                Text Preview
                            </h1>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>CSS Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <pre className="p-4 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap overflow-x-auto border">
                                <code>{activeTab === 'box-shadow' ? `box-shadow: ${boxShadowCss};` : `text-shadow: ${textShadowCss};`}</code>
                            </pre>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Controls</CardTitle>
                    <CardDescription>Adjust the settings for your shadow.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="box-shadow">Box Shadow</TabsTrigger>
                            <TabsTrigger value="text-shadow">Text Shadow</TabsTrigger>
                        </TabsList>
                        <TabsContent value="box-shadow" className="space-y-6 pt-6">
                            <ControlSlider label="Horizontal Offset" value={boxShadow.offsetX} onValueChange={v => setBoxShadow(s => ({ ...s, offsetX: v }))} min={-50} max={50} step={1} />
                            <ControlSlider label="Vertical Offset" value={boxShadow.offsetY} onValueChange={v => setBoxShadow(s => ({ ...s, offsetY: v }))} min={-50} max={50} step={1} />
                            <ControlSlider label="Blur Radius" value={boxShadow.blur} onValueChange={v => setBoxShadow(s => ({ ...s, blur: v }))} min={0} max={100} step={1} />
                            <ControlSlider label="Spread Radius" value={boxShadow.spread} onValueChange={v => setBoxShadow(s => ({ ...s, spread: v }))} min={-50} max={50} step={1} />
                            <ColorPicker label="Shadow Color" color={boxShadow.color} onChange={c => setBoxShadow(s => ({ ...s, color: c }))} />
                             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                               <Label htmlFor="inset-switch">Inset Shadow</Label>
                               <Switch id="inset-switch" checked={boxShadow.inset} onCheckedChange={c => setBoxShadow(s => ({ ...s, inset: c }))} />
                            </div>
                        </TabsContent>
                        <TabsContent value="text-shadow" className="space-y-6 pt-6">
                            <ControlSlider label="Horizontal Offset" value={textShadow.offsetX} onValueChange={v => setTextShadow(s => ({ ...s, offsetX: v }))} min={-20} max={20} step={1} />
                            <ControlSlider label="Vertical Offset" value={textShadow.offsetY} onValueChange={v => setTextShadow(s => ({ ...s, offsetY: v }))} min={-20} max={20} step={1} />
                            <ControlSlider label="Blur Radius" value={textShadow.blur} onValueChange={v => setTextShadow(s => ({ ...s, blur: v }))} min={0} max={40} step={1} />
                            <ColorPicker label="Shadow Color" color={textShadow.color} onChange={c => setTextShadow(s => ({ ...s, color: c }))} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
       </div>
    </>
  );
}
