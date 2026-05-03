import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const question = await prisma.question.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } }, companies: { include: { company: true } } },
  })
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(question)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const { title, sourceUrl, notes, solution, difficulty, status, tagIds, companyIds } = await req.json()
  await prisma.tagsOnQuestions.deleteMany({ where: { questionId: id } })
  await prisma.companiesOnQuestions.deleteMany({ where: { questionId: id } })
  const question = await prisma.question.update({
    where: { id },
    data: {
      title, sourceUrl, notes, solution, difficulty, status,
      tags: { create: (tagIds ?? []).map((tagId: string) => ({ tagId })) },
      companies: { create: (companyIds ?? []).map((companyId: string) => ({ companyId })) },
    },
    include: { tags: { include: { tag: true } }, companies: { include: { company: true } } },
  })
  return NextResponse.json(question)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await prisma.question.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
