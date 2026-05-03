"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    await fetch(`/api/questions/${id}`, { method: "DELETE" })
    router.push("/questions")
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm delete</Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
      </div>
    )
  }
  return (
    <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 className="h-4 w-4 mr-1.5" />Delete
    </Button>
  )
}
