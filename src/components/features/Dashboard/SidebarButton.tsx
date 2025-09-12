"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelRight } from "lucide-react"

export default function SidebarButton() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button className="fixed z-[1] p-0 w-8 h-8" variant="ghost" onClick={toggleSidebar}>
      <PanelRight size={32} />
    </Button>
  )
}