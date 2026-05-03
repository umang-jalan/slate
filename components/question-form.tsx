"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface Tag { id: string; name: string }
interface Company { id: string; name: string }
interface Question {
  id?: string; title: string; sourceUrl?: string | null; notes?: string | null
  solution?: string | null; difficulty: string; status: string
  tags: { tag: Tag }[]; companies: { company: Company }[]
}
interface Props { question?: Question; allTags: Tag[]; allCompanies: Company[] }

export function QuestionForm({ question, allTags, allCompanies }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState(question?.title ?? "")
  const [sourceUrl, setSourceUrl] = useState(question?.sourceUrl ?? "")
  const [notes, setNotes] = useState(question?.notes ?? "")
  const [solution, setSolution] = useState(question?.solution ?? "")
  const [difficulty, setDifficulty] = useState(question?.difficulty ?? "MEDIUM")
  const [status, setStatus] = useState(question?.status ?? "TODO")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(question?.tags.map((t) => t.tag.id) ?? [])
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(question?.companies.map((c) => c.company.id) ?? [])
  const [newTagName, setNewTagName] = useState("")
  const [newCompanyName, setNewCompanyName] = useState("")
  const [localTags, setLocalTags] = useState<Tag[]>(allTags)
  const [localCompanies, setLocalCompanies] = useState<Company[]>(allCompanies)

  async function createTag() {
    if (!newTagName.trim()) return
    const res = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTagName.trim() }) })
    const tag = await res.json()
    setLocalTags((prev) => [...prev.filter((t) => t.id !== tag.id), tag].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedTagIds((prev) => [...prev, tag.id])
    setNewTagName("")
  }

  async function createCompany() {
    if (!newCompanyName.trim()) return
    const res = await fetch("/api/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCompanyName.trim() }) })
    const company = await res.json()
    setLocalCompanies((prev) => [...prev.filter((c) => c.id !== company.id), company].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedCompanyIds((prev) => [...prev, company.id])
    setNewCompanyName("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const body = { title, sourceUrl: sourceUrl || null, notes: notes || null, solution: solution || null, difficulty, status, tagIds: selectedTagIds, companyIds: selectedCompanyIds }
    const res = await fetch(question?.id ? `/api/questions/${question.id}` : "/api/questions", {
      method: question?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) { setError("Something went wrong. Please try again."); setLoading(false); return }
    const saved = await res.json()
    router.push(`/questions/${saved.id}`)
    router.refresh()
  }

  const unselectedTags = localTags.filter((t) => !selectedTagIds.includes(t.id))
  const unselectedCompanies = localCompanies.filter((c) => !selectedCompanyIds.includes(c.id))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Two Sum, Design a URL Shortener, Tell me about yourself…" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input id="sourceUrl" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://leetcode.com/problems/two-sum" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-1.5">
          {selectedTagIds.map((id) => { const tag = localTags.find((t) => t.id === id); return tag ? (<Badge key={id} variant="secondary" className="gap-1 cursor-default">{tag.name}<button type="button" onClick={() => setSelectedTagIds((prev) => prev.filter((x) => x !== id))}><X className="h-3 w-3" /></button></Badge>) : null })}
        </div>
        <div className="flex gap-2">
          {unselectedTags.length > 0 && (
            <Select onValueChange={(v) => setSelectedTagIds((prev) => [...prev, v])}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Add existing tag" /></SelectTrigger>
              <SelectContent>{unselectedTags.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <div className="flex gap-1.5">
            <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="New tag…" className="w-36" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createTag() } }} />
            <Button type="button" variant="outline" size="icon" onClick={createTag}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Companies</Label>
        <div className="flex flex-wrap gap-1.5">
          {selectedCompanyIds.map((id) => { const company = localCompanies.find((c) => c.id === id); return company ? (<Badge key={id} variant="outline" className="gap-1 cursor-default">{company.name}<button type="button" onClick={() => setSelectedCompanyIds((prev) => prev.filter((x) => x !== id))}><X className="h-3 w-3" /></button></Badge>) : null })}
        </div>
        <div className="flex gap-2">
          {unselectedCompanies.length > 0 && (
            <Select onValueChange={(v) => setSelectedCompanyIds((prev) => [...prev, v])}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Add company" /></SelectTrigger>
              <SelectContent>{unselectedCompanies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <div className="flex gap-1.5">
            <Input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="New company…" className="w-36" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createCompany() } }} />
            <Button type="button" variant="outline" size="icon" onClick={createCompany}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key observations, hints, similar problems…" rows={4} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="solution">Solution / Approach</Label>
        <Textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Write your solution or approach here…" rows={8} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : question?.id ? "Save changes" : "Add question"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
