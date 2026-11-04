export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}
