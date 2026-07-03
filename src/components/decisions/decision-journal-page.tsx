"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus,
  Search,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  Filter,
  Download,
  BarChart3,
  Lightbulb,
} from "lucide-react"

interface Decision {
  id: string
  title: string
  category: string
  reason: string
  alternatives: string[]
  pros: string[]
  cons: string[]
  expectedOutcome: string
  confidence: number
  riskLevel: "low" | "medium" | "high"
  date: string
  reviewDate?: string
  actualOutcome?: string
  lessonsLearned?: string
  status: "pending" | "successful" | "failed" | "cancelled"
  tags: string[]
}

const sampleDecisions: Decision[] = [
  {
    id: "1",
    title: "Take the new product role",
    category: "Career",
    reason: "Better alignment with long-term vision of building products that help people live intentionally.",
    alternatives: ["Stay in current role", "Freelance consulting", "Start my own company"],
    pros: ["More responsibility", "Better compensation", "Learn new skills", "Aligns with vision"],
    cons: ["Less work-life balance initially", "New team to build trust with", "Higher expectations"],
    expectedOutcome: "Grow as a product leader while building meaningful products.",
    confidence: 85,
    riskLevel: "medium",
    date: "2026-06-15",
    reviewDate: "2026-09-15",
    status: "successful",
    tags: ["Career", "Growth", "Leadership"],
  },
  {
    id: "2",
    title: "Invest in Index Funds",
    category: "Finance",
    reason: "Build long-term wealth through diversified, low-cost investments.",
    alternatives: ["Individual stocks", "Real estate", "Crypto", "High-yield savings"],
    pros: ["Diversified risk", "Low fees", "Historical returns", "Passive approach"],
    cons: ["Market volatility", "No guaranteed returns", "Requires patience"],
    expectedOutcome: "10% annual returns over 10 years.",
    confidence: 75,
    riskLevel: "low",
    date: "2026-05-20",
    status: "successful",
    tags: ["Finance", "Investing", "Wealth"],
  },
  {
    id: "3",
    title: "Launch Intenteo in Q3",
    category: "Business",
    reason: "Market research shows demand for intentional living platforms. First-mover advantage.",
    alternatives: ["Delay to Q4", "Pivot to B2B", "Launch MVP first"],
    pros: ["Market timing", "Competitive advantage", "Revenue potential"],
    cons: ["Technical debt", "Marketing budget", "Team capacity"],
    expectedOutcome: "1000 beta users in first month.",
    confidence: 70,
    riskLevel: "high",
    date: "2026-06-01",
    reviewDate: "2026-09-01",
    status: "pending",
    tags: ["Business", "Strategy", "Product"],
  },
  {
    id: "4",
    title: "Switch to plant-based diet",
    category: "Health",
    reason: "Improve energy levels and overall health based on research and personal goals.",
    alternatives: ["Mediterranean diet", "Intermittent fasting", "Keto"],
    pros: ["Better energy", "Environmental impact", "Health benefits"],
    cons: ["Meal planning required", "Social situations", "Nutrient tracking"],
    expectedOutcome: "More energy, better sleep, improved focus.",
    confidence: 60,
    riskLevel: "low",
    date: "2026-04-10",
    status: "cancelled",
    tags: ["Health", "Diet", "Lifestyle"],
  },
  {
    id: "5",
    title: "Hire a business coach",
    category: "Business",
    reason: "Accelerate growth by learning from someone who has built successful businesses.",
    alternatives: ["Self-study", "Join mastermind group", "Online courses"],
    pros: ["Personalized guidance", "Accountability", "Network access"],
    cons: ["Cost", "Time commitment", "Finding the right fit"],
    expectedOutcome: "Double revenue within 12 months.",
    confidence: 80,
    riskLevel: "medium",
    date: "2026-03-01",
    reviewDate: "2026-06-01",
    status: "successful",
    tags: ["Business", "Growth", "Learning"],
  },
]

