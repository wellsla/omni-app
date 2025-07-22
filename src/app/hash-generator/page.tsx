
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';
import SHA256 from 'crypto-js/sha256';
import SHA512 from 'crypto-js/sha512';

interface HashResult {
  algorithm: string;
  value: string;
}

const HashDisplay = ({ algorithm, value }: HashResult) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({ title: `Copied ${algorithm} hash!` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={algorithm} className="text-muted-foreground">{algorithm}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={algorithm}
          value={value}
          readOnly
          className="font-mono text-sm bg-muted/50"
          aria-label={`${algorithm} hash result`}
        />
        <Button variant="outline" size="icon" onClick={handleCopy} aria-label={`Copy ${algorithm} hash`}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default function HashGeneratorPage() {
  const [inputText, setInputText] = useState('Hello, world!');

  const hashes = useMemo<HashResult[]>(() => {
    if (!inputText) {
      return [
        { algorithm: 'MD5', value: '' },
        { algorithm: 'SHA-1', value: '' },
        { algorithm: 'SHA-256', value: '' },
        { algorithm: 'SHA-512', value: '' },
      ];
    }
    return [
      { algorithm: 'MD5', value: MD5(inputText).toString() },
      { algorithm: 'SHA-1', value: SHA1(inputText).toString() },
      { algorithm: 'SHA-256', value: SHA256(inputText).toString() },
      { algorithm: 'SHA-512', value: SHA512(inputText).toString() },
    ];
  }, [inputText]);

  return (
    <>
      <PageHeader
        title="Hash Generator"
        description="Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from your text input in real-time."
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter the text you want to hash.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Label htmlFor="hash-input">Text Input</Label>
                <Textarea
                  id="hash-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="h-64 font-mono text-sm"
                  aria-label="Text input for hashing"
                />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Hashes</CardTitle>
            <CardDescription>The generated hashes will update automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hashes.map(hash => (
              <HashDisplay key={hash.algorithm} algorithm={hash.algorithm} value={hash.value} />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
