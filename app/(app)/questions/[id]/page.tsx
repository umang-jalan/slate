import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Pencil, ExternalLink } from "lucide-react"
import { DeleteButton } from "./delete-button"

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")
  const { id } = await params
  const question = await prisma.question.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } }, companies: { include: { company: true } } },
  })
  if (!question) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/questions" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-3">
            <ChevronLeft className="h-4 w-4" />Back to questions
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">{question.title}</h1>
          {question.sourceUrl && (
            <a href={question.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1">
              Source <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/questions/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-1.5" />Edit</Button></Link>
          <DeleteButton id={id} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant={question.difficulty.toLowerCase() as "easy" | "medium" | "hard"}>{question.difficulty}</Badge>
        <Badge variant={question.status === "IN_PROGRESS" ? "in_progress" : question.status === "DONE" ? "done" : "todo"}>
          {question.status === "IN_PROGRESS" ? "In Progress" : question.status === "DONE" ? "Done" : "To Do"}
        </Badge>
        {question.tags.map(({ tag }) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}
        {question.companies.map(({ company }) => <Badge key={company.id} variant="outline">{company.name}</Badge>)}
      </div>
      {question.notes && (
        <div className="space-y-2">
          <h2 className="font-semibold text-zinc-900">Notes</h2>
          <div className="bg-white border border-zinc-200 rounded-lg p-4 text-sm text-zinc-700 whitespace-pre-wrap">{question.notes}</div>
        </div>
      )}
      {question.solution && (
        <div className="space-y-2">
          <h2 className="font-semibold text-zinc-900">Solution / Approach</h2>
          <div className="bg-white border border-zinc-200 rounded-lg p-4 text-sm text-zinc-700 whitespace-pre-wrap font-mono">{question.solution}</div>
        </div>
      )}
      {!question.notes && !question.solution && (
        <div className="text-center py-8 text-zinc-400 text-sm">
          No notes or solution yet.{" "}
          <Link href={`/questions/${id}/edit`} className="text-zinc-600 hover:underline">Add them now.</Link>
        </div>
      )}
    </div>
  )
}
