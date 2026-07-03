"use client"

import React from "react"
import { Folder, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const projects = [
  { id: "1", name: "Intenteo Web App", description: "Build the ultimate intentional living platform", progress: 65, tasks: 12, color: "#3D1F8C" },
  { id: "2", name: "Morning Routine Overhaul", description: "Design and implement a 60-minute morning ritual", progress: 40, tasks: 8, color: "#F26522" },
  { id: "3", name: "Finance Dashboard", description: "Track net worth, budget, and investment growth", progress: 20, tasks: 15, color: "#FFB81C" },
]

export function ProjectsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Group related tasks into meaningful projects</p>
          </div>
          <Button className="glow">
            <Plus className="mr-1 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              style={{ borderTopWidth: "3px", borderTopColor: project.color }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${project.color}15` }}>
                  <Folder className="h-5 w-5" style={{ color: project.color }} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{project.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{project.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{project.tasks} tasks</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Empty state card */}
          <div className="rounded-2xl border-2 border-dashed border-muted p-5 flex flex-col items-center justify-center text-center min-h-[200px] hover:border-primary/30 transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">Start a new project</p>
            <p className="text-xs text-muted-foreground">Group tasks that share a common goal</p>
          </div>
        </div>
      </div>
    </div>
  )
}
