
"use client";

import React, { useState, useMemo } from 'react';
import * as allLucideIcons from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Copy, Check, type LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import ColorPicker from '@/components/color-picker';
import { Button } from '@/components/ui/button';
import { ICON_GROUPS } from '@/config/icon-groups';

type IconName = keyof typeof allLucideIcons;

// Helper function to convert kebab-case to PascalCase
const kebabToPascal = (kebab: string) => {
    return kebab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

// Check if an icon name is valid in the lucide-react library
const isValidIcon = (name: string): name is IconName => {
    return Object.prototype.hasOwnProperty.call(allLucideIcons, name);
};


// A simplified, direct icon renderer.
const Icon = ({ name, ...props }: { name: string } & LucideIcon) => {
    const PascalCaseName = kebabToPascal(name) as IconName;
    if (!isValidIcon(PascalCaseName)) {
        console.warn(`Invalid icon name provided: ${name}`);
        return null;
    }
    const LucideIcon = allLucideIcons[PascalCaseName];
    return <LucideIcon {...props} />;
}


const IconCard = ({ name, onClick }: { name: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors aspect-square"
    aria-label={`Open details for ${name} icon`}
  >
    <Icon name={name} className="w-8 h-8" />
    <span className="text-xs text-center truncate w-full">{name}</span>
  </button>
);

const CodeBlock = ({ content, language }: { content: string, language: string }) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast({ title: `Copied ${language} to clipboard!` });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <pre className="p-4 pr-12 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap overflow-x-auto border">
                <code>{content}</code>
            </pre>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    );
};

export default function IconCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);
  const [size, setSize] = useState(48);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const { toast } = useToast();

  const filteredIconGroups = useMemo(() => {
    const validGroups = ICON_GROUPS
      .map(group => {
        // Filter out any icons that are not valid before doing anything else
        const validIcons = group.icons.filter(iconName => isValidIcon(kebabToPascal(iconName)));
        return { ...group, icons: validIcons };
      })
      .filter(group => group.icons.length > 0);

    if (!searchTerm.trim()) {
      return validGroups;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    
    return validGroups
      .map(group => {
        const filteredItems = group.icons.filter(
          item => item.toLowerCase().includes(lowercasedTerm)
        );
        
        if (filteredItems.length > 0) {
          return { ...group, icons: filteredItems };
        }
        
        return null;
      })
      .filter((group): group is typeof ICON_GROUPS[0] => group !== null);

  }, [searchTerm]);
  
  const handleIconClick = (name: string) => {
      setSelectedIconName(name);
      // Reset customization on new icon selection
      setSize(48);
      setColor('#000000');
      setStrokeWidth(2);
  };
  
  const pascalSelectedIconName = useMemo(() => selectedIconName ? kebabToPascal(selectedIconName) : null, [selectedIconName]);
  
  const reactCode = pascalSelectedIconName ? `<${pascalSelectedIconName} size={${size}} color="${color}" strokeWidth={${strokeWidth}} />` : '';

  const svgCode = useMemo(() => {
    if (!pascalSelectedIconName || !isValidIcon(pascalSelectedIconName)) return '';
    
    try {
      const IconComponent = allLucideIcons[pascalSelectedIconName];
      const element = React.createElement(IconComponent, { size, color, strokeWidth });
      const { renderToStaticMarkup } = require('react-dom/server');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderToStaticMarkup(element);
      return tempDiv.innerHTML;
    } catch(e) {
      console.error("Failed to generate SVG string:", e);
      return "Could not generate SVG code.";
    }
  }, [pascalSelectedIconName, size, color, strokeWidth]);

  return (
    <>
      <PageHeader
        title="Icon Catalog"
        description="Browse, customize, and copy over a thousand icons from the Lucide icon library."
      />
      
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={`Search ${ICON_GROUPS.flatMap(g => g.icons).length} icons...`}
          className="pl-10 h-12 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-12">
        {filteredIconGroups.length > 0 ? (
          filteredIconGroups.map((group) => (
            <section key={group.name} aria-labelledby={group.name.replace(/ /g, '-')}>
              <h2 id={group.name.replace(/ /g, '-')} className="text-2xl font-semibold tracking-tight mb-6 font-headline">{group.name}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4">
                {group.icons.map((name, index) => (
                  <IconCard key={`${name}-${index}`} name={name} onClick={() => handleIconClick(name)} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-2xl font-semibold">No Icons Found</h3>
            <p>Your search for "{searchTerm}" did not match any icons.</p>
          </div>
        )}
      </div>
      
      {pascalSelectedIconName && (
        <Dialog open={!!selectedIconName} onOpenChange={() => setSelectedIconName(null)}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{pascalSelectedIconName}</DialogTitle>
                    <DialogDescription>Customize the icon and copy the code you need.</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg border">
                        <Icon name={selectedIconName!} size={size} color={color} strokeWidth={strokeWidth} />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <Label>Size ({size}px)</Label>
                            <Slider value={[size]} onValueChange={(v) => setSize(v[0])} min={16} max={128} step={1} />
                        </div>
                        <div>
                            <Label>Stroke Width ({strokeWidth.toFixed(2)})</Label>
                            <Slider value={[strokeWidth]} onValueChange={(v) => setStrokeWidth(v[0])} min={0.5} max={3} step={0.25} />
                        </div>
                        <div>
                             <ColorPicker label="Color" color={color} onChange={setColor} />
                        </div>
                    </div>
                </div>
                 <div className="space-y-4 pt-4">
                    <div>
                        <Label>React Component (e.g. import {"{"} {pascalSelectedIconName} {"}"} from 'lucide-react')</Label>
                        <CodeBlock content={reactCode} language="JSX" />
                    </div>
                     <div>
                        <Label>Raw SVG</Label>
                        <CodeBlock content={svgCode} language="SVG" />
                    </div>
                 </div>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
