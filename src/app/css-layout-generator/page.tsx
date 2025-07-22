
"use client";

import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from '@/components/ui/slider';
import { Plus, Minus, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- State and Types ---
interface Item {
  id: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: string;
  gridColumn: string;
  gridRow: string;
}

const newItem = (id: number): Item => ({
  id,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  alignSelf: 'auto',
  gridColumn: 'auto',
  gridRow: 'auto',
});

// --- Main Component ---
export default function CssLayoutGeneratorPage() {
  const [items, setItems] = useState<Item[]>([newItem(1), newItem(2), newItem(3)]);
  const [activeTab, setActiveTab] = useState('flexbox');
  const [selectedItem, setSelectedItem] = useState<number | null>(items[0]?.id ?? null);
  
  // Flexbox state
  const [flexDirection, setFlexDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  const [flexWrap, setFlexWrap] = useState('nowrap');
  const [gap, setGap] = useState(10);
  
  // Grid state
  const [gridCols, setGridCols] = useState('1fr 1fr 1fr');
  const [gridRows, setGridRows] = useState('100px 100px');
  
  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, newItem(newId)]);
  };

  const removeItem = () => {
    if (items.length <= 1) return;
    const newItems = items.slice(0, -1);
    if (selectedItem && !newItems.find(i => i.id === selectedItem)) {
      setSelectedItem(newItems[0]?.id ?? null);
    }
    setItems(newItems);
  };

  const handleItemChange = (id: number, property: keyof Item, value: any) => {
    setItems(produce(draft => {
      const item = draft.find(i => i.id === id);
      if (item) {
        (item as any)[property] = value;
      }
    }));
  };
  
  const activeItem = useMemo(() => items.find(i => i.id === selectedItem), [items, selectedItem]);

  return (
    <>
      <PageHeader
        title="CSS Layout Generator"
        description="Visually build CSS Flexbox and Grid layouts and export the code."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* --- CONTROLS --- */}
        <Card className="sticky top-6">
           <CardHeader>
            <CardTitle>Layout Controls</CardTitle>
            <CardDescription>Adjust properties to see them live.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="flexbox">Flexbox</TabsTrigger>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                </TabsList>
                
                {/* Flexbox Controls */}
                <TabsContent value="flexbox" className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold">Container Properties</h3>
                   <ControlSelect label="flex-direction" value={flexDirection} onValueChange={setFlexDirection} options={['row', 'row-reverse', 'column', 'column-reverse']} />
                   <ControlSelect label="justify-content" value={justifyContent} onValueChange={setJustifyContent} options={['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']} />
                   <ControlSelect label="align-items" value={alignItems} onValueChange={setAlignItems} options={['stretch', 'flex-start', 'flex-end', 'center', 'baseline']} />
                   <ControlSelect label="flex-wrap" value={flexWrap} onValueChange={setFlexWrap} options={['nowrap', 'wrap', 'wrap-reverse']} />
                   <ControlSlider label="gap" value={[gap]} onValueChange={v => setGap(v[0])} min={0} max={50} step={1} unit="px" />
                </TabsContent>
                
                {/* Grid Controls */}
                <TabsContent value="grid" className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold">Container Properties</h3>
                   <ControlInput label="grid-template-columns" value={gridCols} onValueChange={setGridCols} placeholder="e.g., 1fr 1fr" />
                   <ControlInput label="grid-template-rows" value={gridRows} onValueChange={setGridRows} placeholder="e.g., auto" />
                   <ControlSlider label="gap" value={[gap]} onValueChange={v => setGap(v[0])} min={0} max={50} step={1} unit="px" />
                </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Items ({items.length})</h3>
               <div className="flex gap-2">
                <Button onClick={addItem} size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
                <Button onClick={removeItem} size="sm" variant="destructive" disabled={items.length <= 1}><Minus className="w-4 h-4 mr-2" />Remove Item</Button>
              </div>

               {activeTab === 'flexbox' && activeItem && (
                  <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                      <h4 className="font-semibold">Selected Item #{activeItem.id} Properties</h4>
                      <ControlSlider label="flex-grow" value={[activeItem.flexGrow]} onValueChange={v => handleItemChange(activeItem.id, 'flexGrow', v[0])} min={0} max={5} step={1} />
                      <ControlSlider label="flex-shrink" value={[activeItem.flexShrink]} onValueChange={v => handleItemChange(activeItem.id, 'flexShrink', v[0])} min={0} max={5} step={1} />
                      <ControlInput label="flex-basis" value={activeItem.flexBasis} onValueChange={v => handleItemChange(activeItem.id, 'flexBasis', v)} placeholder="auto" />
                      <ControlSelect label="align-self" value={activeItem.alignSelf} onValueChange={v => handleItemChange(activeItem.id, 'alignSelf', v)} options={['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch']} />
                  </div>
              )}
               {activeTab === 'grid' && activeItem && (
                  <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                      <h4 className="font-semibold">Selected Item #{activeItem.id} Properties</h4>
                      <ControlInput label="grid-column" value={activeItem.gridColumn} onValueChange={v => handleItemChange(activeItem.id, 'gridColumn', v)} placeholder="e.g. 1 / 3" />
                      <ControlInput label="grid-row" value={activeItem.gridRow} onValueChange={v => handleItemChange(activeItem.id, 'gridRow', v)} placeholder="e.g. auto" />
                  </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* --- PREVIEW AND CODE --- */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
               <div 
                 className="p-4 bg-muted/50 rounded-lg min-h-[300px] transition-all"
                 style={activeTab === 'flexbox' ? {
                     display: 'flex',
                     flexDirection: flexDirection as any,
                     justifyContent,
                     alignItems,
                     flexWrap: flexWrap as any,
                     gap: `${gap}px`
                 } : {
                     display: 'grid',
                     gridTemplateColumns: gridCols,
                     gridTemplateRows: gridRows,
                     gap: `${gap}px`
                 }}
               >
                 {items.map(item => (
                   <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`flex items-center justify-center p-4 text-lg font-bold text-background bg-primary rounded-md cursor-pointer transition-all ${selectedItem === item.id ? 'ring-2 ring-offset-2 ring-accent' : 'opacity-80 hover:opacity-100'}`}
                      style={activeTab === 'flexbox' ? {
                         flexGrow: item.flexGrow,
                         flexShrink: item.flexShrink,
                         flexBasis: item.flexBasis,
                         alignSelf: item.alignSelf as any
                      } : {
                         gridColumn: item.gridColumn,
                         gridRow: item.gridRow,
                      }}
                   >
                     {item.id}
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
          
          <CodeOutput
            mode={activeTab as 'flexbox' | 'grid'}
            items={items}
            styles={{ flexDirection, justifyContent, alignItems, flexWrap, gap: `${gap}px`, gridTemplateColumns: gridCols, gridTemplateRows: gridRows }}
          />
        </div>
      </div>
    </>
  );
}

// --- Control Components ---
const ControlSelect = ({ label, value, onValueChange, options }: { label: string, value: string, onValueChange: (val: string) => void, options: string[] }) => (
    <div className="space-y-2">
        <Label htmlFor={label} className="capitalize">{label.replace(/-/g, ' ')}</Label>
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger id={label}><SelectValue /></SelectTrigger>
            <SelectContent>{options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
        </Select>
    </div>
);

const ControlSlider = ({ label, value, onValueChange, min, max, step, unit = '' }: { label: string, value: number[], onValueChange: (val: number[]) => void, min: number, max: number, step: number, unit?: string }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor={label} className="capitalize">{label.replace(/-/g, ' ')}</Label>
            <span className="text-sm text-muted-foreground">{value[0]}{unit}</span>
        </div>
        <Slider id={label} value={value} onValueChange={onValueChange} min={min} max={max} step={step} />
    </div>
);

const ControlInput = ({ label, value, onValueChange, placeholder }: { label: string, value: string, onValueChange: (val: string) => void, placeholder?: string }) => (
  <div className="space-y-2">
    <Label htmlFor={label} className="capitalize">{label.replace(/-/g, ' ')}</Label>
    <Input id={label} value={value} onChange={e => onValueChange(e.target.value)} placeholder={placeholder} />
  </div>
);

// --- Code Output Component ---
function CodeOutput({ mode, items, styles }: any) {
    const { toast } = useToast();
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const handleCopy = (content: string, type: string) => {
        navigator.clipboard.writeText(content);
        setCopiedStates(prev => ({ ...prev, [type]: true }));
        toast({ title: `Copied ${type} code!` });
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [type]: false })), 2000);
    };

    const code = useMemo(() => {
        const parentCss = mode === 'flexbox' ? `
  display: flex;
  flex-direction: ${styles.flexDirection};
  justify-content: ${styles.justifyContent};
  align-items: ${styles.alignItems};
  flex-wrap: ${styles.flexWrap};
  gap: ${styles.gap};` : `
  display: grid;
  grid-template-columns: ${styles.gridTemplateColumns};
  grid-template-rows: ${styles.gridTemplateRows};
  gap: ${styles.gap};`;

        const childrenCss = items.map((item: Item) => `
.item-${item.id} {${mode === 'flexbox' ? `
  flex-grow: ${item.flexGrow};
  flex-shrink: ${item.flexShrink};
  flex-basis: ${item.flexBasis};
  align-self: ${item.alignSelf};` : `
  grid-column: ${item.gridColumn};
  grid-row: ${item.gridRow};`}
}`).join('');
        
        const html = `<div class="parent">
${items.map((item: Item) => `  <div class="item item-${item.id}">${item.id}</div>`).join('\n')}
</div>`;
        
        const css = `.parent {${parentCss}
}
${childrenCss}`;
        
        const tailwindParent = mode === 'flexbox' ?
          `flex flex-${styles.flexDirection} justify-${styles.justifyContent.replace('flex-','')} items-${styles.alignItems.replace('flex-','')} ${styles.flexWrap === 'wrap' ? 'flex-wrap' : ''}` :
          `grid`;
        const tailwindItems = items.map((item: Item) =>
            `<div class="item item-${item.id} ...">${item.id}</div>`
        ).join('\n');
        
        const react = `export default function MyComponent() {
  return (
    <div style={{${parentCss.replace(/\n/g, ' ').replace(/  /g, ' ')} }}>
${items.map((item: Item) => `      <div style={{/* CSS for item ${item.id} */}}>${item.id}</div>`).join('\n')}
    </div>
  );
}`;
        
        const vue = `<template>
  <div class="parent">
${items.map((item: Item) => `    <div class="item item-${item.id}">${item.id}</div>`).join('\n')}
  </div>
</template>

<style scoped>
.parent {${parentCss}
}
${childrenCss}
</style>`;

        const angular = `<!-- component.html -->
<div class="parent">
${items.map((item: Item) => `  <div class="item item-${item.id}">${item.id}</div>`).join('\n')}
</div>

<!-- component.css -->
.parent {${parentCss}
}
${childrenCss}
`;

        return { html, css, tailwind: `<div class="${tailwindParent}" style={{ gap: '${styles.gap}' }}>...</div>`, react, vue, angular };
    }, [mode, items, styles]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Code Export</CardTitle>
                <CardDescription>Copy the generated code for your project.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="html-css">
                    <TabsList>
                        <TabsTrigger value="html-css">HTML+CSS</TabsTrigger>
                        <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
                        <TabsTrigger value="react">React</TabsTrigger>
                        <TabsTrigger value="vue">Vue</TabsTrigger>
                        <TabsTrigger value="angular">Angular</TabsTrigger>
                    </TabsList>
                    <CodePanel id="html-css" code={`${code.html}\n\n<style>\n${code.css}\n</style>`} onCopy={handleCopy} copied={copiedStates['html-css']} />
                    <CodePanel id="tailwind" code={code.tailwind} onCopy={handleCopy} copied={copiedStates['tailwind']} />
                    <CodePanel id="react" code={code.react} onCopy={handleCopy} copied={copiedStates['react']} />
                    <CodePanel id="vue" code={code.vue} onCopy={handleCopy} copied={copiedStates['vue']} />
                    <CodePanel id="angular" code={code.angular} onCopy={handleCopy} copied={copiedStates['angular']} />
                </Tabs>
            </CardContent>
        </Card>
    )
}

function CodePanel({ id, code, onCopy, copied }: { id: string, code: string, onCopy: (code: string, type: string) => void, copied: boolean }) {
    return (
        <TabsContent value={id}>
            <div className="relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => onCopy(code, id)}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <ScrollArea className="max-h-60 w-full rounded-md border">
                   <pre className="p-4 text-sm font-mono bg-muted/50">{code}</pre>
                </ScrollArea>
            </div>
        </TabsContent>
    )
}

    