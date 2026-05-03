import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(tags)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name } = await req.json()
  const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
  return NextResponse.json(tag, { status: 201 })
}
