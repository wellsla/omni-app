
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRightLeft, Copy, Check, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function Base64ConverterPage() {
  const [plainText, setPlainText] = useState('OmniApp is a great tool!');
  const [base64Text, setBase64Text] = useState('T21uaUFwcCBpcyBhIGdyZWF0IHRvb2wh');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePlainTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPlainText(newText);
    setError(null);
    try {
      // Use a robust method to handle Unicode characters
      const encoded = btoa(unescape(encodeURIComponent(newText)));
      setBase64Text(encoded);
    } catch (err) {
      // This should rarely happen with encoding
      setBase64Text('');
    }
  };
  
  const handleBase64TextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBase64 = e.target.value;
    setBase64Text(newBase64);
    
    if (!newBase64.trim()) {
      setPlainText('');
      setError(null);
      return;
    }

    try {
      // Use a robust method to handle Unicode characters
      const decoded = decodeURIComponent(escape(atob(newBase64)));
      setPlainText(decoded);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid Base64 string.";
      setError(errorMessage);
      setPlainText('');
    }
  };

  const handleClear = () => {
    setPlainText('');
    setBase64Text('');
    setError(null);
    toast({ title: "Fields Cleared" });
  };
  
  const CopyButton = ({ textToCopy, fieldName }: { textToCopy: string; fieldName: string }) => {
      const [copied, setCopied] = useState(false);
      const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast({ title: `Copied ${fieldName}!` });
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <Button variant="outline" size="icon" onClick={handleCopy} disabled={!textToCopy} aria-label={`Copy ${fieldName}`}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      );
  };

  return (
    <>
      <PageHeader
        title="Base64 Encoder / Decoder"
        description="Encode plain text into Base64 or decode Base64 back to its original form."
      />
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <CardTitle>Converter</CardTitle>
                    <CardDescription>Type in either box to convert automatically.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="plain-text" className="text-lg">Plain Text</Label>
                <CopyButton textToCopy={plainText} fieldName="Plain Text" />
              </div>
              <Textarea
                id="plain-text"
                value={plainText}
                onChange={handlePlainTextChange}
                placeholder="Type your plain text here..."
                className="h-64 font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="base64-text" className="text-lg">Base64</Label>
                 <CopyButton textToCopy={base64Text} fieldName="Base64" />
              </div>
              <Textarea
                id="base64-text"
                value={base64Text}
                onChange={handleBase64TextChange}
                placeholder="Type your Base64 here..."
                className={`h-64 font-mono text-sm ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            </div>
          </div>
           {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Decoding Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    </>
  );
}
