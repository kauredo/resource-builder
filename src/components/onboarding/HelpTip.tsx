interface HelpTipProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A warm, friendly tip for first-time users.
 * Feels like helpful guidance from a creative partner, not software documentation.
 */
export function HelpTip({ children, className = "" }: HelpTipProps) {
  return (
    <p
      className={`text-sm leading-relaxed text-muted-foreground/80 italic ${className}`}
      role="note"
    >
      {children}
    </p>
  );
}
