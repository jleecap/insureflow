import { cn } from "@/lib/utils"

type StatusType =
  | "pending"
  | "processing"
  | "approved"
  | "rejected"
  | "needs-info"
  | "duplicate"
  | "unique"
  | "compliant"
  | "non-compliant"

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
  duplicate: {
    label: "Duplicate",
    className: "bg-light-coral text-electric-coral",
  },
  unique: {
    label: "Unique",
    className: "bg-light-green text-emerald-green",
  },
  compliant: {
    label: "Compliant",
    className: "bg-light-green text-emerald-green",
  },
  "non-compliant": {
    label: "Non-Compliant",
    className: "bg-light-coral text-electric-coral",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Default values in case status is not in statusConfig
  const config = statusConfig[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-200 text-gray-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
