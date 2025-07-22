
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import ColorPicker from '@/components/color-picker';
import { useToast } from '@/hooks/use-toast';
import {
  Heading1, Type, Image as ImageIcon, MinusCircle, Divide, MousePointer2, Trash2, Download, Copy, Check, AlignLeft, AlignCenter, AlignRight, FilePenLine
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadDataUri } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Types ---
type Alignment = 'left' | 'center' | 'right';
type ElementType = 'heading' | 'text' | 'button' | 'image' | 'divider';

interface BaseElement {
  id: string;
  type: ElementType;
}
interface HeadingElement extends BaseElement { type: 'heading'; text: string; color: string; alignment: Alignment; }
interface TextElement extends BaseElement { type: 'text'; text: string; color: string; }
interface ButtonElement extends BaseElement { type: 'button'; text: string; href: string; backgroundColor: string; textColor: string; alignment: Alignment; }
interface ImageElement extends BaseElement { type: 'image'; src: string; alt: string; alignment: Alignment; width: number; }
interface DividerElement extends BaseElement { type: 'divider'; color: string; }

type DocumentElement = HeadingElement | TextElement | ButtonElement | ImageElement | DividerElement;

// --- Main Component ---
export default function DocumentBuilderPage() {
    const [elements, setElements] = useState<DocumentElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    
    const selectedElement = elements.find(el => el.id === selectedElementId);

    const addElement = (type: ElementType) => {
        const newElement: DocumentElement = {
            id: uuidv4(),
            type: type,
            ...{
                heading: { text: 'Headline Text', color: '#111827', alignment: 'left' },
                text: { text: 'This is a paragraph of text. You can edit this content in the properties panel.', color: '#374151' },
                button: { text: 'Click Here', href: '#', backgroundColor: '#3b82f6', textColor: '#ffffff', alignment: 'center' },
                image: { src: 'https://placehold.co/600x400', alt: 'Placeholder', alignment: 'center', width: 600 },
                divider: { color: '#cccccc' }
            }[type]
        } as DocumentElement;
        
        setElements(produce(draft => { draft.push(newElement); }));
        setSelectedElementId(newElement.id);
    };

    const updateElement = (id: string, updates: Partial<DocumentElement>) => {
        setElements(produce(draft => {
            const index = draft.findIndex(el => el.id === id);
            if (index !== -1) {
                draft[index] = { ...draft[index], ...updates };
            }
        }));
    };
    
    const deleteElement = useCallback(() => {
        if (selectedElementId === null) return;
        setElements(elements.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
    }, [selectedElementId, elements]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId !== null) {
            const activeElement = document.activeElement;
            // Prevent deletion while typing in an input/textarea
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
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

    const generateEmailHtml = () => {
        const bodyStyles = `font-family: Arial, sans-serif; line-height: 1.6; color: #333;`;
        const content = elements.map(el => {
             switch (el.type) {
                case 'heading':
                    return `<tr><td style="padding: 10px 0;"><h1 style="margin: 0; font-size: 28px; color: ${el.color}; text-align: ${el.alignment};">${el.text}</h1></td></tr>`;
                case 'text':
                    return `<tr><td style="padding: 10px 0;"><p style="margin: 0; font-size: 16px; color: ${el.color};">${el.text.replace(/\\n/g, '<br>')}</p></td></tr>`;
                case 'button':
                    return `<tr><td style="padding: 20px 0; text-align: ${el.alignment};"><a href="${el.href}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: ${el.textColor}; background-color: ${el.backgroundColor}; text-decoration: none; border-radius: 6px;">${el.text}</a></td></tr>`;
                case 'image':
                    return `<tr><td style="padding: 10px 0; text-align: ${el.alignment};"><img src="${el.src}" alt="${el.alt}" style="max-width: 100%; height: auto; display: inline-block; border: 0;" width="${el.width}"></td></tr>`;
                case 'divider':
                    return `<tr><td style="padding: 15px 0;"><hr style="border: 0; border-top: 1px solid ${el.color};"></td></tr>`;
                default:
                    return '';
            }
        }).join('');

        return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Your Document</title></head>
<body style="${bodyStyles}">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="max-width: 600px; margin: auto; background: #ffffff; border-collapse: collapse;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    };
    
    const handleExport = () => {
        const html = generateEmailHtml();
        handleCopy(html, "HTML copied to clipboard!");
    };

    const handleCopy = (content: string, message: string) => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast({ title: message });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <PageHeader
                title="Document Builder"
                description="Create and customize templates for emails and PDFs using modular content blocks."
            />
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 h-[calc(100vh-12rem)]">
                {/* Toolbar */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Content Blocks</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => addElement('heading')}><Heading1 className="mr-2 h-4 w-4" /> Heading</Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => addElement('text')}><Type className="mr-2 h-4 w-4" /> Text</Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => addElement('button')}><MinusCircle className="mr-2 h-4 w-4" /> Button</Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => addElement('image')}><ImageIcon className="mr-2 h-4 w-4" /> Image</Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => addElement('divider')}><Divide className="mr-2 h-4 w-4" /> Divider</Button>
                    </CardContent>
                    <div className="p-4 border-t">
                        <Button variant="default" className="w-full" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export as HTML</Button>
                    </div>
                </Card>

                {/* Canvas / Preview */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 rounded-b-lg overflow-hidden">
                        <ScrollArea className="h-full w-full bg-muted/50 rounded-md">
                           <div className="p-4">
                                <div className="w-full max-w-[600px] mx-auto bg-white shadow-lg">
                                    {elements.map(el => (
                                        <div key={el.id} onClick={() => setSelectedElementId(el.id)} className={cn('cursor-pointer relative p-2', selectedElementId === el.id && 'ring-2 ring-primary ring-offset-2')}>
                                            {renderElement(el)}
                                        </div>
                                    ))}
                                    {elements.length === 0 && (
                                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-96">
                                            <FilePenLine className="h-12 w-12 mb-4" />
                                            <p>Add content blocks from the left panel to start building.</p>
                                        </div>
                                    )}
                                </div>
                           </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Properties Panel */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader>
                        <CardTitle>Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        {!selectedElement ? (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full p-4">
                                <MousePointer2 className="h-10 w-10 mb-2" />
                                <p>Select an element on the canvas to edit its properties.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="capitalize text-muted-foreground">{selectedElement.type} Settings</Label>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={deleteElement}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                                <Separator />
                                <PropertiesPanel element={selectedElement} onUpdate={updateElement} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}


// --- Sub-components ---

function renderElement(el: DocumentElement) {
    switch (el.type) {
        case 'heading': return <h1 style={{ color: el.color, textAlign: el.alignment, fontSize: '28px', fontWeight: 'bold' }}>{el.text}</h1>;
        case 'text': return <p style={{ color: el.color, whiteSpace: 'pre-wrap', fontSize: '16px' }}>{el.text}</p>;
        case 'button': return <div style={{ textAlign: el.alignment }}><button style={{ backgroundColor: el.backgroundColor, color: el.textColor, padding: '12px 24px', borderRadius: '6px', border: 'none', fontSize: '16px', fontWeight: 'bold' }}>{el.text}</button></div>;
        case 'image': return <div style={{ textAlign: el.alignment }}><img data-ai-hint="placeholder" src={el.src} alt={el.alt} style={{ maxWidth: `${el.width}px`, width: '100%', height: 'auto' }} /></div>;
        case 'divider': return <hr style={{ borderTop: `1px solid ${el.color}`, borderBottom: 'none' }} />;
        default: return null;
    }
}

function PropertiesPanel({ element, onUpdate }: { element: DocumentElement; onUpdate: (id: string, updates: any) => void; }) {
    const AlignmentControl = ({ value, onChange }: { value: Alignment; onChange: (val: Alignment) => void; }) => (
        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-md">
            <Button variant={value === 'left' ? 'secondary' : 'ghost'} size="sm" onClick={() => onChange('left')}><AlignLeft className="h-4 w-4" /></Button>
            <Button variant={value === 'center' ? 'secondary' : 'ghost'} size="sm" onClick={() => onChange('center')}><AlignCenter className="h-4 w-4" /></Button>
            <Button variant={value === 'right' ? 'secondary' : 'ghost'} size="sm" onClick={() => onChange('right')}><AlignRight className="h-4 w-4" /></Button>
        </div>
    );
    
    switch (element.type) {
        case 'heading':
            return (
                <div className="space-y-4">
                    <div><Label>Text</Label><Input value={element.text} onChange={e => onUpdate(element.id, { text: e.target.value })} /></div>
                    <ColorPicker label="Color" color={element.color} onChange={c => onUpdate(element.id, { color: c })} />
                    <div><Label>Alignment</Label><AlignmentControl value={element.alignment} onChange={v => onUpdate(element.id, { alignment: v })} /></div>
                </div>
            );
        case 'text':
            return (
                <div className="space-y-4">
                    <div><Label>Text</Label><Textarea value={element.text} onChange={e => onUpdate(element.id, { text: e.target.value })} className="h-32" /></div>
                    <ColorPicker label="Color" color={element.color} onChange={c => onUpdate(element.id, { color: c })} />
                </div>
            );
        case 'button':
            return (
                <div className="space-y-4">
                    <div><Label>Text</Label><Input value={element.text} onChange={e => onUpdate(element.id, { text: e.target.value })} /></div>
                    <div><Label>URL</Label><Input value={element.href} onChange={e => onUpdate(element.id, { href: e.target.value })} /></div>
                    <ColorPicker label="Background Color" color={element.backgroundColor} onChange={c => onUpdate(element.id, { backgroundColor: c })} />
                    <ColorPicker label="Text Color" color={element.textColor} onChange={c => onUpdate(element.id, { textColor: c })} />
                    <div><Label>Alignment</Label><AlignmentControl value={element.alignment} onChange={v => onUpdate(element.id, { alignment: v })} /></div>
                </div>
            );
        case 'image':
            return (
                <div className="space-y-4">
                    <div><Label>Image URL</Label><Input value={element.src} onChange={e => onUpdate(element.id, { src: e.target.value })} /></div>
                    <div><Label>Alt Text</Label><Input value={element.alt} onChange={e => onUpdate(element.id, { alt: e.target.value })} /></div>
                    <div><Label>Max Width (px)</Label><Input type="number" value={element.width} onChange={e => onUpdate(element.id, { width: parseInt(e.target.value, 10) || 600 })} /></div>
                    <div><Label>Alignment</Label><AlignmentControl value={element.alignment} onChange={v => onUpdate(element.id, { alignment: v })} /></div>
                </div>
            );
        case 'divider':
            return (
                 <ColorPicker label="Color" color={element.color} onChange={c => onUpdate(element.id, { color: c })} />
            );
        default: return null;
    }
}
