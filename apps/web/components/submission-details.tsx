import { Check, Clock, FileText, X } from "lucide-react"
import type { Submission } from "@/components/submission-list"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface SubmissionDetailsProps {
  submission: Submission
}

export function SubmissionDetails({ submission }: SubmissionDetailsProps) {
  // Map stage to progress percentage
  const stageProgress = {
    extraction: 25,
    "core-data": 50,
    enrichment: 75,
    rank: 100,
  }

  const stageIndex = {
    extraction: 0,
    "core-data": 1,
    enrichment: 2,
    rank: 3,
  }

  const stages = [
    { id: "extraction", name: "Quote Submission" },
    { id: "core-data", name: "Core Data Check" },
    { id: "enrichment", name: "Data Enrichment" },
    { id: "rank", name: "Rank & Reject" },
  ]

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Reference</h3>
          <p className="text-base font-semibold">{submission.reference}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <StatusBadge status={submission.status} className="mt-1" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
          <p className="text-base">{submission.client}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Broker</h3>
          <p className="text-base">{submission.broker}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Submission Date</h3>
          <p className="text-base">{submission.submissionDate}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Line of Business</h3>
          <p className="text-base">{submission.lineOfBusiness}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-base font-semibold">Workflow Progress</h3>
        <Progress value={stageProgress[submission.stage]} className="h-2" />

        <div className="mt-6 grid gap-4">
          {stages.map((stage, index) => {
            const isCurrentStage = stage.id === submission.stage
            const isCompleted = stageIndex[submission.stage] > index
            const isPending = stageIndex[submission.stage] < index

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4",
                  isCurrentStage && "border-sky-blue bg-light-blue",
                  isCompleted && "border-emerald-green bg-light-green",
                  isPending && "opacity-60",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    isCurrentStage && "bg-sky-blue text-white",
                    isCompleted && "bg-emerald-green text-white",
                    isPending && "border border-gray-300 bg-white",
                  )}
                >
                  {isCompleted && <Check className="h-5 w-5" />}
                  {isCurrentStage && <Clock className="h-5 w-5" />}
                  {isPending && <span className="text-sm font-medium">{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{stage.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stage.id === "extraction" && "Extracting and validating submission data"}
                    {stage.id === "core-data" && "Checking for duplicate records"}
                    {stage.id === "enrichment" && "Enriching data with external sources"}
                    {stage.id === "rank" && "Evaluating against underwriting guidelines"}
                  </p>

                  {isCurrentStage && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-sky-blue hover:bg-sky-blue/90">
                        View Details
                      </Button>
                      {submission.status === "needs-info" && (
                        <Button size="sm" variant="outline">
                          Provide Information
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {submission.stage === "extraction" && submission.status === "needs-info" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <X className="mt-0.5 h-4 w-4 text-electric-coral" />
                <div>
                  <p className="font-medium">Business Description</p>
                  <p className="text-sm text-muted-foreground">
                    Please provide a detailed description of business operations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <X className="mt-0.5 h-4 w-4 text-electric-coral" />
                <div>
                  <p className="font-medium">Claims History</p>
                  <p className="text-sm text-muted-foreground">5-year claims history is required</p>
                </div>
              </div>
              <div className="mt-4">
                <Button size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span>View AI-Generated Email</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
