
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const WireframeCanvas = dynamic(() => import('@/components/wireframe-canvas'), {
  ssr: false,
  loading: () => (
     <div className="flex h-[calc(100vh-10rem)] w-full rounded-lg border">
        <Skeleton className="w-56" />
        <div className="flex-1 p-4"><Skeleton className="h-full w-full" /></div>
        <Skeleton className="w-72" />
     </div>
  ),
});


export default function WireframeBuilderPage() {
  return <WireframeCanvas />;
}
