"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Shield, ThumbsDown, ThumbsUp, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GuidelineCheck {
  id: string
  name: string
  status: "passed" | "failed" | "pending"
  details?: string
}

interface Submission {
  id: string
  reference: string
  client: string
  broker: string
  submissionDate: string
  status: "proceed" | "survey" | "reject" | "evaluating"
  lineOfBusiness: string
  guidelineChecks: GuidelineCheck[]
  emailDraft?: string
}

const mockSubmissions: Submission[] = [
  {
    id: "1",
    reference: "SUB-2023-013",
    client: "GreenTech Solutions Ltd.",
    broker: "ABC Insurance Brokers",
    submissionDate: "24 April 2025",
    status: "proceed",
    lineOfBusiness: "Property",
    guidelineChecks: [
      {
        id: "e1",
        name: "Underwriting Guidelines",
        status: "passed",
        details: "Meets all underwriting guidelines",
      },
      {
        id: "e2",
        name: "Limits & Deductibles",
        status: "passed",
        details: "Standard limits and deductibles",
      },
      {
        id: "e3",
        name: "Pricing Factors",
        status: "passed",
        details: "Competitive pricing",
      },
      {
        id: "e4",
        name: "Hazard Classification",
        status: "passed",
        details: "Low hazard classification",
      },
    ],
    emailDraft: `INTERNAL SUMMARY FOR UNDERWRITING TEAM

Submission Reference: SUB-2023-013
Client: GreenTech Solutions Ltd.
Broker: ABC Insurance Brokers
Line of Business: Property

COMPLETED CHECKS SUMMARY:

1. Missing Data Check:
   - All required information provided
   - Business description complete
   - Claims history verified
   - Property details confirmed

2. Data Duplication Check:
   - No duplicate submissions found
   - Verified as unique submission

3. Compliance Check:
   - Sanctions list: PASSED
   - Companies House verification: PASSED
   - Financial stability assessment: PASSED
   - Geocoding verification: PASSED

4. Guideline Check:
   - Underwriting Guidelines: PASSED - Meets all underwriting guidelines
   - Limits & Deductibles: PASSED - Standard limits and deductibles
   - Pricing Factors: PASSED - Competitive pricing
   - Hazard Classification: PASSED - Low hazard classification

This submission has passed all preliminary checks and is ready for premium calculation and final underwriting review.`,
  },
  {
    id: "2",
    reference: "SUB-2023-014",
    client: "Coffee Haven Ltd.",
    broker: "XYZ Insurance Services",
    submissionDate: "24 April 2025",
    status: "survey",
    lineOfBusiness: "Commercial",
    guidelineChecks: [
      {
        id: "e5",
        name: "Underwriting Guidelines",
        status: "passed",
        details: "Meets most underwriting guidelines",
      },
      {
        id: "e6",
        name: "Limits & Deductibles",
        status: "passed",
        details: "Standard limits and deductibles",
      },
      {
        id: "e7",
        name: "Pricing Factors",
        status: "failed",
        details: "Higher risk pricing",
      },
      {
        id: "e8",
        name: "Hazard Classification",
        status: "failed",
        details: "Medium hazard classification, survey recommended",
      },
    ],
    emailDraft: `INTERNAL MEMO: SURVEY REQUEST

To: Field Engineering Team
Re: Survey Request for Coffee Haven Ltd. (SUB-2023-014)

We have reviewed the submission for Coffee Haven Ltd. and determined that an on-site survey is required before proceeding with quotation.

Submission Details:
- Reference: SUB-2023-014
- Client: Coffee Haven Ltd.
- Broker: XYZ Insurance Services
- Line of Business: Commercial

Reason for Survey:
- Higher risk pricing factors identified
- Medium hazard classification requires verification
- Need to assess specific risk control measures in place

Please arrange for a survey at your earliest convenience. The broker has been informed that a survey will be conducted, but no specific timeframe has been communicated yet.

Once the survey is complete, please submit your findings through the workbench system for final underwriting review.

Thank you,
Guideline Check Team`,
  },
  {
    id: "3",
    reference: "SUB-2023-015",
    client: "Parsian Evin Hotel Ltd.",
    broker: "Prime Insurance Brokers",
    submissionDate: "24 April 2025",
    status: "reject",
    lineOfBusiness: "Hospitality",
    guidelineChecks: [
      {
        id: "e9",
        name: "Underwriting Guidelines",
        status: "failed",
        details: "Does not meet several underwriting guidelines",
      },
      {
        id: "e10",
        name: "Limits & Deductibles",
        status: "failed",
        details: "Requested limits exceed our capacity",
      },
      {
        id: "e11",
        name: "Pricing Factors",
        status: "failed",
        details: "High risk pricing",
      },
      {
        id: "e12",
        name: "Hazard Classification",
        status: "failed",
        details: "High hazard classification",
      },
    ],
    emailDraft: `Dear Prime Insurance Brokers,

After careful consideration of the submission for Parsian Evin Hotel Ltd. (reference: SUB-2023-015), we regret to inform you that we are unable to provide a quotation at this time.

Our evaluation has identified several factors that place this risk outside our current underwriting appetite, including:
- High hazard classification
- Requested limits exceed our capacity
- Several underwriting guidelines not met

We appreciate your consideration of our company and would be happy to review future submissions that align more closely with our underwriting guidelines.

Best regards,
InsureFlow Team`,
  },
]

