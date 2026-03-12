export type TaskStatus = "backlog" | "in_progress" | "done" | "blocked";
export type AgentStatus = "active" | "idle" | "offline" | "error";
export type ProjectStatus = "active" | "planning" | "completed" | "on_hold";

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: AgentStatus;
  current_task?: string;
  tasks_completed: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigned_to?: string;
  project_id: string;
  priority?: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  tasks: Task[];
  agents: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  from_agent: string;
  to_agent?: string;
  content: string;
  channel?: string;
  timestamp: string;
  type?: "info" | "warning" | "error" | "success";
}

export interface DashboardStats {
  total_projects: number;
  active_agents: number;
  tasks_completed: number;
  tasks_in_progress: number;
}

export interface ActivityItem {
  id: string;
  agent: string;
  action?: string;
  target?: string;
  summary?: string;
  timestamp: string;
}
