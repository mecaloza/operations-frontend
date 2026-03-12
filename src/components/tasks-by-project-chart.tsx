/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";

interface ProjectTaskCount {
  project: string;
  done: number;
  in_progress: number;
  backlog: number;
  total: number;
}

const COLORS = [
  { bar: "bg-indigo-500", bg: "bg-indigo-100", text: "text-indigo-700" },
  { bar: "bg-emerald-500", bg: "bg-emerald-100", text: "text-emerald-700" },
  { bar: "bg-amber-500", bg: "bg-amber-100", text: "text-amber-700" },
  { bar: "bg-rose-500", bg: "bg-rose-100", text: "text-rose-700" },
  { bar: "bg-violet-500", bg: "bg-violet-100", text: "text-violet-700" },
];

export function TasksByProjectChart() {
  const [data, setData] = useState<ProjectTaskCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setError(null);
        const projects = await api.projects.list();
        const counts: ProjectTaskCount[] = projects.map((p: Project) => {
          const projectTasks = p.tasks ?? [];
          return {
            project: p.name,
            done: projectTasks.filter((t) => t.status === "done").length,
            in_progress: projectTasks.filter((t) => t.status === "in_progress").length,
            backlog: projectTasks.filter((t) => t.status === "backlog" || t.status === "blocked").length,
            total: projectTasks.length,
          };
        });

        if (!isMounted) return;
        setData(counts);
      } catch (err) {
        if (!isMounted) return;
        setData([]);
        setError(err instanceof Error ? err.message : "Failed to load project task data.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        <CardTitle className="text-base font-semibold">
          Tasks by Project
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading task distribution...</p>
        ) : error ? (
          <p className="text-sm text-red-600">Unable to load task distribution: {error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No project task data available.</p>
        ) : (
          <div className="space-y-4">
            {data.map((item, i) => {
              const color = COLORS[i % COLORS.length];
              const donePct = (item.done / maxTotal) * 100;
              const ipPct = (item.in_progress / maxTotal) * 100;
              const backlogPct = (item.backlog / maxTotal) * 100;
              return (
                <div key={item.project} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {item.project}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {item.done} done
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        {item.in_progress} ip
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        {item.backlog} backlog
                      </span>
                    </div>
                  </div>
                  <div className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${donePct}%` }}
                      title={`${item.done} done`}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${ipPct}%` }}
                      title={`${item.in_progress} in progress`}
                    />
                    <div
                      className="h-full bg-gray-300 transition-all duration-500"
                      style={{ width: `${backlogPct}%` }}
                      title={`${item.backlog} backlog`}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Done
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                In Progress
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                Backlog
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
