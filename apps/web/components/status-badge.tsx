import { cn } from "@/lib/utils"

type StatusType = "pending" | "processing" | "approved" | "rejected" | "needs-info"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-light-yellow text-goldenrod-yellow",
  },
  processing: {
    label: "Processing",
    className: "bg-light-blue text-sky-blue",
  },
  approved: {
    label: "Approved",
    className: "bg-light-green text-emerald-green",
  },
  rejected: {
    label: "Rejected",
    className: "bg-light-coral text-electric-coral",
  },
  "needs-info": {
    label: "Needs Info",
    className: "bg-light-purple text-lavender-indigo",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: badgeClassName } = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeClassName,
        className,
      )}
    >
      {label}
    </span>
  )
}