const statusColors = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  successful: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  failed: "bg-red-500/10 text-red-600 border-red-200",
  cancelled: "bg-gray-500/10 text-gray-600 border-gray-200",
}

const riskColors = {
  low: "text-emerald-500",
  medium: "text-amber-500",
  high: "text-red-500",
}

export function DecisionJournalPage() {
  const [decisions, setDecisions] = useState(sampleDecisions)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)

  const filteredDecisions = decisions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const successfulCount = decisions.filter((d) => d.status === "successful").length
  const successRate = Math.round((successfulCount / decisions.length) * 100)
  const avgConfidence = Math.round(decisions.reduce((a, b) => a + b.confidence, 0) / decisions.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Decision Journal</h1>
          <p className="text-muted-foreground">Track and learn from your decisions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button className="glow">
            <Plus className="mr-2 h-4 w-4" />
            New Decision
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{decisions.length}</p>
              <p className="text-xs text-muted-foreground">Total Decisions</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgConfidence}%</p>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{successfulCount}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search decisions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Decisions */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredDecisions.map((decision) => (
          <Card
            key={decision.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => setSelectedDecision(decision)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge variant="outline">{decision.category}</Badge>
                  <CardTitle className="text-lg">{decision.title}</CardTitle>
                </div>
                <Badge className={statusColors[decision.status]}>
                  {decision.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {decision.reason}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-primary" />
                  {decision.confidence}% confidence
                </span>
                <span className={`flex items-center gap-1 ${riskColors[decision.riskLevel]}`}>
                  <AlertTriangle className="h-4 w-4" />
                  {decision.riskLevel} risk
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                {decision.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedDecision(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline">{selectedDecision.category}</Badge>
                  <CardTitle className="text-xl mt-2">{selectedDecision.title}</CardTitle>
                </div>
                <Badge className={statusColors[selectedDecision.status]}>
                  {selectedDecision.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reason */}
              <div>
                <h3 className="font-semibold mb-2">Reason</h3>
                <p className="text-muted-foreground">{selectedDecision.reason}</p>
              </div>

              {/* Confidence & Risk */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Confidence</h3>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedDecision.confidence} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{selectedDecision.confidence}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Risk Level</h3>
                  <Badge variant="outline" className={riskColors[selectedDecision.riskLevel]}>
                    {selectedDecision.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Pros
                  </h3>
                  <ul className="space-y-1">
                    {selectedDecision.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Cons
                  </h3>
                  <ul className="space-y-1">
                    {selectedDecision.cons.map((con, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Expected Outcome */}
              <div>
                <h3 className="font-semibold mb-2">Expected Outcome</h3>
                <p className="text-muted-foreground">{selectedDecision.expectedOutcome}</p>
              </div>

              {/* Alternatives */}
              <div>
                <h3 className="font-semibold mb-2">Alternatives Considered</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDecision.alternatives.map((alt, i) => (
                    <Badge key={i} variant="outline">{alt}</Badge>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Decision Date:</span>
                  <p className="font-medium">{selectedDecision.date}</p>
                </div>
                {selectedDecision.reviewDate && (
                  <div>
                    <span className="text-muted-foreground">Review Date:</span>
                    <p className="font-medium">{selectedDecision.reviewDate}</p>
                  </div>
                )}
              </div>

              {/* Actual Outcome & Lessons */}
              {selectedDecision.actualOutcome && (
                <div>
                  <h3 className="font-semibold mb-2">Actual Outcome</h3>
                  <p className="text-muted-foreground">{selectedDecision.actualOutcome}</p>
                </div>
              )}
              {selectedDecision.lessonsLearned && (
                <div>
                  <h3 className="font-semibold mb-2">Lessons Learned</h3>
                  <p className="text-muted-foreground">{selectedDecision.lessonsLearned}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDecision(null)}>
                  Close
                </Button>
                <Button>Edit Decision</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
