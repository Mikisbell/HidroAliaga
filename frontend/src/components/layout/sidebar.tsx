"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import {
    LayoutDashboard,
    FolderOpen,
    BookOpen,
    Shield,
    Plus,
    LogOut,
    ChevronsUpDown,
    Settings,
    Moon,
    Sun,
    Laptop,
    Droplets,
    ArrowRight,
    ChevronDown
} from "lucide-react"

import { useProfile } from "@/hooks/use-profile"
import { handleApiError } from "@/lib/error-handler"
import { BRAND } from "@/lib/constants"
import { ProjectSettingsModal } from "@/components/project/ProjectSettingsModal"
import { CreateProjectModal } from "@/components/project/CreateProjectModal"
import { useProjects } from "@/hooks/use-projects"

interface SidebarProject {
    id: string
    nombre: string
    estado: string | null
    updated_at: string
}

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/proyectos", label: "Proyectos", icon: FolderOpen },
    { href: "/normativa", label: "Normativa", icon: BookOpen },
]

function NavContent() {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, loading, isAdmin } = useProfile()
    const { setTheme, theme } = useTheme()
    const [projectsOpen, setProjectsOpen] = useState(true)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)

    // Use SWR Hook
    const { projects: allProjects, isLoading: projectsLoading } = useProjects()

    // Filter and slice projects (client-side for now)
    const projects = allProjects?.slice(0, 6) || []

    const handleSignOut = async () => {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            try {
                const res = await fetch("/api/auth/signout", { method: "POST" })
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
                }
                router.push("/login")
                router.refresh()
            } catch (error) {
                handleApiError(error, "cerrar sesión")
            }
        }
    }

    // Extract current project ID from URL if on a project page
    const activeProjectId = pathname.match(/\/proyectos\/([a-f0-9-]+)/)?.[1]

    return (
        <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
            {/* Logo and Theme Toggle */}
            <div className="p-4 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                        H
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight">HidroAliaga</h1>
                        <p className="text-[10px] text-muted-foreground">Professional Suite</p>
                    </div>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>

            {/* Primary Action Button (Google Style) */}
            <div className="px-4 mb-2">
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="w-full justify-start gap-3 rounded-xl h-11 shadow-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-accent/40 dark:text-accent-foreground dark:border-border/50 dark:hover:bg-accent/60 transition-all font-medium"
                >
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Nuevo Proyecto</span>
                </Button>
            </div>

            <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                <p className="px-4 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 mt-4">Navegación</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                                isActive
                                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                    : "text-muted-foreground hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")} />
                            {item.label}
                        </Link>
                    )
                })}

                {/* Section removed as per user request to avoid duplication with main Proyectos link */}

                {/* Admin Link */}
                {
                    isAdmin && (
                        <>
                            <div className="my-4 px-3">
                                <Separator className="opacity-50" />
                            </div>
                            <p className="px-4 text-[10px] font-medium text-purple-500/70 uppercase tracking-wider mb-2">Administración</p>
                            <Link
                                href="/admin"
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    pathname.startsWith("/admin")
                                        ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                                        : "text-muted-foreground hover:bg-purple-50/50 hover:text-purple-600 dark:hover:bg-purple-900/10"
                                )}
                            >
                                <Shield className="w-4 h-4 text-purple-500" />
                                Admin Panel
                            </Link>
                        </>
                    )
                }
            </nav>

            {/* User Profile Footer */}
            <div className="p-3 mt-auto border-t border-border/40">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full h-auto p-2 justify-start gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            {!loading && profile ? (
                                <>
                                    <Avatar className="w-8 h-8 border shadow-sm">
                                        <AvatarImage src={profile.avatar_url || ""} />
                                        <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white text-[10px]">
                                            {profile.full_name?.[0] || profile.email?.[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate w-full text-left">
                                            {profile.full_name?.split(' ')[0] || "Usuario"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate w-full text-left">
                                            {profile.email}
                                        </p>
                                    </div>
                                    <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
                                </>
                            ) : (
                                <div className="animate-pulse flex items-center gap-3 w-full">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[240px] mb-2" side="right" sideOffset={10}>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{profile?.full_name || "Mi Cuenta"}</p>
                                <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configuración
                        </DropdownMenuItem>
                        {isAdmin && (
                            <DropdownMenuItem onClick={() => router.push('/admin')}>
                                <Shield className="w-4 h-4 mr-2" />
                                Administración
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/10">
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div >

            {/* Settings Modal */}
            < ProjectSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div >
    )
}

export function Sidebar() {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[260px] border-r border-border/40 bg-card/50 backdrop-blur-xl h-screen sticky top-0">
                <NavContent />
            </aside>

            {/* Mobile */}
            <div className="md:hidden fixed top-3 left-3 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm border-border/40 rounded-xl shadow-sm">
                            <LayoutDashboard className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0">
                        <NavContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}
