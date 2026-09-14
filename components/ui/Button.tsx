import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-cream hover:bg-ink-soft focus-visible:outline-gold disabled:bg-ink/40",
  secondary:
    "bg-transparent text-ink border border-ink/20 hover:border-gold hover:text-gold-deep focus-visible:outline-gold disabled:opacity-40",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 focus-visible:outline-gold disabled:opacity-40",
  danger:
    "bg-transparent text-red-700 border border-red-200 hover:bg-red-50 focus-visible:outline-red-400 disabled:opacity-40",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors duration-200 outline-offset-2 disabled:cursor-not-allowed",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
    );
  }
);

Button.displayName = "Button";
