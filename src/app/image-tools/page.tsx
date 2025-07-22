"use client";

import React, { useState } from 'react';
import PageHeader from '@/components/page-header';
import FileUploader from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon, Wand2, Download, ArrowDown, Minimize } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { removeImageBackground } from '@/ai/flows/remove-image-background';
import { compressImage } from '@/ai/flows/compress-image';
import { vectorizeImage } from '@/ai/flows/vectorize-image';
import { downloadDataUri, readFileAsDataURL } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImageToolsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transformationType, setTransformationType] = useState<string>('');
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [transformedImagePreview, setTransformedImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File | null) => {
    setSelectedFile(file);
    setTransformedImagePreview(null);
    setOriginalImagePreview(null);
    if (file && file.type.startsWith('image/')) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        setOriginalImagePreview(dataUrl);
      } catch (error) {
        console.error("File reading error", error);
        toast({
            title: "File Error",
            description: "Could not read the selected file.",
            variant: "destructive",
        });
      }
    }
  };

  const handleVectorize = async () => {
    if(!originalImagePreview) return;
    try {
      const result = await vectorizeImage({ imageDataUri: originalImagePreview });
      if (result && result.resultImageUri) {
        setTransformedImagePreview(result.resultImageUri);
        toast({
          title: "Image Vectorized!",
          description: "Your image has been successfully converted to an SVG.",
        });
      } else {
        throw new Error("Vectorization failed or returned no data.");
      }
    } catch(error) {
       console.error("Vectorization error:", error);
       toast({
         title: "Transformation Error",
         description: error instanceof Error ? error.message : "An unexpected error occurred during vectorization.",
         variant: "destructive",
       });
    }
  }

  const handleRemoveBackground = async () => {
    if(!originalImagePreview) return;
    try {
      const result = await removeImageBackground({ imageDataUri: originalImagePreview });
      if (result && result.resultImageUri) {
        setTransformedImagePreview(result.resultImageUri);
        toast({
          title: "Background Removed!",
          description: "The background of your image has been successfully removed.",
        });
      } else {
        throw new Error("Background removal failed or returned no data.");
      }
    } catch(error) {
       console.error("Background removal error:", error);
       toast({
         title: "Transformation Error",
         description: error instanceof Error ? error.message : "An unexpected error occurred during background removal.",
         variant: "destructive",
       });
    }
  }

  const handleCompressImage = async () => {
    if(!originalImagePreview) return;
    try {
      const result = await compressImage({ imageDataUri: originalImagePreview });
      if (result && result.resultImageUri) {
        setTransformedImagePreview(result.resultImageUri);
        toast({
          title: "Image Compressed!",
          description: "Your image has been compressed to WebP format.",
        });
      } else {
        throw new Error("Image compression failed or returned no data.");
      }
    } catch(error) {
       console.error("Image compression error:", error);
       toast({
         title: "Transformation Error",
         description: error instanceof Error ? error.message : "An unexpected error occurred during compression.",
         variant: "destructive",
       });
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile || !transformationType) {
      toast({
        title: "Missing Information",
        description: "Please upload an image and select a transformation type.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTransformedImagePreview(null);
    
    switch(transformationType) {
      case 'vectorize':
        await handleVectorize();
        break;
      case 'remove-background':
        await handleRemoveBackground();
        break;
      case 'compress-image':
        await handleCompressImage();
        break;
      default:
        toast({ title: "Unknown Type", description: "Selected transformation type is not handled.", variant: "destructive"});
    }

    setIsLoading(false);
  };
  
  const handleDownload = () => {
    if (!transformedImagePreview || !selectedFile) return;

    let extension = 'png';
    switch(transformationType) {
        case 'vectorize':
            extension = 'svg';
            break;
        case 'compress-image':
            extension = 'webp';
            break;
        case 'remove-background':
        default:
            extension = 'png';
            break;
    }

    const originalName = selectedFile.name.split('.').slice(0, -1).join('.');
    const newFilename = `${originalName}_${transformationType}.${extension}`;

    downloadDataUri(transformedImagePreview, newFilename);
  }

  return (
    <>
      <PageHeader
        title="Image Tools"
        description="Apply powerful transformations to your images like background removal, compression, or vectorization."
      />
      <div className="grid gap-8 md:grid-cols-2 items-start">
        {/* --- Configuration Card --- */}
        <Card className="shadow-lg sticky top-6">
          <CardHeader>
            <CardTitle>Configure Transformation</CardTitle>
            <CardDescription>Upload an image and choose the transformation you want to apply.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Step 1: Upload Image</Label>
              <FileUploader
                id="image-upload-transform"
                onFileSelect={handleFileSelect}
                acceptedFileTypes="image/png,image/jpeg,image/gif"
                maxFileSizeMB={10}
              />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="transformationType">Step 2: Select Transformation</Label>
                <Select value={transformationType} onValueChange={setTransformationType} disabled={!selectedFile}>
                  <SelectTrigger id="transformationType">
                    <SelectValue placeholder="What do you want to do?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remove-background">Remove Background</SelectItem>
                    <SelectItem value="compress-image">Compress Image (to WebP)</SelectItem>
                    <SelectItem value="vectorize">Vectorize Image (SVG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading || !selectedFile || !transformationType} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Transform Image
            </Button>
          </CardFooter>
        </Card>

        {/* --- Results and Previews Card --- */}
        <Card className="shadow-lg">
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Preview</CardTitle>
              <CardDescription>Review the original and transformed images.</CardDescription>
            </div>
            {transformedImagePreview && !isLoading && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!originalImagePreview ? (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground border-2 border-dashed rounded-lg">
                <ImageIcon className="h-16 w-16 mb-2" />
                <p>Upload an image to see the preview.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Original */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-center text-muted-foreground">Original</h3>
                  <div className="border rounded-lg p-2 aspect-video flex items-center justify-center bg-muted/50 overflow-hidden">
                    <Image 
                      src={originalImagePreview} 
                      alt="Original image provided for transformation" 
                      width={400} 
                      height={300} 
                      className="max-w-full max-h-60 object-contain rounded"
                      data-ai-hint="user uploaded photo"
                    />
                  </div>
                </div>

                <div className="flex justify-center items-center text-muted-foreground">
                  <ArrowDown className="h-8 w-8" />
                </div>

                {/* Transformed */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-center text-muted-foreground">Transformed</h3>
                  <div className="border rounded-lg p-2 aspect-video flex items-center justify-center bg-muted/50 overflow-hidden min-h-[268px]">
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center animate-pulse">
                          <Skeleton className="w-full h-full rounded-lg" />
                        </div>
                      ) : transformedImagePreview ? (
                        <Image 
                          src={transformedImagePreview} 
                          alt="Result of the image transformation" 
                          width={400} 
                          height={300} 
                          className="max-w-full max-h-60 object-contain rounded"
                          data-ai-hint="edited photo"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                          <Wand2 className="h-16 w-16 mb-2" />
                          <p>Your result will appear here.</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
