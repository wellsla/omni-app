
"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TOOL_TIPS } from '@/config/nav';
import { Lightbulb, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TipsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroup, setActiveGroup] = useState(TOOL_TIPS[0]?.group || '');

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return TOOL_TIPS;
    
    const lowercasedTerm = searchTerm.toLowerCase();

    return TOOL_TIPS.map(group => {
        const filteredTips = group.tips.filter(tip => 
            tip.tool.toLowerCase().includes(lowercasedTerm) || 
            tip.tip.toLowerCase().includes(lowercasedTerm)
        );

        // If the group name matches, include all its tips
        if (group.group.toLowerCase().includes(lowercasedTerm)) {
            return group;
        }

        // Otherwise, if any tips within the group match, return the group with just those tips
        if (filteredTips.length > 0) {
            return { ...group, tips: filteredTips };
        }

        return null;
    }).filter(Boolean) as typeof TOOL_TIPS;
  }, [searchTerm]);

  const handleNavClick = (groupName: string) => {
    setActiveGroup(groupName);
    const element = document.getElementById(groupName);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <PageHeader
        title="OmniApp Tips & Tutorials"
        description="Learn how to make the most of each tool with these helpful tips and tricks."
      />
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
        {/* Navigation Sidebar */}
        <aside className="sticky top-24 hidden md:block">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search tips..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <nav className="flex flex-col gap-1">
                {filteredGroups.map(group => (
                    <button
                        key={group.group}
                        onClick={() => handleNavClick(group.group)}
                        className={cn(
                            "px-3 py-2 text-sm font-medium rounded-md text-left transition-colors",
                            activeGroup === group.group ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                    >
                        {group.group}
                    </button>
                ))}
            </nav>
        </aside>

        {/* Tips Content */}
        <main className="space-y-12">
            {filteredGroups.length > 0 ? (
                filteredGroups.map(group => (
                    <section key={group.group} id={group.group} className="scroll-mt-24">
                        <h2 className="text-2xl font-bold tracking-tight mb-6">{group.group}</h2>
                        <div className="space-y-6">
                            {group.tips.map((tip, index) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle>{tip.tool}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-start gap-3">
                                            <Lightbulb className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
                                            <p className="text-muted-foreground">{tip.tip}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                 <div className="text-center py-24 text-muted-foreground">
                    <h3 className="text-2xl font-semibold">No Tips Found</h3>
                    <p>Your search for "{searchTerm}" did not match any tips.</p>
                </div>
            )}
        </main>
      </div>
    </>
  );
}
