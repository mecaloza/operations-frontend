"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { User, Agent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AssignAgentsModalProps {
  user: User;
  agents: Agent[];
  onClose: (reload?: boolean) => void;
}

export function AssignAgentsModal({ user, agents, onClose }: AssignAgentsModalProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    user.assigned_agents || []
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.users.assignAgents(user.id, selectedAgents);
      onClose(true);
    } catch (error) {
      console.error("Error assigning agents:", error);
      alert("Error assigning agents");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assign Agents</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {user.name} — Select agents to assign
              </p>
            </div>
            <button
              onClick={() => onClose()}
              className="rounded-lg p-1 hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              {agents.map((agent) => {
                const isSelected = selectedAgents.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{agent.emoji}</span>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.role}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          agent.status === "active"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            {agents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No agents available
              </p>
            )}
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedAgents.length} agent(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Assign Agents"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
