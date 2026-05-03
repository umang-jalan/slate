import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { QuestionForm } from "@/components/question-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function NewQuestionPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const [tags, companies] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ])
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/questions" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-4">
          <ChevronLeft className="h-4 w-4" />Back to questions
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Add question</h1>
      </div>
      <QuestionForm allTags={tags} allCompanies={companies} />
    </div>
  )
}
