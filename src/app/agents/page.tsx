/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const statusDot: Record<string, string> = {
  active: "bg-emerald-400",
  idle: "bg-gray-300",
  working: "bg-amber-400",
};

function AgentCard({ agent, tasks }: { agent: any; tasks: any[] }) {
  const agentTasks = tasks.filter((t: any) => t.assigned_to === agent.name);
  const done = agentTasks.filter((t: any) => t.status === "done").length;
  const inProgress = agentTasks.filter((t: any) => t.status === "in_progress").length;
  const currentTask = agentTasks.find((t: any) => t.status === "in_progress");

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{agent.name.split(" ").pop()}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {agent.name.split(" ").slice(0, -1).join(" ")}
              </p>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${statusDot[agent.status] || statusDot.idle}`} />
            <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
          </div>
        </div>

        {currentTask && (
          <div className="rounded-md bg-amber-50 border border-amber-100 p-2">
            <p className="text-xs text-amber-700 font-medium">Working on:</p>
            <p className="text-xs text-amber-600">{currentTask.title}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{done} done</span>
          <span>{inProgress} in progress</span>
          <span>{agentTasks.length} total</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [a, t, p] = await Promise.all([
        fetch(`${API_BASE}/agents/`, { cache: "no-store" }).then(r => r.json()),
        fetch(`${API_BASE}/tasks/`, { cache: "no-store" }).then(r => r.json()),
        fetch(`${API_BASE}/projects/`, { cache: "no-store" }).then(r => r.json()),
      ]);
      setAgents(a);
      setTasks(t);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group agents by project
  const projectGroups = projects.map((project: any) => {
    const projectAgents = agents.filter((a: any) => a.project_id === project.id);
    const pm = projectAgents.find((a: any) => a.role === "Project Manager" || a.role === "Copilot Principal" || a.role === "Sprint Manager AX");
    const team = projectAgents.filter((a: any) => a !== pm);
    return { project, pm, team, allAgents: projectAgents };
  }).filter(g => g.allAgents.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground">
            {agents.filter((a: any) => a.status === "active").length} active / {agents.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live · {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {projectGroups.map(({ project, pm, team }) => (
        <div key={project.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
              {team.length + (pm ? 1 : 0)} agents
            </Badge>
          </div>

          {/* Project Manager / Lead */}
          {pm && (
            <div className="pl-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {pm.role === "Sprint Manager AX" ? "Sprint Manager" : pm.role === "Copilot Principal" ? "Lead" : "Project Manager"}
              </p>
              <div className="max-w-full md:max-w-md">
                <AgentCard agent={pm} tasks={tasks} />
              </div>
            </div>
          )}

          {/* Team */}
          {team.length > 0 && (
            <div className="pl-3 md:pl-8 border-l-2 border-indigo-100">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Team</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {team.map((agent: any) => (
                  <AgentCard key={agent.id} agent={agent} tasks={tasks} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
