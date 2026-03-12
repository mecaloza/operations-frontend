import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjects } from "@/lib/data";
import type { ProjectStatus } from "@/lib/types";
import { Users, ListChecks } from "lucide-react";

const statusStyles: Record<ProjectStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  planning: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  on_hold: "bg-gray-100 text-gray-600 border-gray-200",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} projects tracked
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const tasks = project.tasks || [];
          const agents = project.agents || [];
          const done = tasks.filter((t) => t.status === "done").length;
          const total = tasks.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="border shadow-sm transition-shadow hover:shadow-md cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold">
                      {project.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={statusStyles[project.status]}
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {agents.length} agents
                    </span>
                    <span className="flex items-center gap-1">
                      <ListChecks className="h-3.5 w-3.5" />
                      {total} tasks
                    </span>
                  </div>
                  {total > 0 && (
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-right text-xs text-muted-foreground">
                        {pct}% complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
