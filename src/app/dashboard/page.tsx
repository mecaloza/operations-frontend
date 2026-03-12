"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ActivityItem, DashboardStats } from "@/lib/types";
import { FolderKanban, Users, CheckCircle2, Clock } from "lucide-react";
import { TasksByProjectChart } from "@/components/tasks-by-project-chart";

const EMPTY_STATS: DashboardStats = {
  total_projects: 0,
  active_agents: 0,
  tasks_completed: 0,
  tasks_in_progress: 0,
};

function formatActivityLabel(item: ActivityItem) {
  if (item.summary) {
    return item.summary;
  }

  if (item.action && item.target) {
    return `${item.action} ${item.target}`;
  }

  return item.action ?? item.target ?? "No details available";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setIsStatsLoading(true);
        setStatsError(null);
        const statsData = await api.dashboard.stats();
        if (!isMounted) return;
        setStats(statsData);
      } catch (err) {
        if (!isMounted) return;
        setStats(EMPTY_STATS);
        setStatsError(err instanceof Error ? err.message : "Failed to load dashboard stats.");
      } finally {
        if (isMounted) {
          setIsStatsLoading(false);
        }
      }
    }

    async function loadActivity() {
      try {
        setIsActivityLoading(true);
        setActivityError(null);
        const timelineData = await api.dashboard.timeline();
        if (!isMounted) return;
        setActivity(timelineData);
      } catch (err) {
        if (!isMounted) return;
        setActivity([]);
        setActivityError(err instanceof Error ? err.message : "Failed to load recent activity.");
      } finally {
        if (isMounted) {
          setIsActivityLoading(false);
        }
      }
    }

    loadStats();
    loadActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      label: "Total Projects",
      value: stats.total_projects,
      icon: FolderKanban,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Active Agents",
      value: stats.active_agents,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Tasks Done",
      value: stats.tasks_completed,
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "In Progress",
      value: stats.tasks_in_progress,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your operations
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border shadow-sm">
              <CardContent className="flex items-center gap-3 p-4 md:gap-4 md:p-6">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${card.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {isStatsLoading ? "..." : statsError ? "--" : card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {statsError ? (
        <p className="text-sm text-red-600">Unable to load dashboard stats: {statsError}</p>
      ) : null}

      <TasksByProjectChart />

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isActivityLoading ? (
            <p className="text-sm text-muted-foreground">Loading recent activity...</p>
          ) : activityError ? (
            <p className="text-sm text-red-600">Unable to load recent activity: {activityError}</p>
          ) : activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity available.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {item.agent.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm break-words">
                      <span className="font-medium text-foreground">
                        {item.agent}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {formatActivityLabel(item)}
                      </span>
                    </p>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {new Date(item.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted-foreground md:block">
                    {new Date(item.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
