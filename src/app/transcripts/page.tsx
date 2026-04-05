"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Transcript, Task, Epic, Project } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Search, Clock, MessageSquare } from "lucide-react";
import { TranscriptViewer } from "@/components/transcript-viewer";
import { ProjectEditor } from "@/components/project-editor";
import { getContentPreview, getProjectBadgeClass } from "@/lib/transcript-utils";

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTaskId, setFilterTaskId] = useState<string>("");
  const [filterEpicId, setFilterEpicId] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [transcriptsData, tasksData, epicsData, projectsData] = await Promise.all([
        api.transcripts.list(filterTaskId || undefined, filterEpicId || undefined).catch(() => []),
        api.tasks.list().catch(() => []),
        api.epics.list().catch(() => []),
        api.projects.list().catch(() => []),
      ]);
      setTranscripts(transcriptsData);
      setTasks(tasksData);
      setEpics(epicsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
      // Set empty arrays on error
      setTranscripts([]);
      setTasks([]);
      setEpics([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectUpdate = (transcriptId: string, updated: Transcript) => {
    setTranscripts(transcripts.map((t) => (t.id === transcriptId ? updated : t)));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTaskId, filterEpicId]);

  const handleDownload = async (transcript: Transcript) => {
    try {
      const blob = await api.transcripts.download(transcript.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcript-${transcript.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading transcript:", error);
      alert("Error downloading transcript");
    }
  };

  const getTaskName = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find((t) => t.id === taskId);
    return task?.title || `Task #${taskId}`;
  };

  const getEpicName = (epicId?: string) => {
    if (!epicId) return null;
    const epic = epics.find((e) => String(e.id) === epicId);
    return epic?.title || `Epic #${epicId}`;
  };

  const filteredTranscripts = transcripts.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(query) ||
      t.agent_name.toLowerCase().includes(query) ||
      t.summary?.toLowerCase().includes(query) ||
      getTaskName(t.task_id)?.toLowerCase().includes(query) ||
      getEpicName(t.epic_id)?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading transcripts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transcripts</h1>
        <p className="text-muted-foreground">
          View and download conversation transcripts by task or epic
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by agent, task, or epic..."
                  className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Task</label>
              <select
                value={filterTaskId}
                onChange={(e) => setFilterTaskId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">All tasks</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Epic</label>
              <select
                value={filterEpicId}
                onChange={(e) => setFilterEpicId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">All epics</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcripts List */}
      <div className="grid gap-4">
        {filteredTranscripts.map((transcript) => {
          const taskName = getTaskName(transcript.task_id);
          const epicName = getEpicName(transcript.epic_id);
          const preview = getContentPreview(transcript);
          
          return (
            <Card key={transcript.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                      {transcript.title || transcript.agent_name}
                    </CardTitle>
                    
                    {/* Preview del contenido */}
                    {preview && (
                      <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">
                        {preview}
                      </p>
                    )}
                    
                    {/* Project badges */}
                    {transcript.project_names && transcript.project_names.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {transcript.project_names.map((name, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getProjectBadgeClass(name)}`}
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Task/Epic badges */}
                    <div className="flex items-center gap-2 mb-2">
                      {taskName && (
                        <Badge variant="outline" className="text-xs">
                          {taskName}
                        </Badge>
                      )}
                      {epicName && (
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          {epicName}
                        </Badge>
                      )}
                    </div>
                    
                    {transcript.summary && (
                      <CardDescription>{transcript.summary}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTranscript(transcript)}
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(transcript)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {transcript.messages?.length 
                        ? `${transcript.messages.length} messages` 
                        : transcript.content 
                          ? `${Math.ceil(transcript.content.length / 1000)}k chars` 
                          : "Empty"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(transcript.created_at).toLocaleString()}
                    </div>
                    {transcript.agent_name && (
                      <span>🤖 {transcript.agent_name}</span>
                    )}
                  </div>
                  
                  {/* Project Editor */}
                  <ProjectEditor
                    transcript={transcript}
                    allProjects={projects}
                    onSave={(updated) => handleProjectUpdate(transcript.id, updated)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTranscripts.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery || filterTaskId || filterEpicId
                ? "No transcripts match your filters"
                : "No transcripts yet"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transcript Viewer Modal */}
      {selectedTranscript && (
        <TranscriptViewer
          transcript={selectedTranscript}
          onClose={() => setSelectedTranscript(null)}
        />
      )}
    </div>
  );
}
