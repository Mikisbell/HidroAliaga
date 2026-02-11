/**
 * Layout para rutas protegidas — CON sidebar
 * Aplica a: /, /proyectos, /normativa, etc.
 */
import { Sidebar } from "@/components/layout/sidebar"
import CopilotChat from "@/components/copilot/CopilotChat"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
                {children}
                <CopilotChat />
            </main>
        </div>
    )
}
