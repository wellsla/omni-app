
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Boxes, Download, UploadCloud, XCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { create3dObjectFromImages } from '@/ai/flows/create-3d-object-from-images';
import { downloadDataUri, readFileAsDataURL } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 5;

// A placeholder for a 3D viewer component
const ModelViewerPlaceholder = () => (
    <div className="w-full h-full bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed">
        <div className="text-center text-muted-foreground">
            <Boxes className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">3D model will be previewed here</p>
        </div>
    </div>
);

export default function ThreeDObjectCreatorPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [generatedObj, setGeneratedObj] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        // Cleanup function
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);


    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        if (fileRejections.length > 0) {
            fileRejections.forEach(({ errors }: any) => {
                errors.forEach((err: any) => {
                    toast({
                        title: 'Upload Error',
                        description: err.message,
                        variant: 'destructive',
                    });
                });
            });
            return;
        }

        const newFiles = [...files, ...acceptedFiles].slice(0, MAX_FILES);
        setFiles(newFiles);

    }, [files, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
        maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
        maxFiles: MAX_FILES,
    });

    const removeFile = (index: number) => {
        setFiles(currentFiles => currentFiles.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (files.length < 3) {
            toast({
                title: 'Not Enough Images',
                description: 'Please upload at least 3 images from different angles.',
                variant: 'destructive',
            });
            return;
        }
        
        setIsLoading(true);
        setGeneratedObj(null);

        try {
            const imageDataUris = await Promise.all(files.map(file => readFileAsDataURL(file)));
            const result = await create3dObjectFromImages({ imageDataUris });
            
            if (result && result.objectFileContent) {
                setGeneratedObj(result.objectFileContent);
                toast({
                    title: 'Generation Successful!',
                    description: 'Your 3D model has been created.',
                });
            } else {
                throw new Error("3D model generation failed to return data.");
            }
        } catch (error) {
            console.error("3D model generation error:", error);
            toast({
                title: 'Generation Error',
                description: error instanceof Error ? error.message : "An unexpected error occurred.",
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedObj) return;
        const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedObj);
        downloadDataUri(dataUri, 'omni-app-model.obj');
    };

    return (
        <>
            <PageHeader
                title="3D Object Creator"
                description="Upload multiple images of an object from different angles to generate a 3D model."
            />
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Upload Images</CardTitle>
                        <CardDescription>Drag and drop or click to upload up to {MAX_FILES} images.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            {...getRootProps()}
                            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                                isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                {isDragActive ? 'Drop the files here...' : 'Drag files here or click to upload'}
                            </p>
                            <p className="text-xs text-muted-foreground">Max {MAX_FILE_SIZE_MB}MB per file</p>
                        </div>
                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {previews.map((src, index) => (
                                    <div key={src} className="relative group aspect-square">
                                        <Image
                                            src={src}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            className="object-cover rounded-md"
                                            data-ai-hint="object photo"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleGenerate} disabled={isLoading || files.length < 3} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Boxes className="mr-2 h-4 w-4" />}
                            Generate 3D Model
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                         <div>
                            <CardTitle>2. Preview & Export</CardTitle>
                            <CardDescription>Your generated model will appear here.</CardDescription>
                        </div>
                        {generatedObj && !isLoading && (
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" /> Export .obj
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="h-[400px]">
                       {isLoading ? (
                           <div className="w-full h-full flex items-center justify-center animate-pulse">
                               <Skeleton className="w-full h-full rounded-lg" />
                           </div>
                       ) : generatedObj ? (
                           <ModelViewerPlaceholder />
                       ) : (
                           <ModelViewerPlaceholder />
                       )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
