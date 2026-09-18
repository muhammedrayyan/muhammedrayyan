import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  color,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  const style: CSSProperties | undefined = color
    ? { backgroundColor: `${color}1f`, color }
    : undefined;

  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        !color && !className && "bg-[#efedf8] text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
