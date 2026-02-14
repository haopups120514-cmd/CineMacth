interface TagBadgeProps {
  text: string;
  variant?: "default" | "accent" | "muted";
}

export default function TagBadge({ text, variant = "default" }: TagBadgeProps) {
  const styles = {
    default: "border-white/15 bg-white/5 text-neutral-400",
    accent: "border-[#5CC8D6]/30 bg-[#5CC8D6]/15 text-[#5CC8D6]",
    muted: "border-white/10 bg-white/5 text-neutral-500",
  };

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs ${styles[variant]}`}
    >
      {text}
    </span>
  );
}
