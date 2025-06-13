import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MissingDataContent } from "./missing-data-content"

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
async function MissingDataSummaryCards() {
  return <div>Missing Data Summary Cards Content</div>
}

export default async function MissingDataPage() {
  return (
    <div>
      <Suspense fallback={<LoadingSummaryCards />}>
        <MissingDataSummaryCards />
      </Suspense>
      <Suspense fallback={<LoadingContent />}>
        <MissingDataContent />
      </Suspense>
    </div>
  )
}
