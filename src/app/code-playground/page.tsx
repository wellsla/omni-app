
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Play, Trash2, Terminal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type ConsoleMessage = {
  type: 'log' | 'error' | 'warn';
  message: string;
};

// This HTML content will be used for the sandboxed iframe
const iframeContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
  <script>
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
    };

    const postMessageToParent = (type, message) => {
        window.parent.postMessage({ type, message }, '*');
    };

    console.log = (...args) => {
        originalConsole.log(...args); // Keep original behavior
        postMessageToParent('log', args);
    };
    console.error = (...args) => {
        originalConsole.error(...args);
        postMessageToParent('error', args);
    };
    console.warn = (...args) => {
        originalConsole.warn(...args);
        postMessageToParent('warn', args);
    };
    
    window.addEventListener('message', (event) => {
      try {
        new Function(event.data)();
        postMessageToParent('finished', []);
      } catch (e) {
        postMessageToParent('error', [e.message]);
        postMessageToParent('finished', []);
      }
    });
  </script>
</body>
</html>
`;


export default function CodePlaygroundPage() {
  const [code, setCode] = useState('console.log("Hello, Playground!");\n\nfor (let i = 0; i < 5; i++) {\n  console.log({ iteration: i, timestamp: new Date().getTime() });\n}');
  const [consoleOutput, setConsoleOutput] = useState<ConsoleMessage[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const handleRunCode = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    setIsExecuting(true);
    setConsoleOutput([]);
    iframeRef.current.contentWindow.postMessage(code, '*');
  };

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.source !== iframeRef.current?.contentWindow) return;

    const { type, message } = event.data;

    if (type === 'finished') {
        setIsExecuting(false);
        toast({
          title: "Execution Finished",
          description: "Your JavaScript code has been executed in the sandbox."
        });
        return;
    }
    
    if (['log', 'error', 'warn'].includes(type)) {
      const formattedMessage = message.map((arg: any) => {
        try {
          if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg, null, 2);
          if (typeof arg === 'undefined') return 'undefined';
          return String(arg);
        } catch (e) {
          return 'Unserializable object';
        }
      }).join(' ');

      setConsoleOutput(prev => [...prev, { type, message: formattedMessage }]);
    }
  }, [toast]);
  
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  
  const handleClear = () => {
    setConsoleOutput([]);
  };
  
  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
        case 'error': return 'text-destructive';
        case 'warn': return 'text-yellow-500 dark:text-yellow-400';
        default: return 'text-foreground';
    }
  }

  return (
    <>
      <PageHeader
        title="Code Playground"
        description="Write, run, and test JavaScript code snippets directly in a secure, sandboxed browser environment."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
        {/* Code Editor */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Code Editor (JavaScript)</CardTitle>
            <CardDescription>Enter your JavaScript code below.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your JavaScript code here..."
              className="h-full resize-none font-mono text-sm"
              aria-label="JavaScript code editor"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleRunCode} className="w-full" disabled={isExecuting}>
              <Play className="mr-2 h-4 w-4" />
              {isExecuting ? 'Executing...' : 'Run Code'}
            </Button>
          </CardFooter>
        </Card>

        {/* Console Output */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle>Console</CardTitle>
                <CardDescription>Output and errors will appear here.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={consoleOutput.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
            </Button>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full bg-muted/50 rounded-md border p-4">
                {consoleOutput.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Terminal className="h-12 w-12 mb-2"/>
                        <p>Console is waiting for output...</p>
                    </div>
                ) : (
                    <div className="space-y-2 font-mono text-sm">
                        {consoleOutput.map((msg, index) => (
                           <div key={index} className={`flex items-start gap-2 ${getMessageColor(msg.type)}`}>
                             <span className="opacity-50 select-none">&gt;</span>
                             <pre className="whitespace-pre-wrap break-words">{msg.message}</pre>
                           </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={iframeContent}
        sandbox="allow-scripts"
        style={{ display: 'none' }}
        title="Code Execution Sandbox"
      />
    </>
  );
}
