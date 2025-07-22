
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { SIDEBAR_NAV_ITEMS, type NavItem, type NavItemGroup } from '@/config/nav';
import { cn } from '@/lib/utils';
import React from 'react';

const isNavItem = (item: NavItem | NavItemGroup): item is NavItem => 'href' in item;
const isNavGroup = (item: NavItem | NavItemGroup): item is NavItemGroup => 'items' in item;

export default function SidebarNav() {
  const pathname = usePathname();

  const activeCheck = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {SIDEBAR_NAV_ITEMS.map((item, index) => {
        if (isNavGroup(item)) {
          return (
            <SidebarGroup key={index}>
              <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((subItem) => (
                    <SidebarMenuItem key={subItem.href}>
                       <Link href={subItem.href} legacyBehavior={false}>
                        <SidebarMenuButton
                          as="a"
                          isActive={activeCheck(subItem.href)}
                          className="justify-center md:justify-start"
                          tooltip={{ children: subItem.label, side: "right", align: "center" }}
                        >
                           <subItem.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                           <span className="truncate group-data-[collapsible=icon]:hidden">{subItem.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        }
        return null;
      })}
    </>
  );
}
