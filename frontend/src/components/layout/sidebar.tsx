"use client"

import { useState } from "react"
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
} from "lucide-react"

import { useProfile } from "@/hooks/use-profile"
import { handleApiError } from "@/lib/error-handler"
import { ProjectSettingsModal } from "@/components/project/ProjectSettingsModal"
import { CreateProjectModal } from "@/components/project/CreateProjectModal"

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/proyectos", label: "Projects", icon: FolderOpen },
    { href: "/normativa", label: "Normativa", icon: BookOpen },
]

function NavContent() {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, loading, isAdmin } = useProfile()
    const { setTheme, theme } = useTheme()
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)

    const handleSignOut = async () => {
        if (confirm("Are you sure you want to sign out?")) {
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

    return (
        <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            {/* Header / Logo */}
            <div className="h-14 flex items-center px-4 border-b border-sidebar-border/50">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-sm tracking-tight">n8n (clone)</span>
                </Link>
                <div className="ml-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="w-full justify-start gap-2 mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create workflow
                </Button>

                <div className="space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent text-primary" // Active state
                                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground" // Inactive state
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                {isAdmin && (
                    <div className="mt-6 pt-6 border-t border-sidebar-border/50">
                        <p className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                            Admin
                        </p>
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname.startsWith("/admin")
                                    ? "bg-sidebar-accent text-primary"
                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                            )}
                        >
                            <Shield className="w-4 h-4" />
                            Settings
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-t border-sidebar-border/50">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto hover:bg-sidebar-accent/50">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 rounded-md border border-sidebar-border">
                                    <AvatarImage src={profile?.avatar_url || ""} />
                                    <AvatarFallback className="rounded-md bg-sidebar-accent text-sidebar-foreground">
                                        {profile?.full_name?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-sm font-medium truncate w-full text-left">
                                        {profile?.full_name?.split(' ')[0] || "User"}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate w-full text-left">
                                        {profile?.email}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto w-3 h-3 text-muted-foreground opacity-50" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56" side="right" sideOffset={12}>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ProjectSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
            <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    )
}

export function Sidebar() {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-[240px] flex-col h-screen sticky top-0 bg-sidebar z-30">
                <NavContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-3 left-3 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-sidebar border border-sidebar-border shadow-sm">
                            <LayoutDashboard className="w-5 h-5 text-sidebar-foreground" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[240px] border-r border-sidebar-border bg-sidebar">
                        <NavContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}
