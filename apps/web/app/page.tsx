"use client"

import { useState } from "react"
import { ArrowUpDown, CheckCircle, FileText, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { TimePeriodTabs, type TimePeriod } from "@/components/time-period-tabs"
import { SubmissionList, type Submission, type WorkflowStage } from "@/components/submission-list"
import { WorkflowDistributionChart } from "@/components/workflow-distribution-chart"
import { PendingActionsCard } from "@/components/pending-actions-card"

// Mock data
const mockSubmissions: Submission[] = [
  {
    id: "1",
    reference: "SUB-2023-001",
    client: "Acme Corp",
    broker: "ABC Insurance",
    submissionDate: "2023-05-15",
    stage: "extraction",
    status: "needs-info",
    lineOfBusiness: "Property",
  },
  {
    id: "2",
    reference: "SUB-2023-002",
    client: "TechStart Inc",
    broker: "XYZ Brokers",
    submissionDate: "2023-05-16",
    stage: "core-data",
    status: "processing",
    lineOfBusiness: "Cyber",
  },
  {
    id: "3",
    reference: "SUB-2023-003",
    client: "Global Logistics",
    broker: "Insurance Partners",
    submissionDate: "2023-05-17",
    stage: "enrichment",
    status: "pending",
    lineOfBusiness: "Marine",
  },
  {
    id: "4",
    reference: "SUB-2023-004",
    client: "Retail Chain Ltd",
    broker: "Risk Solutions",
    submissionDate: "2023-05-18",
    stage: "rank",
    status: "approved",
    lineOfBusiness: "Liability",
    premium: 25000,
  },
  {
    id: "5",
    reference: "SUB-2023-005",
    client: "Manufacturing Co",
    broker: "Global Insurance",
    submissionDate: "2023-05-19",
    stage: "rank",
    status: "rejected",
    lineOfBusiness: "Property",
  },
]

const mockPendingActions = [
  {
    id: "1",
    title: "Review Missing Information",
    description: "Acme Corp submission is missing business description and claims history",
    priority: "high",
    stage: "Quote Submission",
  },
  {
    id: "2",
    title: "Verify Compliance Check",
    description: "Manual review required for Global Logistics compliance check",
    priority: "medium",
    stage: "Data Enrichment",
  },
  {
    id: "3",
    title: "Approve Quotation",
    description: "Final approval needed for Retail Chain Ltd quotation",
    priority: "low",
    stage: "Rank & Reject",
  },
]

const distributionData = [
  { name: "Quote Submission", value: 12, color: "#3ABFF8" },
  { name: "Core Data Check", value: 8, color: "#FBBF24" },
  { name: "Data Enrichment", value: 15, color: "#6366F1" },
  { name: "Rank & Reject", value: 10, color: "#10B981" },
]

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

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SubmissionList submissions={filteredSubmissions} onFilterChange={handleStageFilterChange} />
        </div>
        <div className="grid gap-6 lg:col-span-2">
          <WorkflowDistributionChart data={distributionData} />
          <PendingActionsCard actions={mockPendingActions} />
        </div>
      </div>
    </div>
  )
}
