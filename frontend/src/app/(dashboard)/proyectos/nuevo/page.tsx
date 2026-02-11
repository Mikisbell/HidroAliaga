"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { proyectoCreateSchema, type ProyectoCreateInput } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NuevoProyectoPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = useForm<ProyectoCreateInput>({
        resolver: zodResolver(proyectoCreateSchema) as any,
        defaultValues: {
            ambito: "urbano",
            tipo_red: "cerrada",
            periodo_diseno: 20,
            dotacion_percapita: 169,
            coef_cobertura: 0.8,
        },
    })

    const onSubmit = async (data: ProyectoCreateInput) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch("/api/proyectos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || "Error al crear proyecto")
            }

            const proyecto = await response.json()
            router.push(`/proyectos/${proyecto.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-2xl space-y-6">
            <div className="animate-fade-in-up">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                    Crear
                </p>
                <h1 className="text-2xl font-bold tracking-tight">Nuevo Proyecto</h1>
                <p className="text-sm text-muted-foreground/60 mt-1">
                    Define el perfil del proyecto antes de iniciar el trazado
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in-up-delay-1">
                {/* Información General */}
                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs">📝</span>
                            Información General
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="nombre" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Nombre del proyecto *
                            </Label>
                            <Input
                                id="nombre"
                                placeholder="Ej: Red de Agua Potable - Caserío San Miguel"
                                {...register("nombre")}
                                className="mt-1.5 h-10 bg-background/40 border-border/40"
                            />
                            {errors.nombre && (
                                <p className="text-xs text-red-400 mt-1">{errors.nombre.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="descripcion" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Descripción
                            </Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Descripción del proyecto, tipo de sistema, fuentes..."
                                {...register("descripcion")}
                                className="mt-1.5 bg-background/40 border-border/40 min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ámbito</Label>
                                <Select defaultValue="urbano" onValueChange={(v) => setValue("ambito", v as "urbano" | "rural")}>
                                    <SelectTrigger className="mt-1.5 h-10 bg-background/40 border-border/40"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="urbano">🏙️ Urbano (OS.050)</SelectItem>
                                        <SelectItem value="rural">🏔️ Rural (RM 192)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Red</Label>
                                <Select defaultValue="cerrada" onValueChange={(v) => setValue("tipo_red", v as "abierta" | "cerrada" | "mixta")}>
                                    <SelectTrigger className="mt-1.5 h-10 bg-background/40 border-border/40"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="abierta">🔗 Abierta (Ramales)</SelectItem>
                                        <SelectItem value="cerrada">🔄 Cerrada (Mallas)</SelectItem>
                                        <SelectItem value="mixta">🔀 Mixta (Híbrida)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ubicación */}
                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center text-xs">📍</span>
                            Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="departamento" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Departamento</Label>
                                <Input id="departamento" placeholder="Cajamarca" {...register("departamento")} className="mt-1.5 h-10 bg-background/40 border-border/40" />
                            </div>
                            <div>
                                <Label htmlFor="provincia" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Provincia</Label>
                                <Input id="provincia" placeholder="Jaén" {...register("provincia")} className="mt-1.5 h-10 bg-background/40 border-border/40" />
                            </div>
                            <div>
                                <Label htmlFor="distrito" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Distrito</Label>
                                <Input id="distrito" placeholder="San Ignacio" {...register("distrito")} className="mt-1.5 h-10 bg-background/40 border-border/40" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Parámetros de Diseño */}
                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs">⚙️</span>
                            Parámetros de Diseño
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="poblacion_diseno" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Población de Diseño</Label>
                                <Input id="poblacion_diseno" type="number" placeholder="habitantes" {...register("poblacion_diseno", { valueAsNumber: true })} className="mt-1.5 h-10 bg-background/40 border-border/40" />
                            </div>
                            <div>
                                <Label htmlFor="periodo_diseno" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Período de Diseño</Label>
                                <Input id="periodo_diseno" type="number" defaultValue={20} {...register("periodo_diseno", { valueAsNumber: true })} className="mt-1.5 h-10 bg-background/40 border-border/40" />
                                <p className="text-[10px] text-muted-foreground/40 mt-1">años</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dotacion_percapita" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dotación Per Cápita</Label>
                                <Input id="dotacion_percapita" type="number" step="0.1" defaultValue={169} {...register("dotacion_percapita", { valueAsNumber: true })} className="mt-1.5 h-10 bg-background/40 border-border/40" />
                                <p className="text-[10px] text-muted-foreground/40 mt-1">
                                    L/hab/día — RM 107: Cálido 169, Templado 155, Frío 129
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="coef_cobertura" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Coef. Cobertura</Label>
                                <Input id="coef_cobertura" type="number" step="0.01" defaultValue={0.8} {...register("coef_cobertura", { valueAsNumber: true })} className="mt-1.5 h-10 bg-background/40 border-border/40" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary text-white rounded-xl px-8 h-11 font-semibold"
                    >
                        {isSubmitting ? "Creando..." : "Crear Proyecto"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl h-11 border-border/30">
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    )
}
