"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, FileText, Search } from "lucide-react"
import { SummaryCard } from "@/components/summary-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"

interface DuplicateInfo {
  id: string
  reference: string
  client: string
  submissionDate: string
  broker: string
  matchConfidence: number
}

interface Submission {
  id: string
  reference: string
  client: string
  broker: string
  submissionDate: string
  status: "duplicate" | "unique" | "processing"
  lineOfBusiness: string
  duplicateInfo?: DuplicateInfo
  emailDraft?: string
}

const mockSubmissions: Submission[] = [
  {
    id: "1",
    reference: "SUB-2023-007",
    client: "Global Manufacturing",
    broker: "Industrial Insurance",
    submissionDate: "2023-05-21",
    status: "duplicate",
    lineOfBusiness: "Property",
    duplicateInfo: {
      id: "d1",
      reference: "SUB-2023-002",
      client: "Global Manufacturing",
      submissionDate: "2023-05-10",
      broker: "Risk Partners",
      matchConfidence: 92,
    },
    emailDraft: `Dear Industrial Insurance,

We have identified that the submission for Global Manufacturing (reference: SUB-2023-007) appears to be a duplicate of an existing submission in our system (reference: SUB-2023-002) submitted by Risk Partners on May 10, 2023.

To avoid processing duplicate submissions, we will be proceeding with the original submission. If you believe this is an error or if there are significant differences between the submissions, please let us know.

Best regards,
InsureFlow Team`,
  },
  {
    id: "2",
    reference: "SUB-2023-008",
    client: "Tech Innovations",
    broker: "Digital Insurance",
    submissionDate: "2023-05-22",
    status: "duplicate",
    lineOfBusiness: "Cyber",
    duplicateInfo: {
      id: "d2",
      reference: "SUB-2023-005",
      client: "Tech Innovations",
      submissionDate: "2023-05-18",
      broker: "Digital Insurance",
      matchConfidence: 88,
    },
    emailDraft: `Dear Digital Insurance,

We have identified that the submission for Tech Innovations (reference: SUB-2023-008) appears to be a duplicate of an existing submission in our system (reference: SUB-2023-005) submitted by your firm on May 18, 2023.

To avoid processing duplicate submissions, we will be proceeding with the original submission. If you believe this is an error or if there are significant differences between the submissions, please let us know.

Best regards,
InsureFlow Team`,
  },
  {
    id: "3",
    reference: "SUB-2023-009",
    client: "Retail Solutions",
    broker: "Commercial Insurance",
    submissionDate: "2023-05-23",
    status: "unique",
    lineOfBusiness: "Liability",
  },
]

export default function CoreDataPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  const handleSubmissionSelect = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const filteredSubmissions =
    activeTab === "all"
      ? mockSubmissions
      : mockSubmissions.filter((sub) =>
          activeTab === "duplicates" ? sub.status === "duplicate" : sub.status === "unique",
        )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Submissions" value="32" icon={FileText} iconClassName="bg-light-blue text-sky-blue" />
        <SummaryCard
          title="Duplicate Submissions"
          value="8"
          icon={AlertCircle}
          iconClassName="bg-light-coral text-electric-coral"
        />
        <SummaryCard
          title="Unique Submissions"
          value="24"
          icon={CheckCircle}
          iconClassName="bg-light-green text-emerald-green"
        />
        <SummaryCard title="Processing" value="3" icon={Search} iconClassName="bg-light-yellow text-goldenrod-yellow" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 w-full">
          <CardHeader>
            <CardTitle>Core Data Check</CardTitle>
            <CardDescription>Submissions checked against existing records</CardDescription>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
                <TabsTrigger value="unique">Unique</TabsTrigger>
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
                        submission.status === "duplicate"
                          ? "rejected"
                          : submission.status === "unique"
                            ? "approved"
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
                    {submission.status === "duplicate" && (
                      <Badge variant="outline" className="bg-light-coral text-xs text-electric-coral">
                        Duplicate
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
                      selectedSubmission.status === "duplicate"
                        ? "rejected"
                        : selectedSubmission.status === "unique"
                          ? "approved"
                          : "processing"
                    }
                    className="text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {selectedSubmission.status === "duplicate" && selectedSubmission.duplicateInfo ? (
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="mb-3 font-medium">Duplicate Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Original Submission</p>
                          <p className="text-base">{selectedSubmission.duplicateInfo.reference}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                          <p className="text-base">{selectedSubmission.duplicateInfo.submissionDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Client</p>
                          <p className="text-base">{selectedSubmission.duplicateInfo.client}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Broker</p>
                          <p className="text-base">{selectedSubmission.duplicateInfo.broker}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">Match Confidence</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-sky-blue"
                              style={{ width: `${selectedSubmission.duplicateInfo.matchConfidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {selectedSubmission.duplicateInfo.matchConfidence}%
                          </span>
                        </div>
                      </div>
                    </div>

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
                  </div>
                ) : (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-emerald-green" />
                      <div>
                        <h3 className="font-medium">No Duplicates Found</h3>
                        <p className="text-sm text-muted-foreground">
                          This submission has been verified as unique and will proceed to the next stage.
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">View Details</Button>
                      <Button className="bg-emerald-green hover:bg-emerald-green/90">Proceed to Data Enrichment</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
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
