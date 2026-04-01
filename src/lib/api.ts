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
const TOKEN_KEY = "operations_token";

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

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
    active_agents: Number(stats?.total_agents ?? stats?.active_agents ?? stats?.activeAgents ?? 0),
    tasks_completed: Number(stats?.tasks_done ?? stats?.tasks_completed ?? stats?.tasksCompleted ?? 0),
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
    task_id: item?.task_id ? asStringId(item.task_id) : undefined,
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
    list: async (projectId?: string, includeOldDone?: boolean): Promise<Task[]> => {
      let path = projectId ? `/tasks/?project_id=${projectId}` : "/tasks/";
      if (includeOldDone) {
        path += projectId ? "&include_old_done=true" : "?include_old_done=true";
      }
      const tasks = await fetchApi<any[]>(path);
      return tasks.map(normalizeTask);
    },
    get: async (id: string): Promise<Task> => {
      const task = await fetchApi<any>(`/tasks/${id}`);
      return normalizeTask(task);
    },
    update: async (id: string, data: Partial<Task>) => {
      return await fetchApi<Task>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
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
  epics: {
    list: async (filters?: { project_id?: number; status?: string; min_progress?: number; max_progress?: number }): Promise<any[]> => {
      const params = new URLSearchParams();
      if (filters?.project_id) params.append("project_id", String(filters.project_id));
      if (filters?.status) params.append("status", filters.status);
      if (filters?.min_progress !== undefined) params.append("min_progress", String(filters.min_progress));
      if (filters?.max_progress !== undefined) params.append("max_progress", String(filters.max_progress));
      
      const query = params.toString() ? `?${params.toString()}` : "";
      return await fetchApi<any[]>(`/epics${query}`);
    },
    get: async (id: string | number): Promise<any> => {
      return await fetchApi<any>(`/epics/${id}`);
    },
    create: async (data: any): Promise<any> => {
      return await fetchApi<any>("/epics", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string | number, data: any): Promise<any> => {
      return await fetchApi<any>(`/epics/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string | number): Promise<void> => {
      await fetchApi<void>(`/epics/${id}`, {
        method: "DELETE",
      });
    },
    addTasks: async (id: string | number, taskIds: (string | number)[]): Promise<any> => {
      return await fetchApi<any>(`/epics/${id}/tasks`, {
        method: "POST",
        body: JSON.stringify({ task_ids: taskIds }),
      });
    },
    removeTask: async (epicId: string | number, taskId: string | number): Promise<void> => {
      await fetchApi<void>(`/epics/${epicId}/tasks/${taskId}`, {
        method: "DELETE",
      });
    },
  },
  transcripts: {
    list: async (taskId?: string | number, epicId?: string | number): Promise<any[]> => {
      const params = new URLSearchParams();
      if (taskId) params.append("task_id", String(taskId));
      if (epicId) params.append("epic_id", String(epicId));
      
      const query = params.toString() ? `?${params.toString()}` : "";
      return await fetchApi<any[]>(`/transcripts${query}`);
    },
    download: async (id: string | number): Promise<Blob> => {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      const headers: HeadersInit = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const res = await fetch(`${API_BASE}/transcripts/${id}/download`, {
        headers,
      });
      
      if (res.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = "/login";
        }
        throw new Error("Unauthorized");
      }
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      
      return res.blob();
    },
  },
  users: {
    list: async (): Promise<any[]> => {
      return await fetchApi<any[]>("/users/");
    },
    get: async (id: string | number): Promise<any> => {
      return await fetchApi<any>(`/users/${id}`);
    },
    create: async (data: any): Promise<any> => {
      return await fetchApi<any>("/users/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string | number, data: any): Promise<any> => {
      return await fetchApi<any>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string | number): Promise<void> => {
      await fetchApi<void>(`/users/${id}`, {
        method: "DELETE",
      });
    },
    assignAgents: async (userId: string | number, agentIds: (string | number)[]): Promise<any> => {
      return await fetchApi<any>(`/users/${userId}/agents`, {
        method: "POST",
        body: JSON.stringify({ agent_ids: agentIds }),
      });
    },
  },
  teams: {
    list: async (): Promise<any[]> => {
      return await fetchApi<any[]>("/teams/");
    },
    get: async (id: string | number): Promise<any> => {
      return await fetchApi<any>(`/teams/${id}`);
    },
    create: async (data: any): Promise<any> => {
      return await fetchApi<any>("/teams/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string | number, data: any): Promise<any> => {
      return await fetchApi<any>(`/teams/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string | number): Promise<void> => {
      await fetchApi<void>(`/teams/${id}`, {
        method: "DELETE",
      });
    },
    assignAgents: async (teamId: string | number, agentIds: (string | number)[]): Promise<any> => {
      return await fetchApi<any>(`/teams/${teamId}/agents`, {
        method: "POST",
        body: JSON.stringify({ agent_ids: agentIds }),
      });
    },
  },
  evaluationPoints: {
    list: async (epicId?: string | number): Promise<any[]> => {
      const query = epicId ? `?epic_id=${epicId}` : "";
      return await fetchApi<any[]>(`/evaluation-points${query}`);
    },
    create: async (epicId: string | number, data: any): Promise<any> => {
      return await fetchApi<any>("/evaluation-points", {
        method: "POST",
        body: JSON.stringify({ ...data, epic_id: epicId }),
      });
    },
    update: async (id: string | number, data: any): Promise<any> => {
      return await fetchApi<any>(`/evaluation-points/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string | number): Promise<void> => {
      await fetchApi<void>(`/evaluation-points/${id}`, {
        method: "DELETE",
      });
    },
  },
};
