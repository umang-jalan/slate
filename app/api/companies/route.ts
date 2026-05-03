import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(companies)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name } = await req.json()
  const company = await prisma.company.upsert({ where: { name }, update: {}, create: { name } })
  return NextResponse.json(company, { status: 201 })
}
