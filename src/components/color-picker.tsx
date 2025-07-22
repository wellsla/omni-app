
"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
    label: string;
    color: string;
    onChange: (color: string) => void;
}

export default function ColorPicker({ label, color, onChange }: ColorPickerProps) {
    
    const colorInputRef = React.useRef<HTMLInputElement>(null);

    // A simple regex to check for valid hex color format.
    const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(hex);
    // A more robust regex for rgba
    const isValidRgba = (rgba: string) => /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.test(rgba);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };
    
    const handleSwatchClick = () => {
        colorInputRef.current?.click();
    };
    
    // Convert any valid color to a hex for the color input type, which only accepts hex.
    const colorForSwatch = React.useMemo(() => {
        if (isValidHex(color)) return color;
        // Basic conversion for demo purposes, a library would be better for production
        if (isValidRgba(color)) {
            try {
                const parts = color.match(/(\d+)/g);
                if (parts) {
                    return "#" + parts.slice(0, 3).map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
                }
            } catch {
                return '#000000';
            }
        }
        return '#000000';
    }, [color]);

    return (
        <div className="space-y-2">
            <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()}>{label}</Label>
            <div className="flex items-center gap-2">
                 <div 
                    className="h-10 w-12 flex-shrink-0 rounded-md border cursor-pointer"
                    style={{ backgroundColor: isValidHex(color) || isValidRgba(color) ? color : 'transparent' }}
                    onClick={handleSwatchClick}
                    role="button"
                    aria-label={`Open color picker for ${label}`}
                />
                <Input
                    ref={colorInputRef}
                    id={label.replace(/\s+/g, '-').toLowerCase()}
                    type="text"
                    className="flex-grow font-mono"
                    value={color}
                    onChange={handleTextChange}
                    placeholder="#RRGGBB or rgba(...)"
                />
                 <div className="relative h-10 w-10 flex-shrink-0">
                    <Input
                        type="color"
                        className="absolute inset-0 h-full w-full cursor-pointer p-0 border-none opacity-0"
                        value={colorForSwatch}
                        onChange={e => onChange(e.target.value)}
                        aria-label={`${label} color swatch`}
                    />
                     <div 
                        className="h-full w-full rounded-md border pointer-events-none" 
                        style={{ backgroundColor: color, transition: 'background-color 0.2s' }} 
                        aria-hidden="true"
                    />
                </div>
            </div>
        </div>
    );
}
