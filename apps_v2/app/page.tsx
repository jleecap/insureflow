import { Suspense } from "react"
import { ArrowUpDown, CheckCircle, FileText, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { TimePeriodTabs } from "@/components/time-period-tabs"
import { SubmissionList } from "@/components/submission-list"
import { WorkflowDistributionChart } from "@/components/workflow-distribution-chart"
import { PendingActionsCard } from "@/components/pending-actions-card"
import { getSummaryStats, getRecentSubmissions, getPendingActions, getWorkflowDistribution } from "@/lib/data-access"
import { Skeleton } from "@/components/ui/skeleton"

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

function LoadingSubmissionList() {
  return <Skeleton className="h-[400px] w-full" />
}

function LoadingDistributionChart() {
  return <Skeleton className="h-[300px] w-full" />
}

function LoadingPendingActions() {
  return <Skeleton className="h-[200px] w-full" />
}

// Dashboard summary cards component
async function DashboardSummaryCards() {
  const stats = await getSummaryStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total Submissions"
        value={stats.totalSubmissions.toString()}
        icon={FileText}
        trend={{ value: 12, isPositive: true }}
        iconClassName="bg-light-blue text-sky-blue"
      />
      <SummaryCard
        title="Approved Quotes"
        value={stats.proceedToQuote.toString()}
        icon={CheckCircle}
        trend={{ value: 8, isPositive: true }}
        iconClassName="bg-light-green text-emerald-green"
      />
      <SummaryCard
        title="Rejected Submissions"
        value={(stats.rejectedSubmissions + stats.rejected).toString()}
        icon={XCircle}
        trend={{ value: 3, isPositive: false }}
        iconClassName="bg-light-coral text-electric-coral"
      />
      <SummaryCard
        title="Average Processing Time"
        value="2.4 days"
        icon={ArrowUpDown}
        trend={{ value: 15, isPositive: true }}
        iconClassName="bg-light-purple text-lavender-indigo"
      />
    </div>
  )
}

// Recent submissions component
async function RecentSubmissionsSection() {
  const submissions = await getRecentSubmissions(10)

  return <SubmissionList submissions={submissions} />
}

// Distribution chart component
async function WorkflowDistributionSection() {
  const distributionData = await getWorkflowDistribution()

  return <WorkflowDistributionChart data={distributionData} />
}

// Pending actions component
async function PendingActionsSection() {
  const actions = await getPendingActions()

  return <PendingActionsCard actions={actions} />
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <TimePeriodTabs onPeriodChange={() => {}} />
      </div>

      <Suspense fallback={<LoadingSummaryCards />}>
        <DashboardSummaryCards />
      </Suspense>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSubmissionList />}>
            <RecentSubmissionsSection />
          </Suspense>
        </div>
        <div className="lg:col-span-1 w-full">
          <Suspense fallback={<LoadingDistributionChart />}>
            <WorkflowDistributionSection />
          </Suspense>
        </div>
      </div>

      <div className="w-full">
        <Suspense fallback={<LoadingPendingActions />}>
          <PendingActionsSection />
        </Suspense>
      </div>
    </div>
  )
}
