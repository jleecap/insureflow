"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Layers, XCircle } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { Progress } from "@/components/ui/progress"

interface ComplianceCheck {
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
  status: "compliant" | "non-compliant" | "processing"
  lineOfBusiness: string
  complianceChecks: ComplianceCheck[]
  emailDraft?: string
  progress: number
}

const mockSubmissions: Submission[] = [
  {
    id: "1",
    reference: "SUB-2023-010",
    client: "Global Shipping",
    broker: "Marine Insurance",
    submissionDate: "2023-05-24",
    status: "non-compliant",
    lineOfBusiness: "Marine",
    progress: 100,
    complianceChecks: [
      {
        id: "c1",
        name: "Sanctions List",
        status: "failed",
        details: "Client appears on OFAC sanctions list",
      },
      {
        id: "c2",
        name: "Companies House",
        status: "passed",
        details: "Company registration verified",
      },
      {
        id: "c3",
        name: "Dun & Bradstreet",
        status: "passed",
        details: "Financial stability confirmed",
      },
      {
        id: "c4",
        name: "Geocoding",
        status: "passed",
        details: "Location verified",
      },
    ],
    emailDraft: `Dear Marine Insurance,

We regret to inform you that we are unable to proceed with the submission for Global Shipping (reference: SUB-2023-010) due to compliance issues.

Our compliance checks have identified that the client appears on the OFAC sanctions list, which prevents us from providing coverage.

If you believe this is an error or if you have additional information that may affect this decision, please contact our compliance team.

Best regards,
InsureFlow Team`,
  },
  {
    id: "2",
    reference: "SUB-2023-011",
    client: "Construction Co",
    broker: "Builder's Insurance",
    submissionDate: "2023-05-25",
    status: "processing",
    lineOfBusiness: "Liability",
    progress: 65,
    complianceChecks: [
      {
        id: "c5",
        name: "Sanctions List",
        status: "passed",
        details: "No sanctions found",
      },
      {
        id: "c6",
        name: "Companies House",
        status: "passed",
        details: "Company registration verified",
      },
      {
        id: "c7",
        name: "Dun & Bradstreet",
        status: "pending",
      },
      {
        id: "c8",
        name: "Geocoding",
        status: "pending",
      },
    ],
  },
  {
    id: "3",
    reference: "SUB-2023-012",
    client: "Tech Startup",
    broker: "Digital Insurance",
    submissionDate: "2023-05-26",
    status: "compliant",
    lineOfBusiness: "Cyber",
    progress: 100,
    complianceChecks: [
      {
        id: "c9",
        name: "Sanctions List",
        status: "passed",
        details: "No sanctions found",
      },
      {
        id: "c10",
        name: "Companies House",
        status: "passed",
        details: "Company registration verified",
      },
      {
        id: "c11",
        name: "Dun & Bradstreet",
        status: "passed",
        details: "Financial stability confirmed",
      },
      {
        id: "c12",
        name: "Geocoding",
        status: "passed",
        details: "Location verified",
      },
    ],
  },
]

export default function DataEnrichmentPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  const handleSubmissionSelect = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const filteredSubmissions =
    activeTab === "all"
      ? mockSubmissions
      : mockSubmissions.filter((sub) =>
          activeTab === "non-compliant"
            ? sub.status === "non-compliant"
            : activeTab === "compliant"
              ? sub.status === "compliant"
              : sub.status === "processing",
        )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Enrichments" value="26" icon={Layers} iconClassName="bg-light-blue text-sky-blue" />
        <SummaryCard
          title="Non-Compliant"
          value="5"
          icon={XCircle}
          iconClassName="bg-light-coral text-electric-coral"
        />
        <SummaryCard
          title="Compliant"
          value="18"
          icon={CheckCircle}
          iconClassName="bg-light-green text-emerald-green"
        />
        <SummaryCard
          title="In Progress"
          value="3"
          icon={AlertCircle}
          iconClassName="bg-light-yellow text-goldenrod-yellow"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 w-full">
          <CardHeader>
            <CardTitle>Data Enrichment</CardTitle>
            <CardDescription>Submissions undergoing compliance checks</CardDescription>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="non-compliant">Non-Compliant</TabsTrigger>
                <TabsTrigger value="compliant">Compliant</TabsTrigger>
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
                        submission.status === "non-compliant"
                          ? "rejected"
                          : submission.status === "compliant"
                            ? "approved"
                            : "processing"
                      }
                    />
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">Ref: {submission.reference}</p>
                  <p className="mb-2 text-sm text-muted-foreground">Broker: {submission.broker}</p>
                  {submission.status === "processing" && (
                    <div className="mb-2">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{submission.progress}%</span>
                      </div>
                      <Progress value={submission.progress} className="h-1.5" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {submission.lineOfBusiness}
                    </Badge>
                    {submission.status === "non-compliant" && (
                      <Badge variant="outline" className="bg-light-coral text-xs text-electric-coral">
                        Non-Compliant
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
                      selectedSubmission.status === "non-compliant"
                        ? "rejected"
                        : selectedSubmission.status === "compliant"
                          ? "approved"
                          : "processing"
                    }
                    className="text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Compliance Checks</h3>
                    <div className="space-y-4">
                      {selectedSubmission.complianceChecks.map((check) => (
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

                  {selectedSubmission.status === "non-compliant" && selectedSubmission.emailDraft && (
                    <div className="rounded-lg border p-4">
                      <h3 className="mb-3 font-medium">AI-Generated Email</h3>
                      <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                        {selectedSubmission.emailDraft}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button className="bg-sky-blue hover:bg-sky-blue/90">Approve & Send</Button>
                        <Button variant="outline">Edit Draft</Button>
                        <Button variant="outline" className="ml-auto">
                          Override & Process
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.status === "compliant" && (
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-emerald-green" />
                        <div>
                          <h3 className="font-medium">All Compliance Checks Passed</h3>
                          <p className="text-sm text-muted-foreground">
                            This submission has passed all compliance checks and will proceed to the next stage.
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">View Details</Button>
                        <Button className="bg-emerald-green hover:bg-emerald-green/90">Proceed to Rank & Reject</Button>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.status === "processing" && (
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-8 w-8 text-goldenrod-yellow" />
                        <div>
                          <h3 className="font-medium">Compliance Checks In Progress</h3>
                          <p className="text-sm text-muted-foreground">
                            Some compliance checks are still being processed.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{selectedSubmission.progress}%</span>
                        </div>
                        <Progress value={selectedSubmission.progress} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
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
