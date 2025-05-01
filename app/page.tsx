"use client"

import { useState } from "react"
import { ArrowUpDown, CheckCircle, FileText, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { TimePeriodTabs, type TimePeriod } from "@/components/time-period-tabs"
import { SubmissionList, type WorkflowStage } from "@/components/submission-list"
import { WorkflowDistributionChart } from "@/components/workflow-distribution-chart"
import { PendingActionsCard } from "@/components/pending-actions-card"
import { mockSubmissions, mockPendingActions, distributionData } from "@/lib/mock-data"

export default function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week")
  const [stageFilter, setStageFilter] = useState<WorkflowStage | "all">("all")

  const filteredSubmissions =
    stageFilter === "all" ? mockSubmissions : mockSubmissions.filter((submission) => submission.stage === stageFilter)

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period)
    // In a real app, you would fetch data for the selected period
  }

  const handleStageFilterChange = (stage: WorkflowStage | "all") => {
    setStageFilter(stage)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <TimePeriodTabs onPeriodChange={handlePeriodChange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Submissions"
          value="45"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          iconClassName="bg-light-blue text-sky-blue"
        />
        <SummaryCard
          title="Approved Quotes"
          value="18"
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
          iconClassName="bg-light-green text-emerald-green"
        />
        <SummaryCard
          title="Rejected Submissions"
          value="7"
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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SubmissionList submissions={filteredSubmissions.slice(0, 10)} onFilterChange={handleStageFilterChange} />
        </div>
        <div className="lg:col-span-1 w-full">
          <WorkflowDistributionChart data={distributionData} />
        </div>
      </div>

      <div className="w-full">
        <PendingActionsCard actions={mockPendingActions} />
      </div>
    </div>
  )
}
