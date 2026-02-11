"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X, MessageSquare, Loader2, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function CopilotChat() {
    const pathname = usePathname()
    // Extract project ID from URL if exists: /proyectos/[id]
    const proyectoId = pathname.match(/\/proyectos\/([a-f0-9-]+)/)?.[1]

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg: Message = { role: "user", content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/copilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    proyectoId
                })
            })

            if (!response.ok) throw new Error("Error en Copiloto")
            if (!response.body) throw new Error("No response body")

            // Stream handling
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false
            let assistantMsg = ""

            setMessages(prev => [...prev, { role: "assistant", content: "" }])

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)
                assistantMsg += chunkValue

                setMessages(prev => {
                    const newMsgs = [...prev]
                    newMsgs[newMsgs.length - 1].content = assistantMsg
                    return newMsgs;
                })
            }

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Lo siento, hubo un error al procesar tu consulta. Verifica tu conexión o la API Key." }])
        } finally {
            setIsLoading(false)
        }
    }

    if (!pathname.includes("/proyectos") && !pathname.includes("/dashboard")) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {isOpen && (
                <Card className="w-[350px] md:w-[450px] h-[500px] shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md mb-4 animate-in slide-in-from-bottom-10 fade-in pointer-events-auto">
                    <CardHeader className="py-3 border-b flex flex-row items-center justify-between bg-primary/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/20 rounded-lg">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">HidroChat IA</CardTitle>
                                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                                    {proyectoId ? "Contexto de Proyecto Activo" : "Modo General"}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0 flex flex-col h-[380px]">
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 space-y-4">
                                    <Bot className="w-12 h-12 opacity-20" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">¡Hola! Soy tu asistente hidráulico.</p>
                                        <p className="text-xs opacity-70">
                                            Pregúntame sobre normativa, resultados de tu cálculo, o sugerencias de optimización.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Button variant="outline" size="xs" onClick={() => setInput("¿Cumple este proyecto con la presión mínima?")}>
                                            ¿Cumple presiones?
                                        </Button>
                                        <Button variant="outline" size="xs" onClick={() => setInput("Suguiereme mejoras para la red")}>
                                            Sugerir mejoras
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`
                                        max-w-[85%] rounded-2xl px-3 py-2 text-sm
                                        ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-muted text-foreground rounded-bl-none border border-border/50"}
                                    `}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                                    ul: ({ ...props }) => <ul className="list-disc pl-4 mb-1" {...props} />,
                                                    li: ({ ...props }) => <li className="mb-0.5" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span className="text-xs text-muted-foreground">Analizando red...</span>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 bg-background border-t">
                        <form onSubmit={handleSubmit} className="flex w-full gap-2">
                            <Input
                                placeholder="Escribe tu consulta hidráulica..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 h-9 text-xs"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isLoading || !input.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={`
                    rounded-full shadow-lg transition-all duration-300 pointer-events-auto
                    ${isOpen ? 'w-12 h-12 bg-destructive hover:bg-destructive/90' : 'w-14 h-14 bg-gradient-to-br from-primary to-blue-600 hover:scale-110'}
                `}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-7 h-7" />}
            </Button>
        </div>
    )
}
