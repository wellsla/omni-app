
"use client";

import React, { useState, useMemo } from 'react';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface DecodedToken {
  header: object;
  payload: JwtPayload;
  signature: string;
}

const JsonBlock = ({ title, data }: { title: string; data: object | null }) => (
  <div>
    <Label className="text-lg font-semibold">{title}</Label>
    <pre className="mt-2 p-4 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap overflow-x-auto border">
      {data ? JSON.stringify(data, null, 2) : '...'}
    </pre>
  </div>
);

export default function JwtDecoderPage() {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const decodedToken: DecodedToken | null = useMemo(() => {
    if (!token.trim()) {
      setError(null);
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      setError('Invalid token structure. A JWT must have three parts separated by dots.');
      return null;
    }
      
    try {
      const header = jwtDecode(token, { header: true });
      const payload = jwtDecode(token);
      const signature = parts[2];
      
      setError(null);
      return { header, payload, signature };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to decode JWT.');
      return null;
    }
  }, [token]);

  return (
    <>
      <PageHeader
        title="JWT Decoder"
        description="Paste a JSON Web Token to decode and inspect its header, payload, and signature."
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Encoded Token</CardTitle>
            <CardDescription>Paste your JWT token here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              className="h-64 font-mono text-sm"
              aria-label="JWT input"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decoded Token</CardTitle>
            <CardDescription>The decoded header and payload.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Decoding Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <JsonBlock title="Header" data={decodedToken?.header ?? null} />
                <JsonBlock title="Payload" data={decodedToken?.payload ?? null} />
                 <div>
                    <Label className="text-lg font-semibold">Signature</Label>
                    <pre className="mt-2 p-4 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap overflow-x-auto border text-destructive">
                      {decodedToken?.signature ?? '...'}
                    </pre>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
