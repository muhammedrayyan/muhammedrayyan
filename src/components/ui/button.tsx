import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variantStyles: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-[#6a57e0]",
  secondary:
    "bg-white text-foreground border border-border hover:bg-[#f2f1fa]",
  ghost: "text-muted hover:bg-[#efedf8] hover:text-foreground",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
