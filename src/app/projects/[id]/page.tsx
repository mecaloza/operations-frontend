import Link from "next/link";
import { getProject } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import { KanbanBoard } from "@/components/kanban-board";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Projects
        </Link>
        <span className="text-border">/</span>
      </div>

      <KanbanBoard
        projectId={params.id}
        projectName={project.name}
        projectDescription={project.description}
      />
    </div>
  );
}
