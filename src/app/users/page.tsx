"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User, Team, Agent } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Edit2, Trash2, UserCog } from "lucide-react";
import { UserModal } from "@/components/user-modal";
import { AssignAgentsModal } from "@/components/assign-agents-modal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, teamsData, agentsData] = await Promise.all([
        api.users.list().catch(() => []),
        api.teams.list().catch(() => []),
        api.agents.list().catch(() => []),
      ]);
      setUsers(usersData);
      setTeams(teamsData);
      setAgents(agentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      setUsers([]);
      setTeams([]);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await api.users.delete(userId);
      await loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAssignAgents = (user: User) => {
    setSelectedUser(user);
    setAssignModalOpen(true);
  };

  const handleModalClose = async (reload?: boolean) => {
    setModalOpen(false);
    setSelectedUser(null);
    if (reload) await loadData();
  };

  const handleAssignModalClose = async (reload?: boolean) => {
    setAssignModalOpen(false);
    setSelectedUser(null);
    if (reload) await loadData();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "team_lead":
        return "bg-blue-100 text-blue-800";
      case "developer":
        return "bg-green-100 text-green-800";
      case "agent":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return "—";
    const team = teams.find((t) => t.id === teamId);
    return team?.name || "Unknown";
  };

  const getUserAgents = (user: User) => {
    return agents.filter((agent) => user.assigned_agents?.includes(agent.id));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users & Teams</h1>
          <p className="text-muted-foreground">
            Manage users and assign AI agents
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const userAgents = getUserAgents(user);
          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="text-sm font-medium">{getTeamName(user.team_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Assigned Agents ({userAgents.length})
                    </p>
                    {userAgents.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {userAgents.map((agent) => (
                          <Badge key={agent.id} variant="outline" className="text-xs">
                            {agent.emoji} {agent.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No agents assigned</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignAgents(user)}
                    >
                      <UserCog className="mr-1 h-3 w-3" />
                      Assign Agents
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit2 className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No users yet. Create your first user.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teams Section */}
      <div className="pt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Teams</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const teamMembers = users.filter((u) => u.team_id === team.id);
            const teamLead = users.find((u) => u.id === team.lead_id);
            return (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                  {team.description && (
                    <CardDescription>{team.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Team Lead</p>
                      <p className="text-sm font-medium">
                        {teamLead?.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Members</p>
                      <p className="text-sm font-medium">{teamMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {teams.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No teams yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <UserModal
          user={selectedUser}
          teams={teams}
          onClose={handleModalClose}
        />
      )}
      {assignModalOpen && selectedUser && (
        <AssignAgentsModal
          user={selectedUser}
          agents={agents}
          onClose={handleAssignModalClose}
        />
      )}
    </div>
  );
}
