
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/page-header';
import FileUploader from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Copy, Check, FileQuestion } from 'lucide-react';
import { DATA_EXTRACTION_TYPES } from '@/config/nav';
import { extractColorsFromImage, type ExtractColorsFromImageOutput } from '@/ai/flows/extract-colors-from-image';
import { extractTextFromImage, type ExtractTextFromImageOutput } from '@/ai/flows/extract-text-from-image';
import { extractTextFromPdf } from '@/ai/flows/extract-text-from-pdf';
import { readFileAsDataURL } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Type definitions
type Color = ExtractColorsFromImageOutput['colors'][0];

type ExtractedResult = 
  | { type: 'colors'; data: Color[] }
  | { type: 'text'; data: string };


// Local component for displaying color swatches
const ColorSwatch = ({ color }: { color: Color }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    toast({ title: `Copied ${color.hex} to clipboard!` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-2">
        <button 
            type="button"
            aria-label={`Copy color ${color.name} (${color.hex})`}
            className="relative w-24 h-24 rounded-lg shadow-md group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ backgroundColor: color.hex }}
            onClick={handleCopy}
        >
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity rounded-lg">
                {copied ? <Check className="w-8 h-8 text-white" /> : <Copy className="w-8 h-8 text-white" />}
            </div>
        </button>
        <div className="text-center">
            <p className="font-semibold text-sm">{color.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{color.hex}</p>
        </div>
    </div>
  );
};


export default function DataExtractionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractionType, setExtractionType] = useState<string>('');
  const [extractedResult, setExtractedResult] = useState<ExtractedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setExtractedResult(null); // Reset result on new file
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    } else {
        setImagePreview(null);
    }
  };

  const handleColorExtraction = async (file: File) => {
     try {
        const imageDataUri = await readFileAsDataURL(file);
        const result = await extractColorsFromImage({ imageDataUri });

        if (result && result.colors) {
            setExtractedResult({ type: 'colors', data: result.colors });
            toast({
                title: "Colors Extracted!",
                description: `Found ${result.colors.length} colors in your image.`,
            });
        } else {
            throw new Error("Color extraction failed or returned no data.");
        }
    } catch (error) {
        console.error("Color extraction error:", error);
        toast({
            title: "Extraction Error",
            description: error instanceof Error ? error.message : "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };

  const handleTextExtraction = async (file: File) => {
     try {
        const imageDataUri = await readFileAsDataURL(file);
        const result = await extractTextFromImage({ imageDataUri });

        if (result && result.extractedText) {
            setExtractedResult({ type: 'text', data: result.extractedText });
            toast({
                title: "Text Extracted!",
                description: `Successfully extracted text from your image.`,
            });
        } else {
            throw new Error("Text extraction failed or returned no data.");
        }
    } catch (error) {
        console.error("Text extraction error:", error);
        toast({
            title: "Extraction Error",
            description: error instanceof Error ? error.message : "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };

  const handlePdfTextExtraction = async (file: File) => {
     try {
        const pdfDataUri = await readFileAsDataURL(file);
        const result = await extractTextFromPdf({ pdfDataUri });

        if (result && result.extractedText) {
            setExtractedResult({ type: 'text', data: result.extractedText });
            toast({
                title: "Text Extracted!",
                description: `Successfully extracted text from your PDF.`,
            });
        } else {
            throw new Error("PDF text extraction failed or returned no data.");
        }
    } catch (error) {
        console.error("PDF text extraction error:", error);
        toast({
            title: "Extraction Error",
            description: error instanceof Error ? error.message : "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };


  const handleSubmit = async () => {
    if (!selectedFile || !extractionType) {
      toast({
        title: "Missing Information",
        description: "Please upload a file and select an extraction type.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExtractedResult(null);

    switch(extractionType) {
        case 'colors-from-image':
            if (!selectedFile.type.startsWith('image/')) {
                toast({ title: "Invalid File", description: "Color extraction requires an image file.", variant: "destructive"});
                setIsLoading(false);
                return;
            }
            await handleColorExtraction(selectedFile);
            break;
        case 'text-from-image':
            if (!selectedFile.type.startsWith('image/')) {
                toast({ title: "Invalid File", description: "Text extraction requires an image file.", variant: "destructive"});
                setIsLoading(false);
                return;
            }
            await handleTextExtraction(selectedFile);
            break;
        case 'text-from-pdf':
            if (selectedFile.type !== 'application/pdf') {
                toast({ title: "Invalid File", description: "Text extraction requires a PDF file.", variant: "destructive"});
                setIsLoading(false);
                return;
            }
            await handlePdfTextExtraction(selectedFile);
            break;
        default:
             toast({ title: "Unknown Type", description: "Selected extraction type is not handled.", variant: "destructive"});
    }

    setIsLoading(false);
  };
  
  const renderResults = () => {
    if (!extractedResult) return null;

    switch(extractedResult.type) {
      case 'colors':
        return (
          <div className="space-y-6">
            {imagePreview && (
              <div>
                <h3 className="text-lg font-medium mb-4 text-center">Original Image</h3>
                <div className="relative aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden border">
                  <Image 
                    src={imagePreview} 
                    alt="Preview of the uploaded image for data extraction" 
                    fill
                    style={{ objectFit: 'contain' }}
                    data-ai-hint="user uploaded photo"
                  />
                </div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium mb-4 text-center">Extracted Palette</h3>
              <div className="flex flex-wrap gap-6 justify-center p-4 bg-muted/50 rounded-lg">
                {extractedResult.data.map((color) => (
                  <ColorSwatch key={color.hex} color={color} />
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'text':
         const handleTextCopy = () => {
            if(!extractedResult.data) return;
            navigator.clipboard.writeText(extractedResult.data);
            setIsCopied(true);
            toast({ title: "Copied to clipboard!" });
            setTimeout(() => setIsCopied(false), 2000);
        };
         return (
              <div className="relative">
                <Textarea
                  value={extractedResult.data}
                  readOnly
                  placeholder="Extracted data will appear here."
                  className="h-64 resize-none bg-muted/30 font-mono"
                  aria-label="Extracted data"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleTextCopy}
                    aria-label="Copy extracted text"
                >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            );
        
      default:
        return <p>Could not display the extracted data.</p>
    }
  }

  const acceptedFileTypes = {
    'colors-from-image': 'image/*',
    'text-from-image': 'image/*',
    'text-from-pdf': 'application/pdf',
  }[extractionType] || 'image/*,application/pdf';


  return (
    <>
      <PageHeader
        title="Data Extraction"
        description="Extract valuable information from your files, such as text from images, color palettes, or file metadata."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Configure Extraction</CardTitle>
            <CardDescription>Upload a file and choose what data you want to extract from it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload-extraction">1. Upload File</Label>
              <FileUploader
                id="file-upload-extraction"
                onFileSelect={handleFileSelect}
                acceptedFileTypes={acceptedFileTypes}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extractionType">2. Select Extraction Type</Label>
              <Select value={extractionType} onValueChange={setExtractionType} disabled={!selectedFile}>
                <SelectTrigger id="extractionType">
                  <SelectValue placeholder="What do you want to extract?" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_EXTRACTION_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center">
                        <type.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading || !selectedFile || !extractionType} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
              Extract Data
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Extraction Results</CardTitle>
            <CardDescription>The extracted data will appear below.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              extractionType === 'colors-from-image' ? (
                <div className="space-y-6 animate-pulse">
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3 mx-auto" />
                      <Skeleton className="aspect-video w-full max-w-sm mx-auto rounded-lg" />
                  </div>
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3 mx-auto" />
                      <div className="flex flex-wrap gap-6 justify-center p-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                  <Skeleton className="w-24 h-24 rounded-lg" />
                                  <Skeleton className="h-4 w-20" />
                                  <Skeleton className="h-3 w-16" />
                              </div>
                          ))}
                      </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 border rounded-md animate-pulse h-64">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" style={{width: `${Math.random() * 40 + 50}%`}} />
                    ))}
                </div>
              )
            ) : !extractedResult ? (
                 <div className="flex flex-col items-center justify-center h-60 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FileQuestion className="h-12 w-12 mb-2" />
                    <p className="text-center">Your results will be shown here.</p>
                </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
