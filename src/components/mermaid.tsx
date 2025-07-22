
"use client";

import React, { useState, useEffect, useId } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MermaidProps {
    chart: string;
    onDownload?: (svgData: string) => void;
}

mermaid.initialize({ 
    startOnLoad: false, 
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif'
});

export default function Mermaid({ chart, onDownload }: MermaidProps) {
    const id = useId();
    const [svg, setSvg] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (chart) {
            setIsLoading(true);
            setError(null);
            mermaid.render(`mermaid-graph-${id}`, chart)
                .then(({ svg }) => {
                    setSvg(svg);
                })
                .catch(err => {
                    console.error("Mermaid rendering error:", err);
                    setError(err.message || "Failed to render diagram.");
                    toast({
                        title: "Diagram Rendering Error",
                        description: err.message,
                        variant: "destructive"
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setSvg('');
            setError(null);
        }
    }, [chart, id, toast]);

    const handleLocalDownload = () => {
        if (onDownload && svg) {
            onDownload(svg);
        }
    };
    
    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Generated Diagram</CardTitle>
                    <CardDescription>Your class diagram will appear here.</CardDescription>
                </div>
                {svg && !isLoading && onDownload && (
                    <Button variant="outline" size="sm" onClick={handleLocalDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download as SVG
                    </Button>
                )}
            </CardHeader>
            <CardContent className="min-h-[460px] flex items-center justify-center p-4 border rounded-md bg-muted/50">
                {isLoading && <Skeleton className="w-full h-full" />}
                {!isLoading && error && (
                    <div className="text-destructive text-center">
                        <p><strong>Rendering Failed</strong></p>
                        <p className="text-xs">{error}</p>
                    </div>
                )}
                {!isLoading && !error && svg && (
                     <div 
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: svg }} 
                     />
                )}
                {!isLoading && !error && !svg && (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Share2 className="h-16 w-16 mb-4" />
                        <p className="text-center">Define your structure and generate a diagram.</p>
                    </div>
                )}
            </CardContent>
        </>
    );
}
