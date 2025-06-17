import { Check, Clock, Mail } from "lucide-react"
import type { Submission } from "@/components/submission-list"
import { StatusBadge } from "@/components/status-badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    { id: "extraction", name: "Missing Data Check" },
    { id: "core-data", name: "Data Duplication Check" },
    { id: "enrichment", name: "Compliance Check" },
    { id: "rank", name: "Guideline Check" },
  ]

  // Sample email content based on the client
  const emailContent = `From: ${submission.broker}
To: InsureFlow Underwriting
Subject: Request for Insurance Quote for ${submission.client}
Date: ${submission.submissionDate}

Dear Underwriting Team,

I am writing to request a quote for ${submission.client} for ${submission.lineOfBusiness} insurance.

Property Information:
- Location: ${submission.location || "Not specified"}
- Type: ${submission.propertyType || "Not specified"}
- Coverage Amount: ${submission.coverageAmount || "Not specified"}

Please let me know if you need any additional information to process this request.

Best regards,
${submission.broker}
`

  return (
    <div className="grid gap-4">
      <Tabs defaultValue="details">
        <TabsList className="mb-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="email">Original Email</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Reference</h3>
              <p className="font-medium">{submission.reference}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Status</h3>
              <StatusBadge status={submission.status} className="mt-1" />
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Client</h3>
              <p>{submission.client}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Broker</h3>
              <p>{submission.broker}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Submission Date</h3>
              <p>{submission.submissionDate}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Line of Business</h3>
              <p>{submission.lineOfBusiness}</p>
            </div>
            {submission.location && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Location</h3>
                <p>{submission.location}</p>
              </div>
            )}
            {submission.propertyType && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Property Type</h3>
                <p>{submission.propertyType}</p>
              </div>
            )}
            {submission.coverageAmount && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Coverage Amount</h3>
                <p>{submission.coverageAmount}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium">Workflow Progress</h3>
            <Progress value={stageProgress[submission.stage]} className="h-1.5" />

            <div className="mt-4 grid gap-2">
              {stages.map((stage, index) => {
                const isCurrentStage = stage.id === submission.stage
                const isCompleted = stageIndex[submission.stage] > index
                const isPending = stageIndex[submission.stage] < index

                return (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-start gap-2 rounded-md border p-2",
                      isCurrentStage && "border-sky-blue bg-light-blue",
                      isCompleted && "border-emerald-green bg-light-green",
                      isPending && "opacity-60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        isCurrentStage && "bg-sky-blue text-white",
                        isCompleted && "bg-emerald-green text-white",
                        isPending && "border border-gray-300 bg-white",
                      )}
                    >
                      {isCompleted && <Check className="h-3 w-3" />}
                      {isCurrentStage && <Clock className="h-3 w-3" />}
                      {isPending && <span className="text-xs font-medium">{index + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-medium">{stage.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {stage.id === "extraction" && "Extracting and validating submission data"}
                        {stage.id === "core-data" && "Checking for duplicate records"}
                        {stage.id === "enrichment" && "Verifying compliance requirements"}
                        {stage.id === "rank" && "Evaluating against underwriting guidelines"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Original Submission Email</h3>
          </div>
          <div className="rounded-md border bg-muted/50 p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{emailContent}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
