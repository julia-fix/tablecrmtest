import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--primary)] px-4 py-2.5 text-[color:var(--primary-foreground)] shadow-sm hover:opacity-90",
        outline:
          "border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2.5 text-[color:var(--foreground)] hover:bg-[color:var(--muted)]",
        secondary:
          "bg-[color:var(--secondary)] px-4 py-2.5 text-[color:var(--secondary-foreground)] hover:opacity-90",
        ghost: "px-3 py-2 text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
      },
      size: {
        default: "h-11",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-5 text-sm",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
