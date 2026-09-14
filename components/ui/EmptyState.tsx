interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 px-6 py-14 text-center">
      <p className="font-display text-lg text-ink/70">{title}</p>
      {description && <p className="mt-2 text-sm text-ink/50">{description}</p>}
    </div>
  );
}
