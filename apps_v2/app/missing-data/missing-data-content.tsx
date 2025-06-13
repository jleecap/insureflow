"use client"

import { useState } from "react"
import { FileText, ThumbsDown, ThumbsUp, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import type { Submission } from "@/lib/types"
import { getMissingDataBySubmissionId } from "@/lib/data-access"
import { approveAndSendEmail, provideFeedback } from "@/lib/actions"

interface MissingDataContentProps {
  submissions: Submission[]
}

export function MissingDataContent({ submissions }: MissingDataContentProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [missingData, setMissingData] = useState<any[]>([])
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmissionSelect = async (submission: Submission) => {
    setIsLoading(true)
    setSelectedSubmission(submission)

    try {
      const data = await getMissingDataBySubmissionId(submission.id)
      setMissingData(data)
    } catch (error) {
      console.error("Error fetching missing data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (submissionId: string, isPositive: boolean) => {
    await provideFeedback(submissionId, isPositive)
    setFeedbackGiven((prev) => ({ ...prev, [submissionId]: true }))
  }

  const handleApproveAndSend = async () => {
    if (selectedSubmission) {
      await approveAndSendEmail(selectedSubmission.id)
    }
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-1 w-full">
        <CardHeader>
          <CardTitle>Submissions Requiring Information</CardTitle>
          <CardDescription>Submissions with missing or unclear data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.map((submission) => (
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
                    Missing fields
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
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-sky-blue"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missingData.map((item) => (
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
                )}
              </TabsContent>
              <TabsContent value="email-draft" className="mt-0">
                <div className="rounded-lg border p-4">
                  <div className="mb-4">
                    <h3 className="mb-2 font-medium">AI-Generated Email</h3>
                    <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                      {selectedSubmission.emailContent || "No email draft available."}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="mb-2 font-medium">Actions</h3>
                    <div className="flex gap-2">
                      <Button className="bg-emerald-green hover:bg-emerald-green/90" onClick={handleApproveAndSend}>
                        Approve & Send
                      </Button>
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
  )
}
