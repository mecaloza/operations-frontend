/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const priorityStyles: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusStyles: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-600",
  in_progress: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  blocked: "bg-red-50 text-red-700",
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [, setAgents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [t, a, p] = await Promise.all([
        fetch(`${API_BASE}/tasks/`, { cache: "no-store" }).then(r => r.json()),
        fetch(`${API_BASE}/agents/`, { cache: "no-store" }).then(r => r.json()),
        fetch(`${API_BASE}/projects/`, { cache: "no-store" }).then(r => r.json()),
      ]);
      setTasks(t);
      setAgents(a);
      setProjects(p);
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const projectMap = Object.fromEntries(projects.map((p: any) => [p.id, p]));
  const uniqueAgents = Array.from(new Set(tasks.map((t: any) => t.assigned_to).filter(Boolean)));

  const filtered = tasks.filter((t: any) => {
    if (filterAgent !== "all" && t.assigned_to !== filterAgent) return false;
    if (filterProject !== "all" && String(t.project_id) !== filterProject) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">My Tasks</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live · {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="flex-1 min-w-[120px] md:flex-none rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="all">All Agents</option>
          {uniqueAgents.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="flex-1 min-w-[120px] md:flex-none rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="all">All Projects</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex-1 min-w-[120px] md:flex-none rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="all">All Status</option>
          <option value="backlog">Backlog</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((task: any) => {
          const project = projectMap[task.project_id];
          return (
            <Card key={task.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground break-words">{task.title}</p>
                    {task.priority && (
                      <Badge variant="outline" className={`text-xs ${priorityStyles[task.priority] || ""}`}>
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground break-words">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground">
                    {project && <span>{project.name}</span>}
                    {task.assigned_to && <span>→ {task.assigned_to}</span>}
                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={`text-xs shrink-0 self-start md:self-auto ${statusStyles[task.status] || ""}`}>
                  {task.status?.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
