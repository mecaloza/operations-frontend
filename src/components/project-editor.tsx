"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Transcript, Project } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface ProjectEditorProps {
  transcript: Transcript;
  allProjects: Project[];
  onSave: (updated: Transcript) => void;
}

export function ProjectEditor({ transcript, allProjects, onSave }: ProjectEditorProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    transcript.project_ids || (transcript.project_id ? [transcript.project_id] : [])
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/transcripts/${transcript.id}/projects`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_ids: selectedIds }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update projects: ${res.statusText}`);
      }

      const updated = await res.json();
      onSave(updated);
      setIsOpen(false);
    } catch (err) {
      console.error("Error updating projects:", err);
      alert("Error updating projects. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        🏷️ Edit Projects
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Edit Projects for &quot;{transcript.title || transcript.agent_name}&quot;
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allProjects.length === 0 ? (
                <p className="text-sm text-gray-500">No projects available</p>
              ) : (
                allProjects.map((project) => (
                  <label key={project.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(Number(project.id))}
                      onChange={(e) => {
                        const projectId = Number(project.id);
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, projectId]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== projectId));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{project.name}</span>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
