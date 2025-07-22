
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// A component to render the text with highlighted matches
const HighlightedText = ({ text, regex }: { text: string; regex: RegExp | null }) => {
    if (!regex || !text || !regex.source || regex.source === '(?:)') {
        return <pre className="whitespace-pre-wrap">{text}</pre>;
    }

    try {
        const parts = text.split(regex);
        const matches = text.match(regex);

        if (!matches || matches.length === 0) {
            return <pre className="whitespace-pre-wrap">{text}</pre>;
        }
        
        let lastIndex = 0;
        const result = matches.flatMap((match, i) => {
            const matchIndex = text.indexOf(match, lastIndex);
            const prefix = text.substring(lastIndex, matchIndex);
            lastIndex = matchIndex + match.length;

            return [
                <span key={`prefix-${i}`}>{prefix}</span>,
                <mark key={`match-${i}`} className="bg-accent/50 text-accent-foreground rounded-md px-1">
                    {match}
                </mark>
            ];
        });

        result.push(<span key="suffix">{text.substring(lastIndex)}</span>);
        
        return <pre className="whitespace-pre-wrap">{result}</pre>;

    } catch (e) {
        return <pre className="whitespace-pre-wrap">{text}</pre>;
    }
};


export default function RegexTesterPage() {
    const [regexString, setRegexString] = useState<string>('\\w+');
    const [flags, setFlags] = useState<string>('g');
    const [testString, setTestString] = useState<string>("Hello world, this is a test string for our regex tester.");
    const [error, setError] = useState<string | null>(null);

    const { regex, matches } = useMemo(() => {
        try {
            // Prevent empty regex from throwing an error unnecessarily
            if (!regexString) {
                setError(null);
                return { regex: null, matches: [] };
            }
            const re = new RegExp(regexString, flags);
            setError(null);
            const allMatches = testString.match(re);
            return { regex: re, matches: allMatches || [] };
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invalid Regular Expression');
            return { regex: null, matches: [] };
        }
    }, [regexString, flags, testString]);

    return (
        <>
            <PageHeader
                title="Regex Tester"
                description="Build and test your regular expressions in real-time."
            />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Inputs Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inputs</CardTitle>
                        <CardDescription>Define your expression and test string.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-[1fr,100px] gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="regex-input">Regular Expression</Label>
                                <Input
                                    id="regex-input"
                                    value={regexString}
                                    onChange={(e) => setRegexString(e.target.value)}
                                    className={`font-mono ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    placeholder="e.g., [a-z]+"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="flags-input">Flags</Label>
                                <Input
                                    id="flags-input"
                                    value={flags}
                                    onChange={(e) => setFlags(e.target.value)}
                                    className="font-mono"
                                    placeholder="gmi"
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                        
                        <div className="space-y-2">
                            <Label htmlFor="test-string">Test String</Label>
                            <Textarea
                                id="test-string"
                                value={testString}
                                onChange={(e) => setTestString(e.target.value)}
                                placeholder="Paste your string to test here..."
                                className="h-64 font-mono"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Results Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>Highlighted matches and match information will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Highlighted Matches</h3>
                                <div className="p-4 rounded-md border bg-muted min-h-[120px]">
                                    <HighlightedText text={testString} regex={regex} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Match Information</h3>
                                <div className="p-4 rounded-md border bg-muted min-h-[120px]">
                                    {error ? (
                                        <p className="text-destructive text-center py-8">{error}</p>
                                    ) : matches.length > 0 ? (
                                        <>
                                            <div className="mb-4">
                                                Found <Badge variant="secondary">{matches.length}</Badge> match(es).
                                            </div>
                                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                                {matches.map((match, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-sm">
                                                        <Badge variant="outline">{index}</Badge>
                                                        <span className="font-mono bg-background p-1 rounded">{match}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">No matches found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
