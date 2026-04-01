/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskDetailModal } from "@/components/task-detail-modal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const columns = [
  { key: "backlog", label: "Backlog", dot: "bg-gray-400" },
  { key: "in_progress", label: "In Progress", dot: "bg-amber-400" },
  { key: "done", label: "Done", dot: "bg-emerald-400" },
  { key: "blocked", label: "Blocked", dot: "bg-red-400" },
];

const priorityStyles: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

interface KanbanBoardProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
}

export function KanbanBoard({ projectId, projectName, projectDescription }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showOldDone, setShowOldDone] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const taskUrl = showOldDone 
        ? `${API_BASE}/tasks/?project_id=${projectId}&include_old_done=true`
        : `${API_BASE}/tasks/?project_id=${projectId}`;
      
      const [tasksRes, agentsRes] = await Promise.all([
        fetch(taskUrl, { cache: "no-store" }),
        fetch(`${API_BASE}/agents/`, { cache: "no-store" }),
      ]);
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (agentsRes.ok) setAgents(await agentsRes.json());
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, showOldDone]);

  const agentMap = Object.fromEntries([
    ...agents.map((a: any) => [String(a.id), a]),
    ...agents.map((a: any) => [a.name, a]),
  ]);

  const tasksByStatus = columns.map((col) => ({
    ...col,
    tasks: tasks.filter((t: any) => t.status === col.key),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">{projectName}</h1>
          {projectDescription && (
            <p className="text-sm text-muted-foreground">{projectDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOldDone(!showOldDone)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-slate-50 transition-colors text-xs"
            title={showOldDone ? "Hide old completed tasks" : "Show all completed tasks"}
          >
            <span className={`transition-colors ${showOldDone ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {showOldDone ? '✓' : '○'}
            </span>
            <span className="text-muted-foreground">Old Done</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Live · {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 md:overflow-x-visible md:snap-none xl:grid-cols-4">
        {tasksByStatus.map((column) => (
          <div key={column.key} className="space-y-3 min-w-[280px] snap-start md:min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                <h2 className="text-sm font-semibold text-foreground">{column.label}</h2>
              </div>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs text-muted-foreground">
                {column.tasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[100px]">
              {column.tasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No tasks
                </div>
              ) : (
                column.tasks.map((task: any) => {
                  const agent = task.assigned_to ? agentMap[task.assigned_to] : null;
                  return (
                    <Card 
                      key={task.id} 
                      className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-tight flex-1">{task.title}</p>
                          <Badge variant="secondary" className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            #{task.id}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {task.priority && (
                            <Badge variant="outline" className={`text-xs ${priorityStyles[task.priority] || ""}`}>
                              {task.priority}
                            </Badge>
                          )}
                          {agent ? (
                            <span className="text-xs text-muted-foreground">
                              #{agent.name}
                            </span>
                          ) : task.assigned_to ? (
                            <span className="text-xs text-muted-foreground">
                              #{task.assigned_to}
                            </span>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
