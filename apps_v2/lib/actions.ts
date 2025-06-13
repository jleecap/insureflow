"use server"

import { revalidatePath } from "next/cache"
import { updateSubmissionStatus, moveSubmissionToNextStage } from "./data-access"

export async function approveAndSendEmail(submissionId: string) {
  try {
    // In a real app, this would send an email
    console.log(`Sending email for submission ${submissionId}`)

    // Update the submission status based on the current stage
    await updateSubmissionStatus(submissionId, "approved")

    // Revalidate the page to show updated data
    revalidatePath("/missing-data")
    revalidatePath("/data-duplication")
    revalidatePath("/compliance")
    revalidatePath("/guideline")

    return { success: true }
  } catch (error) {
    console.error("Error approving and sending email:", error)
    return { success: false, error: "Failed to approve and send email" }
  }
}

export async function sendToWorkbench(submissionId: string, type: "survey" | "quote") {
  try {
    // In a real app, this would send the submission to a workbench system
    console.log(`Sending submission ${submissionId} to workbench for ${type}`)

    // Update the submission status
    if (type === "survey") {
      await updateSubmissionStatus(submissionId, "survey")
    } else {
      await updateSubmissionStatus(submissionId, "proceed")
    }

    // Revalidate the page to show updated data
    revalidatePath("/guideline")

    return { success: true }
  } catch (error) {
    console.error("Error sending to workbench:", error)
    return { success: false, error: "Failed to send to workbench" }
  }
}

export async function provideFeedback(submissionId: string, isPositive: boolean) {
  try {
    // In a real app, this would store feedback for AI improvement
    console.log(`Feedback for submission ${submissionId}: ${isPositive ? "positive" : "negative"}`)

    // Revalidate the page to show updated UI
    revalidatePath("/missing-data")

    return { success: true }
  } catch (error) {
    console.error("Error providing feedback:", error)
    return { success: false, error: "Failed to provide feedback" }
  }
}

export async function overrideAndProcess(submissionId: string) {
  try {
    // Override a decision and move the submission to the next stage
    await moveSubmissionToNextStage(submissionId)
    await updateSubmissionStatus(submissionId, "processing")

    // Revalidate the paths
    revalidatePath("/data-duplication")
    revalidatePath("/compliance")

    return { success: true }
  } catch (error) {
    console.error("Error overriding and processing:", error)
    return { success: false, error: "Failed to override and process" }
  }
}
