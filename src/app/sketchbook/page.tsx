
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const SketchCanvas = dynamic(
    () => import('@/components/sketch-canvas'), 
    { 
        ssr: false,
        loading: () => <Skeleton className="h-[calc(100vh-14rem)] w-full rounded-lg" />
    }
);

export default function SketchbookPage() {
  return (
    <div className="h-[calc(100vh-14rem)] w-full text-card-foreground">
        <SketchCanvas />
    </div>
  );
}
