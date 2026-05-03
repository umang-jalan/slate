import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
        <Link href="/questions" className="text-lg font-semibold text-zinc-900">Interview Prep</Link>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
          <Button variant="ghost" size="sm" type="submit">Sign out</Button>
        </form>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
