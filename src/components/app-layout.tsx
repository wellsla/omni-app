
"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader as ShadSidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';
import AppHeader from '@/components/app-header';
import { usePathname } from 'next/navigation';
import { ChevronsLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import ScrollToTopButton from './scroll-to-top-button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r bg-sidebar">
        <ShadSidebarHeader className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden font-headline">
            Omni<span className="text-accent">App</span>
          </h1>
        </ShadSidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <div className="p-2 border-t mt-auto">
          <SidebarTrigger
            className={cn(
              "flex items-center justify-center w-full p-2 rounded-md",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <ChevronsLeft className="h-5 w-5 transition-transform duration-300 group-data-[collapsible=icon]:rotate-180" />
            <span className="sr-only">Collapse</span>
          </SidebarTrigger>
        </div>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main id="main-content" className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
          <ScrollToTopButton scrollContainerSelector="#main-content" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
