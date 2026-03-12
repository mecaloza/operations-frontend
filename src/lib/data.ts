import { api } from "./api";
import type { Agent, Project, Message, DashboardStats, Task, ActivityItem } from "./types";

export async function getDashboardStats(): Promise<DashboardStats> {
  return api.dashboard.stats();
}

export async function getTimelineActivity(): Promise<ActivityItem[]> {
  return api.dashboard.timeline();
}

export async function getProjects(): Promise<Project[]> {
  return api.projects.list();
}

export async function getProject(id: string): Promise<Project | null> {
  return api.projects.get(id);
}

export async function getAgents(): Promise<Agent[]> {
  return api.agents.list();
}

export async function getMessages(): Promise<Message[]> {
  return api.messages.list();
}

export async function getTasks(projectId?: string): Promise<Task[]> {
  return api.tasks.list(projectId);
}
