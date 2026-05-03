import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const questions = await prisma.question.findMany({
    where: {
      ...(searchParams.get("status") ? { status: searchParams.get("status") as "TODO" | "IN_PROGRESS" | "DONE" } : {}),
      ...(searchParams.get("difficulty") ? { difficulty: searchParams.get("difficulty") as "EASY" | "MEDIUM" | "HARD" } : {}),
      ...(searchParams.get("tagId") ? { tags: { some: { tagId: searchParams.get("tagId")! } } } : {}),
      ...(searchParams.get("companyId") ? { companies: { some: { companyId: searchParams.get("companyId")! } } } : {}),
      ...(searchParams.get("search") ? { title: { contains: searchParams.get("search")!, mode: "insensitive" } } : {}),
    },
    include: { tags: { include: { tag: true } }, companies: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(questions)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { title, sourceUrl, notes, solution, difficulty, status, tagIds, companyIds } = await req.json()
  const question = await prisma.question.create({
    data: {
      title, sourceUrl, notes, solution, difficulty, status,
      tags: { create: (tagIds ?? []).map((tagId: string) => ({ tagId })) },
      companies: { create: (companyIds ?? []).map((companyId: string) => ({ companyId })) },
    },
    include: { tags: { include: { tag: true } }, companies: { include: { company: true } } },
  })
  return NextResponse.json(question, { status: 201 })
}
