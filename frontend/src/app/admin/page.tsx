"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getSystemStats } from "@/app/actions/admin"

export default function AdminPage() {
    const [stats, setStats] = useState({ users: 0, projects: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getSystemStats()
            .then(data => setStats(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Resumen del Sistema</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
                <Card className="stat-card stat-card-blue bg-card/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Usuarios Totales</CardTitle>
                        <span className="text-2xl grayscale opacity-70">👥</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {loading ? "..." : stats.users}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Registrados en la plataforma</p>
                    </CardContent>
                </Card>

                <Card className="stat-card stat-card-purple bg-card/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Proyectos Activos</CardTitle>
                        <span className="text-2xl grayscale opacity-70">🏗️</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {loading ? "..." : stats.projects}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">En toda la plataforma</p>
                    </CardContent>
                </Card>

                <Card className="stat-card stat-card-green bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-green-700 dark:text-green-400">Estado del Sistema</CardTitle>
                        <span className="text-2xl">✅</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">Operativo</div>
                        <p className="text-xs text-green-600/60 dark:text-green-400/60 mt-1">Base de datos conectada</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Link href="/admin/users" className="block">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle>Gestión de Usuarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Ver lista de usuarios, promover a administradores o bloquear acceso.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/projects" className="block">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle>Auditoría de Proyectos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Explorar todos los proyectos creados por la comunidad. Acceso de lectura/escritura global.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="h-full border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/10">
                    <CardHeader>
                        <CardTitle className="text-orange-700 dark:text-orange-400">Pruebas de Estrés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Generar un proyecto sintético con 500 nudos y tuberías para probar el rendimiento.</p>
                        <StressTestButton />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import { generateStressTestProject } from "@/app/actions/admin/stress-test"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import { toast } from "sonner"

function StressTestButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStressTest = async () => {
        setLoading(true)
        try {
            const res = await generateStressTestProject(500)
            toast.success("Proyecto de estrés creado")
            router.push(`/proyectos/${res.projectId}`)
        } catch (error) {
            console.error(error)
            toast.error("Error al generar test")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleStressTest} disabled={loading} variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/30">
            <Zap className="w-4 h-4 mr-2" />
            {loading ? "Generando..." : "Generar Datos de Prueba"}
        </Button>
    )
}
