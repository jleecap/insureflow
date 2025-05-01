"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type TimePeriod = "week" | "month" | "quarter" | "year" | "all"

interface TimePeriodTabsProps {
  onPeriodChange: (period: TimePeriod) => void
  defaultValue?: TimePeriod
  className?: string
}

export function TimePeriodTabs({ onPeriodChange, defaultValue = "week", className }: TimePeriodTabsProps) {
  const [period, setPeriod] = useState<TimePeriod>(defaultValue)

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as TimePeriod
    setPeriod(newPeriod)
    onPeriodChange(newPeriod)
  }

  return (
    <Tabs defaultValue={defaultValue} value={period} onValueChange={handlePeriodChange} className={className}>
      <TabsList>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
        <TabsTrigger value="quarter">Quarter</TabsTrigger>
        <TabsTrigger value="year">Year</TabsTrigger>
        <TabsTrigger value="all">All Time</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
