
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import ToolCard from '@/components/tool-card';
import { SIDEBAR_NAV_ITEMS, type NavItemGroup, type NavItem } from '@/config/nav';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Moved the type guard outside the component to prevent re-creation on render.
const isNavGroup = (item: any): item is NavItemGroup => 'items' in item;

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const toolGroups = useMemo(() => {
    return SIDEBAR_NAV_ITEMS.filter(isNavGroup);
  }, []);

  const filteredToolGroups = useMemo(() => {
    if (!searchTerm.trim()) {
      return toolGroups;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    
    return toolGroups
      .map(group => {
        const filteredItems = group.items.filter(
          item =>
            item.label.toLowerCase().includes(lowercasedTerm) ||
            item.description?.toLowerCase().includes(lowercasedTerm)
        );
        
        if (filteredItems.length > 0) {
          return { ...group, items: filteredItems };
        }
        
        return null;
      })
      .filter((group): group is NavItemGroup => group !== null);

  }, [searchTerm, toolGroups]);

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Welcome to OmniApp!"
        description="Your all-in-one toolbox for development, design, and data tasks. Find the right tool below to get started."
      />
      
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for a tool (e.g., 'JSON', 'Color', 'Image')..."
          className="pl-12 h-14 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-12">
        {filteredToolGroups.length > 0 ? (
          filteredToolGroups.map((group) => (
            <section key={group.label} aria-labelledby={group.label.replace(/ /g, '-')}>
              <h2 id={group.label.replace(/ /g, '-')} className="text-2xl font-semibold tracking-tight mb-6 font-headline">{group.label}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((tool) => (
                  <ToolCard
                    key={tool.href}
                    title={tool.label}
                    description={tool.description || 'A useful tool.'}
                    href={tool.href}
                    icon={tool.icon}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-2xl font-semibold">No Tools Found</h3>
            <p>Your search for "{searchTerm}" did not match any tools.</p>
          </div>
        )}
      </div>
    </div>
  );
}
