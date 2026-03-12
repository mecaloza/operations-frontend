/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Agent,
  Project,
  Task,
  Message,
  DashboardStats,
  ActivityItem,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function asArray<T>(value: T[] | { items?: T[]; data?: T[] } | undefined | null): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function asStringId(value: unknown): string {
  return String(value ?? "");
}

function isSameId(a: unknown, b: unknown): boolean {
  return asStringId(a) === asStringId(b);
}

function normalizeTask(task: any): Task {
  return {
    ...task,
    id: asStringId(task.id),
    project_id: asStringId(task.project_id),
  };
}

function normalizeDashboardStats(stats: any): DashboardStats {
  return {
    total_projects: Number(stats?.total_projects ?? stats?.totalProjects ?? 0),
    active_agents: Number(stats?.active_agents ?? stats?.activeAgents ?? 0),
    tasks_completed: Number(stats?.tasks_completed ?? stats?.tasksCompleted ?? 0),
    tasks_in_progress: Number(stats?.tasks_in_progress ?? stats?.tasksInProgress ?? 0),
  };
}

function normalizeTimelineItem(item: any, index: number): ActivityItem {
  const agent =
    item?.agent ??
    item?.from_agent ??
    item?.sender ??
    item?.actor ??
    "System";
  const summary =
    item?.summary ??
    item?.message ??
    item?.content ??
    item?.description;

  return {
    id: asStringId(item?.id ?? index),
    agent: String(agent),
    action: item?.action ?? item?.event ?? item?.type,
    target: item?.target ?? item?.to_agent ?? item?.subject,
    summary: summary ? String(summary) : undefined,
    timestamp: item?.timestamp ?? item?.created_at ?? item?.updated_at ?? new Date().toISOString(),
  };
}

export const api = {
  dashboard: {
    stats: async (): Promise<DashboardStats> => {
      const stats = await fetchApi<any>("/dashboard/stats");
      return normalizeDashboardStats(stats);
    },
    timeline: async (): Promise<ActivityItem[]> => {
      const timeline = await fetchApi<any[] | { items?: any[]; data?: any[] }>("/comms/timeline");
      return asArray(timeline).map(normalizeTimelineItem);
    },
  },
  projects: {
    list: async (): Promise<Project[]> => {
      const [projects, tasks, agents] = await Promise.all([
        fetchApi<any[]>("/projects/"),
        fetchApi<any[]>("/tasks/"),
        fetchApi<any[]>("/agents/"),
      ]);
      return projects.map((p: any) => ({
        ...p,
        id: asStringId(p.id),
        status: p.status || "active",
        tasks: tasks.filter((t: any) => isSameId(t.project_id, p.id)).map(normalizeTask),
        agents: agents.filter((a: any) => isSameId(a.project_id, p.id)).map((a: any) => asStringId(a.id)),
        updated_at: p.created_at,
      }));
    },
    get: async (id: string): Promise<Project> => {
      const p = await fetchApi<any>(`/projects/${id}`);
      return {
        ...p,
        id: asStringId(p.id),
        tasks: [],
        agents: [],
        status: p.status || "active",
        updated_at: p.created_at,
      };
    },
  },
  tasks: {
    list: async (projectId?: string): Promise<Task[]> => {
      const path = projectId ? `/tasks/?project_id=${projectId}` : "/tasks/";
      const tasks = await fetchApi<any[]>(path);
      return tasks.map(normalizeTask);
    },
    update: async (id: string, data: Partial<Task>) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json() as Promise<Task>;
    },
  },
  agents: {
    list: async (): Promise<Agent[]> => {
      const agents = await fetchApi<any[]>("/agents/");
      return agents.map((a: any) => ({
        ...a,
        id: asStringId(a.id),
        project_id: asStringId(a.project_id),
        emoji: "",
        tasks_completed: 0,
      }));
    },
    get: async (id: string): Promise<Agent> => {
      const a = await fetchApi<any>(`/agents/${id}`);
      return { ...a, id: asStringId(a.id), project_id: asStringId(a.project_id), emoji: "", tasks_completed: 0 };
    },
  },
  messages: {
    list: async (): Promise<Message[]> => {
      const comms = await fetchApi<any[]>("/comms/");
      return comms.map((c: any) => ({
        id: String(c.id),
        from_agent: c.from_agent,
        to_agent: c.to_agent,
        content: c.message,
        channel: c.channel || "general",
        timestamp: c.timestamp,
      }));
    },
  },
};
