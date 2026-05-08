"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { BarChart2, PlusCircle, Search, Edit3, Calendar, Download } from "lucide-react"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Alt+K or Ctrl/Cmd+K
      if (e.key === "k" && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Escriba un comando o busque una sección..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Navegación del Sistema">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Dashboard Principal</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/ingreso"))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Nuevo Ingreso</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/visualizador"))} value="buscador visualizador de casos">
            <Search className="mr-2 h-4 w-4" />
            <span>Buscador (Visualizador de Casos)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/edicion"))} value="edicion editar o eliminar trabajos">
            <Edit3 className="mr-2 h-4 w-4" />
            <span>Edición (Modificar o Eliminar Trabajos)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/entregas"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agenda de Entregas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/exportar"))} value="exportar reportes pdf excel">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar Reportes (PDF/Excel)</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
