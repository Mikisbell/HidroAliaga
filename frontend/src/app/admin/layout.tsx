"use client"

import { useProfile } from "@/hooks/use-profile"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import CopilotChat from "@/components/copilot/CopilotChat"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { loading, isAdmin } = useProfile()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard')
        }
    }, [loading, isAdmin, router])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAdmin) {
        return null // Will redirect via useEffect
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative bg-background/50">
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🛡️</span>
                        <h1 className="font-bold text-lg text-foreground">Admin Panel</h1>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono bg-purple-500/10 text-purple-500 border-purple-500/20">
                        MODO DIOS
                    </Badge>
                </header>

                <div className="p-6">
                    {children}
                </div>
                <CopilotChat />
            </main>
        </div>
    )
}

import { Badge } from "@/components/ui/badge"
