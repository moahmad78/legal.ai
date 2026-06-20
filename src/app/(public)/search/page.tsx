"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4 bg-background/95 backdrop-blur sticky top-0 z-10">
        <h1 className="text-lg font-semibold mb-3">Search Chats</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search conversations, documents, topics..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        {query
          ? `No results found for "${query}"`
          : "Start typing to search your conversations"}
      </div>
    </div>
  );
}
