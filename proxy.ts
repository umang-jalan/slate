import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const session = await auth()
  const isLoginPage = request.nextUrl.pathname === "/login"

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/questions", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
