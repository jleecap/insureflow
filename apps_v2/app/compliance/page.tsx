import { Suspense } from "react"
import { AlertCircle, CheckCircle, Shield, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSummaryStats, getSubmissionsWithComplianceStatus } from "@/lib/data-access"
import { ComplianceContent } from "./compliance-content"

// Loading component for Suspense fallback
function LoadingSummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[120px] w-full" />
      ))}
    </div>
  )
}

function LoadingContent() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <Skeleton className="lg:col-span-1 h-[500px]" />
      <Skeleton className="lg:col-span-2 h-[500px]" />
    </div>
  )
}

// Summary cards component
async function ComplianceSummaryCards() {
  const stats = await getSummaryStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total Checks"
        value={stats.totalSubmissions.toString()}
        icon={Shield}
        iconClassName="bg-light-blue text-sky-blue"
      />
      <SummaryCard
        title="Non-Compliant"
        value={stats.nonCompliantSubmissions.toString()}
        icon={XCircle}
        iconClassName="bg-light-coral text-electric-coral"
      />
      <SummaryCard
        title="Compliant"
        value={stats.compliantSubmissions.toString()}
        icon={CheckCircle}
        iconClassName="bg-light-green text-emerald-green"
      />
      <SummaryCard
        title="In Progress"
        value={stats.inProgressSubmissions.toString()}
        icon={AlertCircle}
        iconClassName="bg-light-yellow text-goldenrod-yellow"
      />
    </div>
  )
}

// Main content component
async function ComplianceMainContent() {
  const submissions = await getSubmissionsWithComplianceStatus()

  return <ComplianceContent submissions={submissions} />
}

export default function ComplianceCheckPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSummaryCards />}>
        <ComplianceSummaryCards />
      </Suspense>

      <Suspense fallback={<LoadingContent />}>
        <ComplianceMainContent />
      </Suspense>
    </div>
  )
}
