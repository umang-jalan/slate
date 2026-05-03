"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Tag { id: string; name: string }
interface Company { id: string; name: string }
interface Props { tags: Tag[]; companies: Company[]; searchParams: Record<string, string | undefined> }

export function QuestionsFilters({ tags, companies, searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams()
    const merged = { ...searchParams, [key]: value }
    for (const [k, v] of Object.entries(merged)) { if (v) params.set(k, v) }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const hasFilters = Object.values(searchParams).some(Boolean)

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Input placeholder="Search questions…" className="w-56" defaultValue={searchParams.search ?? ""} onChange={(e) => update("search", e.target.value || undefined)} />
      <Select value={searchParams.status ?? "all"} onValueChange={(v) => update("status", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>
      <Select value={searchParams.difficulty ?? "all"} onValueChange={(v) => update("difficulty", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All difficulties</SelectItem>
          <SelectItem value="EASY">Easy</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HARD">Hard</SelectItem>
        </SelectContent>
      </Select>
      <Select value={searchParams.tagId ?? "all"} onValueChange={(v) => update("tagId", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Tag" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {tags.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={searchParams.companyId ?? "all"} onValueChange={(v) => update("companyId", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Company" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All companies</SelectItem>
          {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          <X className="h-4 w-4 mr-1" />Clear
        </Button>
      )}
    </div>
  )
}
