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
  epic_id?: string;
  priority?: "low" | "medium" | "high" | "critical";
  task_progress?: number; // % manual (0-100)
  epic_ids?: number[]; // IDs de épicas asociadas
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
  task_id?: string;
}

// Epic System types (Phase 2 - NEW SPEC)
export type EpicPriority = "low" | "medium" | "high" | "critical";
export type EpicStatus = "not_started" | "in_progress" | "done";

export interface Epic {
  id: number;
  title: string;
  description?: string;
  project_id: number;
  priority: EpicPriority;
  progress: number; // 0.0 - 100.0 (manual)
  status: EpicStatus;
  goal?: string;
  start_date?: string;
  target_date?: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
}

export interface EvaluationPoint {
  id: number;
  epic_id: number;
  category: string;
  description?: string;
  assigned_to: number;
  assigned_to_name?: string;
  progress: number;  // 0.0 - 100.0
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface EpicDetail extends Epic {
  tasks: Task[];
  evaluation_points: EvaluationPoint[];
  avg_evaluation_progress?: number;  // Promedio automático
}

// Legacy types - keeping for backward compatibility
export type EpicTaskStatus = "backlog" | "in_progress" | "done" | "QA";

export interface EpicTask {
  id: string;
  epic_id: string;
  name: string;
  completion_percentage: number;
  assigned_to?: string;
  status: EpicTaskStatus;
  created_at: string;
  updated_at: string;
}

export interface SprintReport {
  project_id: string;
  project_name: string;
  last_updated: string;
  total_progress: number;
  progress_change?: number;
  epics: Epic[];
}

// Users & Teams types (Task #156)
export type UserRole = "admin" | "team_lead" | "developer" | "agent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id?: string;
  assigned_agents: string[]; // Array of agent IDs
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  lead_id?: string;
  member_ids: string[];
  created_at: string;
  updated_at: string;
}

// Transcripts types (Task #157)
export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface Transcript {
  id: string;
  task_id?: string;
  epic_id?: string;
  agent_id: string;
  agent_name: string;
  messages: TranscriptMessage[];
  created_at: string;
  updated_at: string;
  summary?: string;
}
