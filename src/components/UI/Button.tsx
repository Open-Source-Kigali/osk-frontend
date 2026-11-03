import { forwardRef } from "react";
import { cn }         from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  icon?:      React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  href?:      string;
  external?:  boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   "bg-[#2b7fff] hover:bg-[#1a6fef] text-white border-transparent",
  secondary: "bg-transparent hover:bg-[#2b7fff] hover:text-white text-[#2b7fff] border-[#c5d9ff] hover:border-[#2b7fff]",
  ghost:     "bg-transparent hover:bg-white/10 text-white/70 hover:text-white border-white/20 hover:border-white/40",
  dark:      "bg-gray-900 hover:bg-gray-700 text-white border-transparent",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-8 py-4 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      loading   = false,
      icon,
      iconRight,
      fullWidth = false,
      children,
      className,
      disabled,
      href,
      external,
      ...props
    },
    ref
  ) => {
    const base = cn(
      "inline-flex cursor-pointer items-center justify-center font-bold rounded-full border",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff] focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      VARIANTS[variant],
      SIZES[size],
      fullWidth && "w-full",
      className
    );

    const content = (
      <>
        {loading
          ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          : icon}
        {children}
        {!loading && iconRight}
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          className={base}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={base}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";