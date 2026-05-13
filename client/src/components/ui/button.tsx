import * as React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg' | string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const baseClassName = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    );

    if (asChild) {
      // If used with asChild (e.g. wrapping a Link), we render a motion.div that acts as the container
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={baseClassName}
        >
          {children}
        </motion.div>
      );
    }

    // Standard motion button
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={baseClassName}
        ref={ref}
        {...props as any}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button }