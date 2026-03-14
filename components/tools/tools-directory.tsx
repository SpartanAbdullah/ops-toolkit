"use client";

import { useDeferredValue, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toolCategories, tools } from "@/lib/content";
import type { ToolCategory } from "@/lib/types";

type ToolsDirectoryProps = {
  initialCategory?: string;
};

export function ToolsDirectory({ initialCategory }: ToolsDirectoryProps) {
  const defaultCategory = toolCategories.includes(initialCategory as ToolCategory)
    ? (initialCategory as ToolCategory)
    : "All";

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "All">(defaultCategory);
  const deferredQuery = useDeferredValue(query);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
    const haystack = `${tool.name} ${tool.shortDescription} ${tool.category} ${tool.bestFor}`.toLowerCase();
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const liveCount = tools.filter((tool) => tool.live).length;
  const freeCount = tools.filter((tool) => tool.status === "Free").length;
  const hasActiveFilters = query.length > 0 || activeCategory !== "All";

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="grid gap-6 pt-7 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tools, workflows, payroll, warehouse, admin"
                  className="pl-11"
                  aria-label="Search tools"
                />
              </div>
              <div className="text-sm font-medium text-slate-500">{filteredTools.length} matching tool{filteredTools.length === 1 ? "" : "s"}</div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Filter by category</p>
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setActiveCategory("All");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={activeCategory === "All" ? "default" : "outline"}
                  onClick={() => setActiveCategory("All")}
                >
                  All categories
                </Button>
                {toolCategories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={activeCategory === category ? "default" : "outline"}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-[1.55rem] border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-violet-200 bg-violet-50 text-violet-700 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Library snapshot</p>
                <p className="font-display text-xl font-semibold text-slate-950">Focused and browsable</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { label: "Total tools", value: `${tools.length}` },
                { label: "Free now", value: `${freeCount}` },
                { label: "Live now", value: `${liveCount}` },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.15rem] border border-white/90 bg-white/90 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTools.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
            <p className="font-display text-3xl font-semibold text-slate-950">No tools match this filter</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
              Try a broader category or a different keyword. The library is intentionally focused, so every result should be easy to understand at a glance.
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => {
                setQuery("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}