/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const channelColors: Record<string, string> = {
  ops: "bg-blue-50 text-blue-700 border-blue-200",
  colleague: "bg-purple-50 text-purple-700 border-purple-200",
  general: "bg-gray-50 text-gray-700 border-gray-200",
  ax: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filterChannel, setFilterChannel] = useState<string>("all");

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/comms/`, { cache: "no-store" });
      if (res.ok) {
        setMessages(await res.json());
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const channels = Array.from(new Set(messages.map((m: any) => m.channel).filter(Boolean)));

  const filtered = filterChannel === "all" 
    ? messages 
    : messages.filter((m: any) => m.channel === filterChannel);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">Agent communication timeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live · {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide md:mx-0 md:px-0 md:overflow-x-visible md:pb-0">
        <button
          onClick={() => setFilterChannel("all")}
          className={`shrink-0 px-3 py-2 rounded-md text-sm border transition-colors min-h-[44px] ${filterChannel === "all" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          All
        </button>
        {channels.map((ch) => (
          <button
            key={ch}
            onClick={() => setFilterChannel(ch)}
            className={`shrink-0 px-3 py-2 rounded-md text-sm border transition-colors min-h-[44px] ${filterChannel === ch ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            #{ch}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((msg: any) => (
          <Card key={msg.id} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  <span className="text-sm font-medium text-foreground">{msg.from_agent}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-sm font-medium text-foreground">{msg.to_agent}</span>
                  {msg.channel && (
                    <Badge variant="outline" className={`text-xs ${channelColors[msg.channel] || channelColors.general}`}>
                      #{msg.channel}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground break-words">{msg.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">
            No messages yet
          </div>
        )}
      </div>
    </div>
  );
}
