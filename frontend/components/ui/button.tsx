import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ember text-white hover:bg-ember-hover shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]",
        secondary: "bg-surface-2 text-paper border border-border hover:bg-surface-3",
        ghost: "text-muted hover:text-paper hover:bg-surface-2",
        outline: "border border-border text-paper hover:bg-surface-2",
        danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
        link: "text-ember hover:text-ember-hover underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export { buttonVariants };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
