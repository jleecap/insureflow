import { AlertCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PendingAction {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  stage: string
}

interface PendingActionsCardProps {
  actions: PendingAction[]
}

export function PendingActionsCard({ actions }: PendingActionsCardProps) {
  const priorityColors = {
    high: "bg-light-coral text-electric-coral",
    medium: "bg-light-yellow text-goldenrod-yellow",
    low: "bg-light-blue text-sky-blue",
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-electric-coral" />
          <span>Pending Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.length === 0 ? (
          <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">No pending actions</p>
          </div>
        ) : (
          actions.map((action) => (
            <div key={action.id} className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">{action.title}</h4>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    priorityColors[action.priority]
                  }`}
                >
                  {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                </span>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">{action.description}</p>
              <p className="text-xs text-muted-foreground">Stage: {action.stage}</p>
            </div>
          ))
        )}
      </CardContent>
      {actions.length > 0 && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full gap-1">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
