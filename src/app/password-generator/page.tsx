
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, RefreshCw } from 'lucide-react';

const characterSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export default function PasswordGeneratorPage() {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const generatePassword = React.useCallback(() => {
        let charset = '';
        if (includeUppercase) charset += characterSets.uppercase;
        if (includeLowercase) charset += characterSets.lowercase;
        if (includeNumbers) charset += characterSets.numbers;
        if (includeSymbols) charset += characterSets.symbols;

        if (charset.length === 0) {
            toast({
                title: 'No Characters Selected',
                description: 'Please select at least one character set.',
                variant: 'destructive',
            });
            setPassword('');
            return;
        }

        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(newPassword);
    }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, toast]);

    React.useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const handleCopy = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        toast({ title: "Copied password to clipboard!" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <PageHeader
                title="Password Generator"
                description="Create strong, secure, and random passwords tailored to your needs."
            />
            <div className="flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Generated Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={password}
                                placeholder="Your password will appear here"
                                className="text-xl font-mono h-14"
                                aria-label="Generated Password"
                            />
                            <Button variant="outline" size="icon" className="h-14 w-14" onClick={handleCopy} aria-label="Copy password">
                                {copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
                            </Button>
                            <Button variant="outline" size="icon" className="h-14 w-14" onClick={generatePassword} aria-label="Generate new password">
                                <RefreshCw className="h-6 w-6" />
                            </Button>
                        </div>
                    </CardContent>
                    
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Adjust the settings to create your perfect password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="length">Password Length: {length}</Label>
                            <Slider
                                id="length"
                                min={8}
                                max={64}
                                step={1}
                                value={[length]}
                                onValueChange={(value) => setLength(value[0])}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="uppercase">Include Uppercase (A-Z)</Label>
                                <Switch
                                    id="uppercase"
                                    checked={includeUppercase}
                                    onCheckedChange={setIncludeUppercase}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="lowercase">Include Lowercase (a-z)</Label>
                                <Switch
                                    id="lowercase"
                                    checked={includeLowercase}
                                    onCheckedChange={setIncludeLowercase}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="numbers">Include Numbers (0-9)</Label>
                                <Switch
                                    id="numbers"
                                    checked={includeNumbers}
                                    onCheckedChange={setIncludeNumbers}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="symbols">Include Symbols (!@#...)</Label>
                                <Switch
                                    id="symbols"
                                    checked={includeSymbols}
                                    onCheckedChange={setIncludeSymbols}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
