import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-100",
        success:
          "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        destructive:
          "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        warning:
          "border border-accent-200 bg-accent-50 text-accent-700 hover:bg-accent-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
