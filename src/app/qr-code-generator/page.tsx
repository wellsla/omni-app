
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import QRCode from 'qrcode';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Download, QrCode as QrCodeIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const qrCodeSchema = z.object({
  content: z.string().min(1, 'Content is required to generate a QR code.'),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  size: z.number().min(64).max(1024).default(256),
  darkColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color.').default('#000000'),
  lightColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color.').default('#FFFFFF'),
});

type QRCodeFormData = z.infer<typeof qrCodeSchema>;

export default function QrCodeGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { control, watch, formState: { errors } } = useForm<QRCodeFormData>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues: {
      content: 'https://firebase.google.com/studio',
      errorCorrectionLevel: 'M',
      size: 256,
      darkColor: '#000000',
      lightColor: '#FFFFFF',
    },
    mode: 'onBlur',
  });

  const formData = watch();

  useEffect(() => {
    const generateQrCode = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !formData.content) return;

      try {
        await QRCode.toCanvas(canvas, formData.content, {
          errorCorrectionLevel: formData.errorCorrectionLevel as QRCode.QRCodeErrorCorrectionLevel,
          width: formData.size,
          color: {
            dark: formData.darkColor,
            light: formData.lightColor,
          },
          margin: 2,
        });
      } catch (err) {
        console.error(err);
        toast({
          title: 'Generation Failed',
          description: 'Could not generate QR code. Check console for details.',
          variant: 'destructive',
        });
      }
    };
    generateQrCode();
  }, [formData, toast]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Download Started', description: 'Your QR code is being downloaded.' });
  };

  return (
    <>
      <PageHeader
        title="QR Code Generator"
        description="Create and customize QR codes for URLs, text, and more, then download as a PNG."
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr,400px]">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Content & Customization</CardTitle>
            <CardDescription>Enter the data and adjust the appearance of your QR code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content">Content (URL or Text)</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Input id="content" placeholder="https://example.com" {...field} />
                )}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Size: {formData.size}px</Label>
              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    min={64}
                    max={1024}
                    step={32}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="darkColor">Foreground Color</Label>
                <Controller
                    name="darkColor"
                    control={control}
                    render={({ field }) => (
                        <div className="relative">
                            <Input id="darkColor" type="text" className="pl-12" {...field} />
                            <Input type="color" className="absolute left-1 top-1 h-8 w-10 p-1 bg-transparent border-none" value={field.value} onChange={field.onChange} />
                        </div>
                    )}
                />
                 {errors.darkColor && <p className="text-sm text-destructive">{errors.darkColor.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lightColor">Background Color</Label>
                 <Controller
                    name="lightColor"
                    control={control}
                    render={({ field }) => (
                        <div className="relative">
                            <Input id="lightColor" type="text" className="pl-12" {...field} />
                            <Input type="color" className="absolute left-1 top-1 h-8 w-10 p-1 bg-transparent border-none" value={field.value} onChange={field.onChange} />
                        </div>
                    )}
                />
                {errors.lightColor && <p className="text-sm text-destructive">{errors.lightColor.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorCorrectionLevel">Error Correction</Label>
              <Controller
                name="errorCorrectionLevel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="errorCorrectionLevel"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (~7% correction)</SelectItem>
                      <SelectItem value="M">Medium (~15% correction)</SelectItem>
                      <SelectItem value="Q">Quartile (~25% correction)</SelectItem>
                      <SelectItem value="H">High (~30% correction)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

          </CardContent>
          <CardFooter>
            <Button onClick={handleDownload} disabled={!formData.content} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download PNG
            </Button>
          </CardFooter>
        </Card>

        {/* Preview */}
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="p-4 bg-white rounded-lg shadow-md inline-block">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </CardContent>
           <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">QR code updates automatically.</p>
           </CardFooter>
        </Card>
      </div>
    </>
  );
}
