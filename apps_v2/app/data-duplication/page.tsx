import { Suspense } from "react"
import { AlertCircle, CheckCircle, FileText, Search } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSummaryStats, getSubmissionsWithDuplicateStatus } from "@/lib/data-access"
import { DataDuplicationContent } from "./data-duplication-content"

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
async function DataDuplicationSummaryCards() {
  const stats = await getSummaryStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total Submissions"
        value={stats.totalSubmissions.toString()}
        icon={FileText}
        iconClassName="bg-light-blue text-sky-blue"
      />
      <SummaryCard
        title="Duplicate Submissions"
        value={stats.duplicateSubmissions.toString()}
        icon={AlertCircle}
        iconClassName="bg-light-coral text-electric-coral"
      />
      <SummaryCard
        title="Unique Submissions"
        value={stats.uniqueSubmissions.toString()}
        icon={CheckCircle}
        iconClassName="bg-light-green text-emerald-green"
      />
      <SummaryCard
        title="Processing"
        value={stats.processingSubmissions.toString()}
        icon={Search}
        iconClassName="bg-light-yellow text-goldenrod-yellow"
      />
    </div>
  )
}

// Main content component
async function DataDuplicationMainContent() {
  const submissions = await getSubmissionsWithDuplicateStatus()

  return <DataDuplicationContent submissions={submissions} />
}

export default function DataDuplicationPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSummaryCards />}>
        <DataDuplicationSummaryCards />
      </Suspense>

      <Suspense fallback={<LoadingContent />}>
        <DataDuplicationMainContent />
      </Suspense>
    </div>
  )
}
