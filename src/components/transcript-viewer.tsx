"use client";

import { useEffect } from "react";
import type { Transcript } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, User, Bot, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TranscriptViewerProps {
  transcript: Transcript;
  onClose: () => void;
}

export function TranscriptViewer({ transcript, onClose }: TranscriptViewerProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "user":
        return <User className="h-4 w-4" />;
      case "assistant":
        return <Bot className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "assistant":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "system":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Transcript — {transcript.agent_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(transcript.created_at).toLocaleString()} •{" "}
                {transcript.messages?.length 
                  ? `${transcript.messages.length} messages` 
                  : transcript.content 
                    ? `${Math.ceil(transcript.content.length / 1000)}k chars` 
                    : "Empty"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
              {transcript.messages && transcript.messages.length > 0 ? (
                // Vista de mensajes (chat-style)
                transcript.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-100 text-blue-800"
                          : message.role === "assistant"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getRoleIcon(message.role)}
                    </div>
                    <div
                      className={`flex-1 max-w-[75%] ${
                        message.role === "user" ? "items-end" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getRoleBadgeColor(message.role)} text-xs`}>
                          {message.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-blue-50 border border-blue-200"
                            : message.role === "assistant"
                            ? "bg-white border border-gray-200"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : transcript.content ? (
                // Vista de contenido markdown (Plaud AI, etc.)
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{transcript.content}</ReactMarkdown>
                </div>
              ) : (
                // Vacío real
                <p className="text-center text-muted-foreground italic py-8">
                  No content available
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}
