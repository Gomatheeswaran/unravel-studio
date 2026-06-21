import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "free" | "paid" | "success" | "warning" | "error" | "admin";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
        {
          "bg-[#2a2a3a] text-gray-300": variant === "default",
          "bg-green-500/20 text-green-400 border border-green-500/30": variant === "free",
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30": variant === "paid",
          "bg-green-600 text-white": variant === "success",
          "bg-yellow-600 text-white": variant === "warning",
          "bg-red-600 text-white": variant === "error",
          "bg-purple-600 text-white": variant === "admin",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
