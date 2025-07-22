"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { SIDEBAR_NAV_ITEMS } from '@/config/nav';
import type { NavItem } from '@/config/nav';
import { ThemeSwitcher } from '@/components/theme-switcher';

const allNavItems: NavItem[] = SIDEBAR_NAV_ITEMS.flatMap(item => 'items' in item ? item.items : [item]).filter((item): item is NavItem => 'href' in item);

export default function AppHeader() {
  const pathname = usePathname();
  const currentNavItem = allNavItems.find(item => item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href)));
  const pageTitle = currentNavItem ? currentNavItem.label : "OmniApp";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-xl font-semibold">{pageTitle}</h1>
      <ThemeSwitcher />
    </header>
  );
}
