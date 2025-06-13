"use client"

import { useState } from "react"
import { AlertCircle, BarChart3, CheckCircle, ThumbsDown, ThumbsUp, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { Progress } from "@/components/ui/progress"

interface EvaluationFactor {
  id: string
  name: string
  score: number
  maxScore: number
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
  premium?: number
  evaluationFactors: EvaluationFactor[]
  overallScore: number
  emailDraft?: string
}

const mockSubmissions: Submission[] = [
  {
    id: "1",
    reference: "SUB-2023-013",
    client: "Office Complex",
    broker: "Commercial Insurance",
    submissionDate: "2023-05-27",
    status: "proceed",
    lineOfBusiness: "Property",
    premium: 45000,
    overallScore: 85,
    evaluationFactors: [
      {
        id: "e1",
        name: "Underwriting Guidelines",
        score: 90,
        maxScore: 100,
        details: "Meets all underwriting guidelines",
      },
      {
        id: "e2",
        name: "Limits & Deductibles",
        score: 85,
        maxScore: 100,
        details: "Standard limits and deductibles",
      },
      {
        id: "e3",
        name: "Pricing Factors",
        score: 80,
        maxScore: 100,
        details: "Competitive pricing",
      },
      {
        id: "e4",
        name: "Hazard Classification",
        score: 85,
        maxScore: 100,
        details: "Low hazard classification",
      },
    ],
    emailDraft: `Dear Commercial Insurance,

We are pleased to inform you that we are proceeding with the quotation for Office Complex (reference: SUB-2023-013).

Based on our evaluation, we are offering coverage with the following details:
- Premium: $45,000
- Coverage: Property
- Limits: Standard as requested
- Deductibles: As per submission

Please find the full quotation attached. If you have any questions or need further information, please don't hesitate to contact us.

Best regards,
InsureFlow Team`,
  },
  {
    id: "2",
    reference: "SUB-2023-014",
    client: "Industrial Warehouse",
    broker: "Risk Partners",
    submissionDate: "2023-05-28",
    status: "survey",
    lineOfBusiness: "Property",
    overallScore: 65,
    evaluationFactors: [
      {
        id: "e5",
        name: "Underwriting Guidelines",
        score: 70,
        maxScore: 100,
        details: "Meets most underwriting guidelines",
      },
      {
        id: "e6",
        name: "Limits & Deductibles",
        score: 75,
        maxScore: 100,
        details: "Standard limits and deductibles",
      },
      {
        id: "e7",
        name: "Pricing Factors",
        score: 60,
        maxScore: 100,
        details: "Higher risk pricing",
      },
      {
        id: "e8",
        name: "Hazard Classification",
        score: 55,
        maxScore: 100,
        details: "Medium hazard classification, survey recommended",
      },
    ],
    emailDraft: `Dear Risk Partners,

We have reviewed the submission for Industrial Warehouse (reference: SUB-2023-014) and would like to proceed with a survey before providing a quotation.

Based on our initial evaluation, we have identified some risk factors that require further assessment through an on-site survey. This will help us better understand the risk and provide appropriate coverage.

We will be in touch shortly to arrange a convenient time for the survey. If you have any questions or need further information, please don't hesitate to contact us.

Best regards,
InsureFlow Team`,
  },
  {
    id: "3",
    reference: "SUB-2023-015",
    client: "Chemical Plant",
    broker: "Industrial Insurance",
    submissionDate: "2023-05-29",
    status: "reject",
    lineOfBusiness: "Property",
    overallScore: 35,
    evaluationFactors: [
      {
        id: "e9",
        name: "Underwriting Guidelines",
        score: 40,
        maxScore: 100,
        details: "Does not meet several underwriting guidelines",
      },
      {
        id: "e10",
        name: "Limits & Deductibles",
        score: 30,
        maxScore: 100,
        details: "Requested limits exceed our capacity",
      },
      {
        id: "e11",
        name: "Pricing Factors",
        score: 35,
        maxScore: 100,
        details: "High risk pricing",
      },
      {
        id: "e12",
        name: "Hazard Classification",
        score: 35,
        maxScore: 100,
        details: "High hazard classification",
      },
    ],
    emailDraft: `Dear Industrial Insurance,

After careful consideration of the submission for Chemical Plant (reference: SUB-2023-015), we regret to inform you that we are unable to provide a quotation at this time.

Our evaluation has identified several factors that place this risk outside our current underwriting appetite, including:
- High hazard classification
- Requested limits exceed our capacity
- Several underwriting guidelines not met

We appreciate your consideration of our company and would be happy to review future submissions that align more closely with our underwriting guidelines.

Best regards,
InsureFlow Team`,
  },
]

export default function RankRejectPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  const handleSubmissionSelect = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const filteredSubmissions =
    activeTab === "all" ? mockSubmissions : mockSubmissions.filter((sub) => sub.status === activeTab)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Evaluations"
          value="35"
          icon={BarChart3}
          iconClassName="bg-light-blue text-sky-blue"
        />
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
            <CardTitle>Rank & Reject</CardTitle>
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
                  <div className="mb-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>Score</span>
                      <span>{submission.overallScore}/100</span>
                    </div>
                    <Progress
                      value={submission.overallScore}
                      className={`h-1.5 ${
                        submission.overallScore >= 75
                          ? "bg-emerald-green"
                          : submission.overallScore >= 50
                            ? "bg-goldenrod-yellow"
                            : "bg-electric-coral"
                      }`}
                    />
                  </div>
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
                    <h3 className="mb-4 font-medium">Evaluation Factors</h3>
                    <div className="space-y-4">
                      {selectedSubmission.evaluationFactors.map((factor) => (
                        <div key={factor.id}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-medium">{factor.name}</span>
                            <span className="text-sm">
                              {factor.score}/{factor.maxScore}
                            </span>
                          </div>
                          <Progress
                            value={(factor.score / factor.maxScore) * 100}
                            className={`h-1.5 ${
                              factor.score >= 75
                                ? "bg-emerald-green"
                                : factor.score >= 50
                                  ? "bg-goldenrod-yellow"
                                  : "bg-electric-coral"
                            }`}
                          />
                          {factor.details && <p className="mt-1 text-sm text-muted-foreground">{factor.details}</p>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium">Overall Score</span>
                        <span>{selectedSubmission.overallScore}/100</span>
                      </div>
                      <Progress
                        value={selectedSubmission.overallScore}
                        className={`h-2 ${
                          selectedSubmission.overallScore >= 75
                            ? "bg-emerald-green"
                            : selectedSubmission.overallScore >= 50
                              ? "bg-goldenrod-yellow"
                              : "bg-electric-coral"
                        }`}
                      />
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
                              This submission meets our underwriting criteria and will proceed to quotation.
                              {selectedSubmission.premium && ` Estimated premium: $${selectedSubmission.premium}.`}
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
                        <h4 className="mb-2 font-medium">AI-Generated Email</h4>
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
                          {selectedSubmission.status !== "proceed" && (
                            <Button variant="outline" className="ml-auto">
                              Override Decision
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
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
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
