"use client"

import { useState } from "react"
import { Search, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import type { Submission } from "@/lib/types"
import { getDuplicateInfoBySubmissionId } from "@/lib/data-access"
import { approveAndSendEmail, overrideAndProcess } from "@/lib/actions"

interface DataDuplicationContentProps {
  submissions: Submission[]
}

export function DataDuplicationContent({ submissions }: DataDuplicationContentProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [duplicateInfo, setDuplicateInfo] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmissionSelect = async (submission: Submission) => {
    setIsLoading(true)
    setSelectedSubmission(submission)

    try {
      if (submission.status === "duplicate") {
        const data = await getDuplicateInfoBySubmissionId(submission.id)
        setDuplicateInfo(data)
      } else {
        setDuplicateInfo(null)
      }
    } catch (error) {
      console.error("Error fetching duplicate info:", error)
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
      : submissions.filter((sub) => (activeTab === "duplicates" ? sub.status === "duplicate" : sub.status === "unique"))

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-1 w-full">
        <CardHeader>
          <CardTitle>Data Duplication Check</CardTitle>
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
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-sky-blue"></div>
                </div>
              ) : selectedSubmission.status === "duplicate" && duplicateInfo ? (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 font-medium">Duplicate Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Original Submission</p>
                        <p className="text-base">{duplicateInfo.reference}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                        <p className="text-base">{duplicateInfo.submissionDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Client</p>
                        <p className="text-base">{duplicateInfo.client}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Broker</p>
                        <p className="text-base">{duplicateInfo.broker}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Match Confidence</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-sky-blue"
                            style={{ width: `${duplicateInfo.matchConfidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{duplicateInfo.matchConfidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 font-medium">AI-Generated Email</h3>
                    <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                      {selectedSubmission.emailContent || "No email draft available."}
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
                    <Button className="bg-emerald-green hover:bg-emerald-green/90">Proceed to Compliance Check</Button>
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
  )
}
