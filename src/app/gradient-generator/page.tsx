
"use client";

import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ColorStop {
  id: number;
  color: string;
  position: number;
}

const newColorStop = (id: number, color: string, position: number): ColorStop => ({ id, color, position });

export default function GradientGeneratorPage() {
  const { toast } = useToast();
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(90);
  const [colors, setColors] = useState<ColorStop[]>([
    newColorStop(1, '#6366f1', 0),
    newColorStop(2, '#ec4899', 100),
  ]);
  const [copied, setCopied] = useState(false);

  const addColor = () => {
    if (colors.length >= 10) {
        toast({ title: 'Color Limit Reached', description: 'You can add a maximum of 10 colors.', variant: 'destructive' });
        return;
    }
    const newId = colors.length > 0 ? Math.max(...colors.map(c => c.id)) + 1 : 1;
    const lastColor = colors[colors.length-1];
    const newPosition = Math.min(100, lastColor.position + Math.round(100 / (colors.length+1)));
    
    setColors([...colors, newColorStop(newId, '#ffffff', newPosition)].sort((a,b) => a.position - b.position));
  };

  const removeColor = (id: number) => {
    if (colors.length <= 2) {
        toast({ title: 'Minimum Colors Required', description: 'A gradient needs at least 2 colors.', variant: 'destructive' });
        return;
    }
    setColors(colors.filter(c => c.id !== id));
  };

  const handleColorChange = (id: number, property: keyof Omit<ColorStop, 'id'>, value: any) => {
    const updatedColors = produce(colors, draft => {
        const color = draft.find(c => c.id === id);
        if (color) {
            (color as any)[property] = value;
        }
    });
    // Create a new sorted array from the updated one before setting state
    const sortedColors = [...updatedColors].sort((a, b) => a.position - b.position);
    setColors(sortedColors);
  };
  
  const gradientCss = useMemo(() => {
    const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ');
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${colorStops})`;
    }
    return `radial-gradient(circle, ${colorStops})`;
  }, [colors, gradientType, angle]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`background: ${gradientCss};`);
    setCopied(true);
    toast({ title: "Copied CSS to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <PageHeader
        title="CSS Gradient Generator"
        description="Visually create, customize, and copy beautiful CSS gradients for your projects."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8 items-start">
        {/* Preview */}
        <div className="lg:sticky lg:top-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="h-96 w-full rounded-lg border shadow-inner"
                        style={{ background: gradientCss }}
                    />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>CSS Output</CardTitle>
                    <CardDescription>Copy the generated CSS code below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <pre className="p-4 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap overflow-x-auto border">
                            <code>{`background: ${gradientCss};`}</code>
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
            <CardDescription>Adjust the settings to build your gradient.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label>Gradient Type</Label>
              <Select value={gradientType} onValueChange={setGradientType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {gradientType === 'linear' && (
              <div className="space-y-4">
                 <Label>Angle ({angle}°)</Label>
                 <Slider value={[angle]} onValueChange={v => setAngle(v[0])} min={0} max={360} step={1} />
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Color Stops</Label>
                    <Button variant="outline" size="sm" onClick={addColor}><Plus className="h-4 w-4 mr-2" /> Add Color</Button>
                </div>
                 <ScrollArea className="h-full max-h-[400px]">
                    <div className="space-y-4 pr-4">
                    {colors.map(colorStop => (
                        <div key={colorStop.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor={`color-${colorStop.id}`}>Color</Label>
                                <div className="flex items-center gap-2">
                                     <Input 
                                        type="text" 
                                        className="w-24 h-8"
                                        value={colorStop.color}
                                        onChange={(e) => handleColorChange(colorStop.id, 'color', e.target.value)}
                                    />
                                    <Input
                                        id={`color-${colorStop.id}`}
                                        type="color"
                                        className="h-8 w-10 p-1 bg-transparent border-none cursor-pointer"
                                        value={colorStop.color}
                                        onChange={(e) => handleColorChange(colorStop.id, 'color', e.target.value)}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeColor(colorStop.id)} disabled={colors.length <= 2}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Position ({colorStop.position}%)</Label>
                                <Slider value={[colorStop.position]} onValueChange={v => handleColorChange(colorStop.id, 'position', v[0])} min={0} max={100} step={1} />
                            </div>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
