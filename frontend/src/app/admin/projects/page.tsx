"use client"

import { useEffect, useState } from "react"
import { getAllProjects } from "@/app/actions/admin"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

type Project = {
    id: string
    nombre: string
    ubicacion: string | null
    created_at: string
    estado: string
    usuario_id: string
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllProjects()
            .then(data => setProjects(data as Project[]))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Auditoría de Proyectos</h2>

            <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="pl-6">Proyecto</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Actualizado</TableHead>
                            <TableHead className="text-right pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground animate-pulse">
                                    Cargando proyectos del sistema...
                                </TableCell>
                            </TableRow>
                        ) : projects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No hay proyectos registrados en el sistema.
                                </TableCell>
                            </TableRow>
                        ) : (
                            projects.map((project) => (
                                <TableRow key={project.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                                {project.nombre.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-foreground">{project.nombre}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                                    ID: {project.id.split('-')[0]}...
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {project.ubicacion || <span className="text-muted-foreground/30 italic">Sin ubicación</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={project.estado === 'activo'
                                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 dark:border-green-800"
                                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}
                                        >
                                            {project.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 space-x-1">
                                        <Link href={`/proyectos/${project.id}`}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-blue-600" title="Ver Proyecto">
                                                ↗
                                            </Button>
                                        </Link>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            title="Eliminar Proyecto"
                                            onClick={async () => {
                                                if (confirm("¿Eliminar este proyecto permanentemente?")) {
                                                    try {
                                                        const { deleteProject } = await import("@/app/actions/admin")
                                                        await deleteProject(project.id)
                                                        setProjects(prev => prev.filter(p => p.id !== project.id))
                                                    } catch (error) {
                                                        console.error(error)
                                                        alert("Error al eliminar el proyecto")
                                                    }
                                                }
                                            }}
                                        >
                                            🗑️
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
