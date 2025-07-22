
"use client";

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadCloud, XCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string; // e.g., "image/*,.pdf"
  maxFileSizeMB?: number;
  id?: string;
  label?: string;
}

export default function FileUploader({
  onFileSelect,
  acceptedFileTypes = "*/*",
  maxFileSizeMB = 10,
  id = "file-upload",
  label = "Upload File"
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  
  const processFile = useCallback((file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileName('');
      onFileSelect(null);
      const inputElement = document.getElementById(id) as HTMLInputElement;
      if (inputElement) inputElement.value = '';
      return;
    }

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      const errorMsg = `File size exceeds ${maxFileSizeMB}MB.`;
      toast({ title: "Upload Error", description: errorMsg, variant: "destructive" });
      setSelectedFile(null);
      setFileName('');
      onFileSelect(null);
      const inputElement = document.getElementById(id) as HTMLInputElement;
      if (inputElement) inputElement.value = '';
      return;
    }
    setSelectedFile(file);
    setFileName(file.name);
    onFileSelect(file);
  }, [id, maxFileSizeMB, onFileSelect, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0] || null);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleRemoveFile = () => {
    processFile(null);
  };

  const triggerFileInput = () => {
    document.getElementById(id)?.click();
  };

  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div 
        className={cn(`w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors`,
          isDragOver ? 'border-primary bg-primary/10' :
          selectedFile ? 'border-primary bg-primary/5' :
          'border-border hover:border-primary/70 bg-background hover:bg-muted/50'
        )}
        onClick={!selectedFile ? triggerFileInput : undefined}
        onKeyDown={(e) => { if (e.key === 'Enter' && !selectedFile) triggerFileInput(); }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={selectedFile ? -1 : 0}
        aria-label={selectedFile ? `File ${fileName} selected` : label}
      >
        <Input
          id={id}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
        />
        {!selectedFile ? (
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">Max file size: {maxFileSizeMB}MB. Types: {acceptedFileTypes === "*/*" ? "Any" : acceptedFileTypes}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2 overflow-hidden">
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate" title={fileName}>{fileName}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              aria-label="Remove file"
              className="text-muted-foreground hover:text-destructive"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
