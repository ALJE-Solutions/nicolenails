interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-cream/15 bg-cream/5 px-6 py-14 text-center">
      <p className="font-display text-lg text-cream/70">{title}</p>
      {description && <p className="mt-2 text-sm text-cream/50">{description}</p>}
    </div>
  );
}
