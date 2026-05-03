import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { QuestionForm } from "@/components/question-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")
  const { id } = await params
  const [question, tags, companies] = await Promise.all([
    prisma.question.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, companies: { include: { company: true } } },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ])
  if (!question) notFound()
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/questions/${id}`} className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-4">
          <ChevronLeft className="h-4 w-4" />Back
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Edit question</h1>
      </div>
      <QuestionForm question={question} allTags={tags} allCompanies={companies} />
    </div>
  )
}
