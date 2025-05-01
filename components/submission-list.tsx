"use client"

import { useState } from "react"
import { ArrowUpDown, ChevronDown, FileText, Filter, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SubmissionDetails } from "@/components/submission-details"

export type WorkflowStage = "extraction" | "core-data" | "enrichment" | "rank"
export type SubmissionStatus =
  | "pending"
  | "processing"
  | "approved"
  | "rejected"
  | "needs-info"
  | "duplicate"
  | "unique"
  | "compliant"
  | "non-compliant"

export interface Submission {
  id: string
  reference: string
  client: string
  broker: string
  submissionDate: string
  stage: WorkflowStage
  status: SubmissionStatus
  lineOfBusiness: string
  premium?: number
  location?: string
  propertyType?: string
  coverageAmount?: string
}

interface SubmissionListProps {
  submissions: Submission[]
  onFilterChange?: (stage: WorkflowStage | "all") => void
}

export function SubmissionList({ submissions, onFilterChange }: SubmissionListProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  const handleRowClick = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const handleFilterChange = (stage: WorkflowStage | "all") => {
    if (onFilterChange) {
      onFilterChange(stage)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Recent Submissions</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFilterChange("all")}>All Stages</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("extraction")}>Missing Data Check</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("core-data")}>
                Data Duplication Check
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("enrichment")}>Compliance Check</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("rank")}>Guideline Check</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowUpDown className="h-4 w-4" />
            <span>Sort</span>
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Line of Business</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow
                key={submission.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(submission)}
              >
                <TableCell className="font-medium">{submission.reference}</TableCell>
                <TableCell>{submission.client}</TableCell>
                <TableCell>{submission.broker}</TableCell>
                <TableCell>{submission.submissionDate}</TableCell>
                <TableCell>
                  {submission.stage === "extraction" && "Missing Data Check"}
                  {submission.stage === "core-data" && "Data Duplication Check"}
                  {submission.stage === "enrichment" && "Compliance Check"}
                  {submission.stage === "rank" && "Guideline Check"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={submission.status} />
                </TableCell>
                <TableCell>{submission.lineOfBusiness}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Assign</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && <SubmissionDetails submission={selectedSubmission} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
