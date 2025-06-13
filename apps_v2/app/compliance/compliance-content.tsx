"use client"

import { useState } from "react"
import { Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { Progress } from "@/components/ui/progress"
import type { Submission } from "@/lib/types"
import { getComplianceChecksBySubmissionId } from "@/lib/data-access"
import { approveAndSendEmail, overrideAndProcess } from "@/lib/actions"

interface ComplianceContentProps {
  submissions: Submission[]
}

export function ComplianceContent({ submissions }: ComplianceContentProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [complianceChecks, setComplianceChecks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmissionSelect = async (submission: Submission) => {
    setIsLoading(true)
    setSelectedSubmission(submission)

    try {
      const data = await getComplianceChecksBySubmissionId(submission.id)
      setComplianceChecks(data)
    } catch (error) {
      console.error("Error fetching compliance checks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveAndSend = async () => {
    if (selectedSubmission) {
      await approveAndSendEmail(selectedSubmission.id)
    }
  }

  const handleOverrideAndProcess = async () => {
    if (selectedSubmission) {
      await overrideAndProcess(selectedSubmission.id)
    }
  }

  const filteredSubmissions =
    activeTab === "all"
      ? submissions
      : submissions.filter((sub) =>
          activeTab === "non-compliant"
            ? sub.status === "non-compliant"
            : activeTab === "compliant"
              ? sub.status === "compliant"
              : sub.status === "processing",
        )

  // Calculate progress for processing submissions
  const getProgress = (submission: Submission) => {
    if (submission.status !== "processing") return 100
    return 65 // Default progress value, in a real app this would be calculated
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-1 w-full">
        <CardHeader>
          <CardTitle>Compliance Check</CardTitle>
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
                      <span>{getProgress(submission)}%</span>
                    </div>
                    <Progress value={getProgress(submission)} className="h-1.5" />
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
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-sky-blue"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Compliance Checks</h3>
                    <div className="space-y-4">
                      {complianceChecks.map((check) => (
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

                  {selectedSubmission.status === "non-compliant" && selectedSubmission.emailContent && (
                    <div className="rounded-lg border p-4">
                      <h3 className="mb-3 font-medium">AI-Generated Email</h3>
                      <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                        {selectedSubmission.emailContent}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button className="bg-sky-blue hover:bg-sky-blue/90" onClick={handleApproveAndSend}>
                          Approve & Send
                        </Button>
                        <Button variant="outline">Edit Draft</Button>
                        <Button variant="outline" className="ml-auto" onClick={handleOverrideAndProcess}>
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
                        <Button className="bg-emerald-green hover:bg-emerald-green/90">
                          Proceed to Guideline Check
                        </Button>
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
                          <span>{getProgress(selectedSubmission)}%</span>
                        </div>
                        <Progress value={getProgress(selectedSubmission)} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
  )
}
