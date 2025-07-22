
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { produce } from 'immer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import ColorPicker from '@/components/color-picker';
import { useToast } from '@/hooks/use-toast';
import {
  Square, Type, MinusCircle, Trash2, MousePointer2, Download, Upload
} from 'lucide-react';

// Element types
type ElementType = 'rectangle' | 'text' | 'button' | 'input';

interface BaseElement {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RectangleElement extends BaseElement {
  type: 'rectangle';
  backgroundColor: string;
}

interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
}

interface ButtonElement extends BaseElement {
    type: 'button';
    text: string;
    backgroundColor: string;
    textColor: string;
}

interface InputElement extends BaseElement {
    type: 'input';
    placeholder: string;
}

type WireframeElement = RectangleElement | TextElement | ButtonElement | InputElement;

let nextId = 1;

export default function WireframeCanvas() {
    const [elements, setElements] = useState<WireframeElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const { toast } = useToast();

    const selectedElement = elements.find(el => el.id === selectedElementId);

    const addElement = (type: ElementType) => {
        const newElement: WireframeElement = {
            id: nextId++,
            type: type,
            x: 50, y: 50,
            width: 150, height: 50,
            ...(type === 'rectangle' && { backgroundColor: '#e0e0e0' }),
            ...(type === 'text' && { text: 'Headline Text', fontSize: 24, color: '#000000' }),
            ...(type === 'button' && { text: 'Click Me', backgroundColor: '#3b82f6', textColor: '#ffffff', height: 40 }),
            ...(type === 'input' && { placeholder: 'Enter text...', height: 40 }),
        } as WireframeElement;
        setElements(produce(draft => {
            draft.push(newElement);
        }));
        setSelectedElementId(newElement.id);
    };
    
    const updateElement = (id: number, updates: Partial<WireframeElement>) => {
        setElements(produce(draft => {
            const index = draft.findIndex(el => el.id === id);
            if (index !== -1) {
                draft[index] = { ...draft[index], ...updates };
            }
        }));
    };
    
    const deleteElement = () => {
        if (selectedElementId === null) return;
        setElements(elements.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if ((e.target as SVGElement).id === 'canvas-bg') {
            setSelectedElementId(null);
        }
    };

    const handleElementMouseDown = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setSelectedElementId(id);
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || selectedElementId === null) return;
        
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;

        setElements(produce(draft => {
            const el = draft.find(elem => elem.id === selectedElementId);
            if (el) {
                el.x += dx;
                el.y += dy;
            }
        }));

        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId !== null) {
             const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                return;
            }
            e.preventDefault();
            deleteElement();
        }
    }, [selectedElementId, deleteElement]);
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
      <div className="flex h-[calc(100vh-10rem)] w-full bg-background text-foreground border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <Card className="w-56 flex-shrink-0 border-r rounded-none flex flex-col">
            <CardHeader>
                <CardTitle>Elements</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement('rectangle')}><Square className="mr-2 h-4 w-4" /> Rectangle</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement('text')}><Type className="mr-2 h-4 w-4" /> Text</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement('button')}><MinusCircle className="mr-2 h-4 w-4" /> Button</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addElement('input')}><Input className="mr-2 h-4 w-4 border-none p-0 focus-visible:ring-0" /> Input</Button>
            </CardContent>
             <CardHeader>
                <CardTitle>Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" disabled><Upload className="mr-2 h-4 w-4" /> Import</Button>
                <Button variant="outline" className="w-full" disabled><Download className="mr-2 h-4 w-4" /> Export</Button>
            </CardContent>
        </Card>

        {/* Canvas */}
        <main className="flex-1 bg-muted relative" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <svg id="canvas" width="100%" height="100%" onMouseDown={handleCanvasMouseDown}>
                <rect id="canvas-bg" width="100%" height="100%" fill="hsl(var(--muted))" />
                {elements.map(el => {
                    const isSelected = el.id === selectedElementId;
                    return (
                        <g key={el.id} transform={`translate(${el.x}, ${el.y})`} onMouseDown={(e) => handleElementMouseDown(e, el.id)} className="cursor-move">
                            {el.type === 'rectangle' && (
                                <rect width={el.width} height={el.height} fill={el.backgroundColor} stroke={isSelected ? '#3b82f6' : 'transparent'} strokeWidth="2" />
                            )}
                            {el.type === 'text' && (
                                <>
                                    <rect width={el.width} height={el.height} fill="transparent" />
                                    <text fontSize={el.fontSize} fill={el.color} y={el.fontSize} pointerEvents="none" style={{ userSelect: 'none' }}>{el.text}</text>
                                </>
                            )}
                             {el.type === 'button' && (
                                <>
                                    <rect width={el.width} height={el.height} fill={el.backgroundColor} rx="6" stroke={isSelected ? '#3b82f6' : 'transparent'} strokeWidth="2"/>
                                    <text x={el.width / 2} y={el.height / 2} textAnchor="middle" dy=".3em" fill={el.textColor} pointerEvents="none" style={{ userSelect: 'none' }}>{el.text}</text>
                                </>
                            )}
                            {el.type === 'input' && (
                                <>
                                    <rect width={el.width} height={el.height} fill="hsl(var(--background))" rx="6" stroke="hsl(var(--border))" strokeWidth="1" />
                                     <rect width={el.width} height={el.height} fill="transparent" stroke={isSelected ? '#3b82f6' : 'transparent'} strokeWidth="2" rx="6"/>
                                    <text x="10" y={el.height / 2} dy=".3em" fill="hsl(var(--muted-foreground))" pointerEvents="none" style={{ userSelect: 'none' }}>{el.placeholder}</text>
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>
        </main>
        
        {/* Properties Panel */}
        <Card className="w-72 flex-shrink-0 border-l rounded-none">
            <CardHeader>
                <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!selectedElement ? (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                        <MousePointer2 className="h-10 w-10 mb-2"/>
                        <p>Select an element to edit its properties.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center">
                            <Label className="capitalize text-muted-foreground">{selectedElement.type} Properties</Label>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={deleteElement}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2">
                           <div><Label>X</Label><Input type="number" value={Math.round(selectedElement.x)} onChange={e => updateElement(selectedElement.id, { x: +e.target.value })}/></div>
                           <div><Label>Y</Label><Input type="number" value={Math.round(selectedElement.y)} onChange={e => updateElement(selectedElement.id, { y: +e.target.value })}/></div>
                           <div><Label>Width</Label><Input type="number" value={selectedElement.width} onChange={e => updateElement(selectedElement.id, { width: +e.target.value })}/></div>
                           <div><Label>Height</Label><Input type="number" value={selectedElement.height} onChange={e => updateElement(selectedElement.id, { height: +e.target.value })}/></div>
                        </div>
                        
                        {selectedElement.type === 'rectangle' && (
                            <ColorPicker label="Background" color={selectedElement.backgroundColor} onChange={c => updateElement(selectedElement.id, { backgroundColor: c })} />
                        )}

                        {selectedElement.type === 'text' && (
                           <>
                             <Label>Text</Label>
                             <Textarea value={selectedElement.text} onChange={e => updateElement(selectedElement.id, { text: e.target.value })} />
                             <Label>Font Size</Label>
                             <Input type="number" value={selectedElement.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: +e.target.value })} />
                             <ColorPicker label="Color" color={selectedElement.color} onChange={c => updateElement(selectedElement.id, { color: c })} />
                           </>
                        )}
                        
                         {selectedElement.type === 'button' && (
                           <>
                             <Label>Text</Label>
                             <Input value={selectedElement.text} onChange={e => updateElement(selectedElement.id, { text: e.target.value })} />
                             <ColorPicker label="Background" color={selectedElement.backgroundColor} onChange={c => updateElement(selectedElement.id, { backgroundColor: c })} />
                             <ColorPicker label="Text Color" color={selectedElement.textColor} onChange={c => updateElement(selectedElement.id, { textColor: c })} />
                           </>
                        )}

                        {selectedElement.type === 'input' && (
                           <>
                             <Label>Placeholder</Label>
                             <Input value={selectedElement.placeholder} onChange={e => updateElement(selectedElement.id, { placeholder: e.target.value })} />
                           </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
      </div>
    );
}
