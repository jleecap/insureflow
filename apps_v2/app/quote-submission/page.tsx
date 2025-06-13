"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, FileText, ThumbsDown, ThumbsUp, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"

interface MissingDataItem {
  id: string
  field: string
  description: string
  severity: "high" | "medium" | "low"
}

interface Submission {
  id: string
  reference: string
  client: string
  broker: string
  submissionDate: string
  status: "needs-info" | "pending" | "processing" | "approved" | "rejected"
  lineOfBusiness: string
  missingData: MissingDataItem[]
  emailDraft?: string
}

const mockSubmissions: Submission[] = [
  {
    id: "1",
    reference: "SUB-2023-001",
    client: "Acme Corp",
    broker: "ABC Insurance",
    submissionDate: "2023-05-15",
    status: "needs-info",
    lineOfBusiness: "Property",
    missingData: [
      {
        id: "1",
        field: "Business Description",
        description: "Detailed description of business operations is required",
        severity: "high",
      },
      {
        id: "2",
        field: "Claims History",
        description: "5-year claims history is missing",
        severity: "high",
      },
      {
        id: "3",
        field: "Building Construction",
        description: "Construction type and materials information is incomplete",
        severity: "medium",
      },
    ],
    emailDraft: `Dear ABC Insurance,

We are reviewing the submission for Acme Corp (reference: SUB-2023-001) and require some additional information to proceed with the quotation process.

Please provide the following:
1. A detailed description of business operations
2. 5-year claims history
3. Construction type and materials information for the property

Thank you for your assistance.

Best regards,
InsureFlow Team`,
  },
  {
    id: "2",
    reference: "SUB-2023-006",
    client: "Healthcare Solutions",
    broker: "Medical Insurance Group",
    submissionDate: "2023-05-20",
    status: "needs-info",
    lineOfBusiness: "Medical Malpractice",
    missingData: [
      {
        id: "4",
        field: "Staff Credentials",
        description: "Medical staff qualifications and certifications are missing",
        severity: "high",
      },
      {
        id: "5",
        field: "Patient Volume",
        description: "Annual patient volume data is required",
        severity: "medium",
      },
    ],
    emailDraft: `Dear Medical Insurance Group,

We are reviewing the submission for Healthcare Solutions (reference: SUB-2023-006) and require some additional information to proceed with the quotation process.

Please provide the following:
1. Medical staff qualifications and certifications
2. Annual patient volume data

Thank you for your assistance.

Best regards,
InsureFlow Team`,
  },
]

export default function QuoteSubmissionPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({})

  const handleSubmissionSelect = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const handleFeedback = (submissionId: string, isPositive: boolean) => {
    setFeedbackGiven((prev) => ({ ...prev, [submissionId]: true }))
    // In a real app, you would send feedback to the AI system
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Submissions" value="28" icon={FileText} iconClassName="bg-light-blue text-sky-blue" />
        <SummaryCard
          title="Missing Information"
          value="12"
          icon={AlertCircle}
          iconClassName="bg-light-yellow text-goldenrod-yellow"
        />
        <SummaryCard
          title="Completed Extractions"
          value="16"
          icon={CheckCircle}
          iconClassName="bg-light-green text-emerald-green"
        />
        <SummaryCard
          title="Rejected Submissions"
          value="3"
          icon={XCircle}
          iconClassName="bg-light-coral text-electric-coral"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 w-full">
          <CardHeader>
            <CardTitle>Submissions Requiring Information</CardTitle>
            <CardDescription>Submissions with missing or unclear data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                    selectedSubmission?.id === submission.id ? "border-sky-blue bg-light-blue" : ""
                  }`}
                  onClick={() => handleSubmissionSelect(submission)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{submission.client}</h3>
                    <StatusBadge status={submission.status} />
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">Ref: {submission.reference}</p>
                  <p className="mb-2 text-sm text-muted-foreground">Broker: {submission.broker}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {submission.lineOfBusiness}
                    </Badge>
                    <Badge variant="outline" className="bg-light-coral text-xs text-electric-coral">
                      {submission.missingData.length} missing fields
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 w-full">
          {selectedSubmission ? (
            <Tabs defaultValue="missing-data">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedSubmission.client}</CardTitle>
                    <CardDescription>
                      {selectedSubmission.reference} • {selectedSubmission.lineOfBusiness}
                    </CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger value="missing-data">Missing Data</TabsTrigger>
                    <TabsTrigger value="email-draft">Email Draft</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="missing-data" className="mt-0">
                  <div className="space-y-4">
                    {selectedSubmission.missingData.map((item) => (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium">{item.field}</h3>
                          <Badge
                            variant="outline"
                            className={`
                              ${item.severity === "high" ? "bg-light-coral text-electric-coral" : ""}
                              ${item.severity === "medium" ? "bg-light-yellow text-goldenrod-yellow" : ""}
                              ${item.severity === "low" ? "bg-light-blue text-sky-blue" : ""}
                            `}
                          >
                            {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)} Priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="email-draft" className="mt-0">
                  <div className="rounded-lg border p-4">
                    <div className="mb-4">
                      <h3 className="mb-2 font-medium">AI-Generated Email</h3>
                      <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                        {selectedSubmission.emailDraft}
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="mb-2 font-medium">Actions</h3>
                      <div className="flex gap-2">
                        <Button className="bg-emerald-green hover:bg-emerald-green/90">Approve & Send</Button>
                        <Button variant="outline">Edit Draft</Button>
                        {!feedbackGiven[selectedSubmission.id] ? (
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Feedback:</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleFeedback(selectedSubmission.id, true)}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleFeedback(selectedSubmission.id, false)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-emerald-green">Feedback submitted</span>
                            <CheckCircle className="h-4 w-4 text-emerald-green" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No Submission Selected</h3>
                <p className="mt-2 text-sm text-muted-foreground">Select a submission from the list to view details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
