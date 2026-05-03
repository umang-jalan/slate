import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink } from "lucide-react"
import { QuestionsFilters } from "./filters"
import { Difficulty, Status } from "@prisma/client"

interface SearchParams {
  status?: string
  difficulty?: string
  tagId?: string
  companyId?: string
  search?: string
  [key: string]: string | undefined
}

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth()
  if (!session) redirect("/login")
  const sp = await searchParams

  const [questions, tags, companies] = await Promise.all([
    prisma.question.findMany({
      where: {
        ...(sp.status ? { status: sp.status as Status } : {}),
        ...(sp.difficulty ? { difficulty: sp.difficulty as Difficulty } : {}),
        ...(sp.tagId ? { tags: { some: { tagId: sp.tagId } } } : {}),
        ...(sp.companyId ? { companies: { some: { companyId: sp.companyId } } } : {}),
        ...(sp.search ? { title: { contains: sp.search, mode: "insensitive" } } : {}),
      },
      include: { tags: { include: { tag: true } }, companies: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ])

  const stats = {
    total: await prisma.question.count(),
    done: await prisma.question.count({ where: { status: "DONE" } }),
    inProgress: await prisma.question.count({ where: { status: "IN_PROGRESS" } }),
    todo: await prisma.question.count({ where: { status: "TODO" } }),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Questions</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{stats.done}/{stats.total} done · {stats.inProgress} in progress · {stats.todo} to do</p>
        </div>
        <Link href="/questions/new"><Button><Plus className="h-4 w-4 mr-1.5" />Add question</Button></Link>
      </div>
      <QuestionsFilters tags={tags} companies={companies} searchParams={sp} />
      {questions.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-lg">No questions found</p>
          <p className="text-sm mt-1">Add your first question to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <Link key={q.id} href={`/questions/${q.id}`} className="block bg-white border border-zinc-200 rounded-lg px-5 py-4 hover:border-zinc-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-900 truncate">{q.title}</span>
                    {q.sourceUrl && <ExternalLink className="h-3.5 w-3.5 text-zinc-400 shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {q.tags.map(({ tag }) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}
                    {q.companies.map(({ company }) => <Badge key={company.id} variant="outline">{company.name}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={q.difficulty.toLowerCase() as "easy" | "medium" | "hard"}>{q.difficulty}</Badge>
                  <Badge variant={q.status === "IN_PROGRESS" ? "in_progress" : q.status === "DONE" ? "done" : "todo"}>
                    {q.status === "IN_PROGRESS" ? "In Progress" : q.status === "DONE" ? "Done" : "To Do"}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
