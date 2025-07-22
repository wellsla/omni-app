
interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export default function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
