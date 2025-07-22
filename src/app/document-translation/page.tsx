
"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/page-header';
import FileUploader from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { translateDocument, type TranslateDocumentInput } from '@/ai/flows/translate-document';
import { translateText, type TranslateTextInput } from '@/ai/flows/translate-text';
import { readFileAsDataURL, downloadDataUri } from '@/lib/utils';
import { Loader2, Languages, Download, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Shared language data
const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "pt", label: "Portuguese (Brazil)" },
  { value: "auto", label: "Auto-detect (Source only)"}
];

// Schema for document translation form
const docFormSchema = z.object({
  file: z.instanceof(File, { message: "Please upload a document." }),
  sourceLanguage: z.string().min(1, "Source language is required."),
  targetLanguage: z.string().min(1, "Target language is required."),
});
type DocFormData = z.infer<typeof docFormSchema>;


// The main page component
export default function TranslationPage() {
  const { toast } = useToast();

  // State for Text Translator
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [textSourceLang, setTextSourceLang] = useState('auto');
  const [textTargetLang, setTextTargetLang] = useState('en');
  const [copied, setCopied] = useState(false);

  // State for Document Translator
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [translatedDocText, setTranslatedDocText] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');

  // Form hook for document translator
  const { control, handleSubmit: handleDocSubmit, formState: { errors: docErrors }, getValues: getDocValues } = useForm<DocFormData>({
    resolver: zodResolver(docFormSchema),
    defaultValues: {
      sourceLanguage: 'auto',
      targetLanguage: 'en',
    },
  });

  // --- Text Translation Logic ---
  const handleTextTranslate = async () => {
    if (!inputText.trim()) {
      toast({ title: 'Input Required', description: 'Please enter some text to translate.', variant: 'destructive' });
      return;
    }
    setIsTextLoading(true);
    setOutputText('');
    try {
      const input: TranslateTextInput = { text: inputText, sourceLanguage: textSourceLang, targetLanguage: textTargetLang };
      const result = await translateText(input);
      if (result && result.translatedText) {
        setOutputText(result.translatedText);
        toast({ title: 'Translation Successful' });
      } else {
        throw new Error('Translation returned no data.');
      }
    } catch (error) {
      toast({ title: 'Translation Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsTextLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (textSourceLang === 'auto') {
        toast({ title: "Cannot Swap", description: "Cannot swap languages when source is 'Auto-detect'.", variant: "destructive" });
        return;
    }
    setInputText(outputText);
    setOutputText(inputText);
    setTextSourceLang(textTargetLang);
    setTextTargetLang(textSourceLang);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Document Translation Logic ---
  const onDocSubmit = async (data: DocFormData) => {
    setIsDocLoading(true);
    setTranslatedDocText(null);
    setOriginalFileName(data.file.name);

    try {
      const documentDataUri = await readFileAsDataURL(data.file);
      const input: TranslateDocumentInput = {
        documentDataUri,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
      };
      const result = await translateDocument(input);
      if (result && result.translatedText) {
        setTranslatedDocText(result.translatedText);
        toast({ title: "Translation Successful", description: "The text from your document has been translated." });
      } else {
        throw new Error("Translation failed or returned no data.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast({ title: "Translation Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsDocLoading(false);
    }
  };

  const handleDownload = () => {
    if (translatedDocText && originalFileName) {
      const parts = originalFileName.split('.');
      const nameWithoutExt = parts.slice(0, -1).join('.');
      const targetLang = languages.find(l => l.value === getDocValues('targetLanguage'))?.label.toLowerCase() || getDocValues('targetLanguage');
      
      const textDataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(translatedDocText);
      downloadDataUri(textDataUri, `${nameWithoutExt}_translated_to_${targetLang}.txt`);
    }
  };

  return (
    <>
      <PageHeader
        title="Translation"
        description="Translate text snippets or entire documents into various languages using AI."
      />
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="text">Text Translation</TabsTrigger>
          <TabsTrigger value="document">Document Translation</TabsTrigger>
        </TabsList>

        {/* Text Translation Tab */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
                <CardTitle>Text Translator</CardTitle>
                <CardDescription>Enter text, select languages, and get instant translation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea 
                        placeholder="Enter text to translate..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px] resize-none"
                        aria-label="Source text for translation"
                    />
                    <div className="relative">
                        <Textarea 
                            placeholder={isTextLoading ? "Translating..." : "Translation will appear here..."}
                            value={outputText}
                            readOnly
                            className="min-h-[200px] resize-none bg-muted/50"
                            aria-label="Translated text"
                        />
                         {outputText && !isTextLoading && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy} aria-label="Copy translated text">
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                         )}
                         {isTextLoading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={textSourceLang} onValueChange={setTextSourceLang}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={`txt-src-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={handleSwapLanguages} disabled={textSourceLang === 'auto'}>
                            <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                        <Select value={textTargetLang} onValueChange={setTextTargetLang}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {languages.filter(l => l.value !== 'auto').map(lang => (
                                    <SelectItem key={`txt-tgt-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleTextTranslate} disabled={isTextLoading} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                        {isTextLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Translate Text
                    </Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Translation Tab */}
        <TabsContent value="document">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <form onSubmit={handleDocSubmit(onDocSubmit)}>
                <CardHeader>
                  <CardTitle>Translate Document</CardTitle>
                  <CardDescription>Upload a document, select languages, and get the translated text.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Document</Label>
                    <Controller
                      name="file"
                      control={control}
                      render={({ field }) => (
                         <FileUploader
                            id="file-upload"
                            onFileSelect={(file) => field.onChange(file)}
                            acceptedFileTypes=".txt,.pdf,.docx,.md"
                            maxFileSizeMB={5}
                          />
                      )}
                    />
                    {docErrors.file && <p className="text-sm text-destructive">{docErrors.file.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sourceLanguage">Source Language</Label>
                       <Controller
                        name="sourceLanguage"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="sourceLanguage"><SelectValue placeholder="Select source language" /></SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={`doc-src-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {docErrors.sourceLanguage && <p className="text-sm text-destructive">{docErrors.sourceLanguage.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetLanguage">Target Language</Label>
                      <Controller
                        name="targetLanguage"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="targetLanguage"><SelectValue placeholder="Select target language" /></SelectTrigger>
                            <SelectContent>
                              {languages.filter(l => l.value !== 'auto').map(lang => (
                                <SelectItem key={`doc-tgt-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {docErrors.targetLanguage && <p className="text-sm text-destructive">{docErrors.targetLanguage.message}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isDocLoading} className="w-full">
                    {isDocLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Translate Document
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Translated Text</CardTitle>
                    <CardDescription>The translated text from your document will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    {isDocLoading && (
                        <div className="space-y-2 h-full p-2 border rounded-md animate-pulse">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[95%]" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    )}
                    {!isDocLoading && translatedDocText && (
                        <ScrollArea className="h-full">
                           <Textarea
                              value={translatedDocText}
                              readOnly
                              className="h-full min-h-[250px] resize-none bg-muted/30 font-mono"
                              aria-label="Translated text"
                            />
                        </ScrollArea>
                    )}
                    {!isDocLoading && !translatedDocText && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground rounded-lg border-2 border-dashed">
                            <Languages className="h-12 w-12 mb-2" />
                            <p>Translated text will appear here.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                     <Button onClick={handleDownload} disabled={!translatedDocText || isDocLoading} className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Download as .txt
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
