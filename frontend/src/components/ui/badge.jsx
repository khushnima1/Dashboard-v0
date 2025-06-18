import * as React from "react"

const badgeVariants = {
  default: "bg-primary/10 text-primary hover:bg-primary/20",
  secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
  warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
}

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeVariants[variant]} ${className}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge, badgeVariants } 