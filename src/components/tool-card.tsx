
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export default function ToolCard({ title, description, href, icon: Icon }: ToolCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="flex flex-col h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 ease-in-out rounded-xl">
        <CardHeader className="flex-grow">
            <div className="p-3 mb-4 rounded-lg bg-primary text-primary-foreground w-fit">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