export default function GuidelineCheckPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [showWorkbenchDialog, setShowWorkbenchDialog] = useState(false)
  const [sentToWorkbench, setSentToWorkbench] = useState(false)
  const [workbenchDialogTitle, setWorkbenchDialogTitle] = useState("")

  const handleSubmissionSelect = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const filteredSubmissions =
    activeTab === "all" ? mockSubmissions : mockSubmissions.filter((sub) => sub.status === activeTab)

  const handleSendToWorkbench = (type: "survey" | "quote") => {
    setWorkbenchDialogTitle(type === "survey" ? "Sending Survey Request to Workbench" : "Sending Quote to Workbench")
    setShowWorkbenchDialog(true)
    setSentToWorkbench(false)

    // Simulate animation with a timeout
    setTimeout(() => {
      setSentToWorkbench(true)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Evaluations" value="35" icon={Shield} iconClassName="bg-light-blue text-sky-blue" />
        <SummaryCard
          title="Proceed to Quote"
          value="18"
          icon={ThumbsUp}
          iconClassName="bg-light-green text-emerald-green"
        />
        <SummaryCard
          title="Survey Recommended"
          value="10"
          icon={AlertCircle}
          iconClassName="bg-light-yellow text-goldenrod-yellow"
        />
        <SummaryCard title="Rejected" value="7" icon={ThumbsDown} iconClassName="bg-light-coral text-electric-coral" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 w-full">
          <CardHeader>
            <CardTitle>Guideline Check</CardTitle>
            <CardDescription>Submissions evaluated against guidelines</CardDescription>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="proceed">Proceed</TabsTrigger>
                <TabsTrigger value="survey">Survey</TabsTrigger>
                <TabsTrigger value="reject">Reject</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                    selectedSubmission?.id === submission.id ? "border-sky-blue bg-light-blue" : ""
                  }`}
                  onClick={() => handleSubmissionSelect(submission)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{submission.client}</h3>
                    <StatusBadge
                      status={
                        submission.status === "proceed"
                          ? "approved"
                          : submission.status === "reject"
                            ? "rejected"
                            : submission.status === "survey"
                              ? "needs-info"
                              : "processing"
                      }
                    />
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">Ref: {submission.reference}</p>
                  <p className="mb-2 text-sm text-muted-foreground">Broker: {submission.broker}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {submission.lineOfBusiness}
                    </Badge>
                    {submission.status === "proceed" && (
                      <Badge variant="outline" className="bg-light-green text-xs text-emerald-green">
                        Proceed
                      </Badge>
                    )}
                    {submission.status === "survey" && (
                      <Badge variant="outline" className="bg-light-yellow text-xs text-goldenrod-yellow">
                        Survey
                      </Badge>
                    )}
                    {submission.status === "reject" && (
                      <Badge variant="outline" className="bg-light-coral text-xs text-electric-coral">
                        Reject
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 w-full">
          {selectedSubmission ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedSubmission.client}</CardTitle>
                    <CardDescription>
                      {selectedSubmission.reference} • {selectedSubmission.lineOfBusiness}
                    </CardDescription>
                  </div>
                  <StatusBadge
                    status={
                      selectedSubmission.status === "proceed"
                        ? "approved"
                        : selectedSubmission.status === "reject"
                          ? "rejected"
                          : selectedSubmission.status === "survey"
                            ? "needs-info"
                            : "processing"
                    }
                    className="text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Guideline Checks</h3>
                    <div className="space-y-4">
                      {selectedSubmission.guidelineChecks.map((check) => (
                        <div key={check.id} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                              check.status === "passed"
                                ? "bg-emerald-green text-white"
                                : check.status === "failed"
                                  ? "bg-electric-coral text-white"
                                  : "bg-goldenrod-yellow text-white"
                            }`}
                          >
                            {check.status === "passed" && <CheckCircle className="h-3 w-3" />}
                            {check.status === "failed" && <XCircle className="h-3 w-3" />}
                            {check.status === "pending" && <AlertCircle className="h-3 w-3" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{check.name}</p>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  check.status === "passed"
                                    ? "bg-light-green text-emerald-green"
                                    : check.status === "failed"
                                      ? "bg-light-coral text-electric-coral"
                                      : "bg-light-yellow text-goldenrod-yellow"
                                }`}
                              >
                                {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                              </Badge>
                            </div>
                            {check.details && <p className="text-sm text-muted-foreground">{check.details}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 font-medium">Decision & Communication</h3>
                    <div className="mb-4 flex items-center gap-3">
                      {selectedSubmission.status === "proceed" && (
                        <>
                          <CheckCircle className="h-8 w-8 text-emerald-green" />
                          <div>
                            <h4 className="font-medium">Proceed to Quotation</h4>
                            <p className="text-sm text-muted-foreground">
                              This submission meets our underwriting criteria. An internal summary has been prepared for
                              the underwriting team to calculate premium.
                            </p>
                          </div>
                        </>
                      )}
                      {selectedSubmission.status === "survey" && (
                        <>
                          <AlertCircle className="h-8 w-8 text-goldenrod-yellow" />
                          <div>
                            <h4 className="font-medium">Survey Recommended</h4>
                            <p className="text-sm text-muted-foreground">
                              This submission requires an on-site survey before proceeding.
                            </p>
                          </div>
                        </>
                      )}
                      {selectedSubmission.status === "reject" && (
                        <>
                          <XCircle className="h-8 w-8 text-electric-coral" />
                          <div>
                            <h4 className="font-medium">Reject Submission</h4>
                            <p className="text-sm text-muted-foreground">
                              This submission does not meet our underwriting criteria and will be rejected.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {selectedSubmission.emailDraft && (
                      <>
                        <Separator className="my-4" />
                        <h4 className="mb-2 font-medium">
                          {selectedSubmission.status === "proceed"
                            ? "Internal Summary for Underwriting"
                            : selectedSubmission.status === "survey"
                              ? "Internal Memo: Survey Request"
                              : "AI-Generated Email"}
                        </h4>
                        <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                          {selectedSubmission.emailDraft}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            className={
                              selectedSubmission.status === "proceed"
                                ? "bg-emerald-green hover:bg-emerald-green/90"
                                : selectedSubmission.status === "survey"
                                  ? "bg-goldenrod-yellow hover:bg-goldenrod-yellow/90"
                                  : "bg-sky-blue hover:bg-sky-blue/90"
                            }
                          >
                            Approve & Send
                          </Button>
                          <Button variant="outline">Edit Draft</Button>
                          {(selectedSubmission.status === "survey" || selectedSubmission.status === "proceed") && (
                            <Button
                              variant="outline"
                              className="ml-auto"
                              onClick={() =>
                                handleSendToWorkbench(selectedSubmission.status === "survey" ? "survey" : "quote")
                              }
                            >
                              Send to Workbench
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No Submission Selected</h3>
                <p className="mt-2 text-sm text-muted-foreground">Select a submission from the list to view details</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showWorkbenchDialog} onOpenChange={setShowWorkbenchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{workbenchDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {!sentToWorkbench ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-sky-blue"></div>
                <p>Sending submission to workbench...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-light-green">
                  <CheckCircle className="h-6 w-6 text-emerald-green" />
                </div>
                <p>Submission successfully sent to workbench!</p>
                <Button className="mt-2 bg-sky-blue hover:bg-sky-blue/90" onClick={() => setShowWorkbenchDialog(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
