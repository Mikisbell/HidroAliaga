import { OpenAI } from "openai"
import { createClient } from "@/lib/supabase/server"
import { NORMAS, getLimitesNormativos } from "@/lib/constants"

// Initialize Moonshot (Kimi) client — OpenAI-compatible API
const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY || '',
    baseURL: 'https://api.moonshot.cn/v1',
})

const LLM_MODEL = process.env.LLM_MODEL || 'kimi-k2-turbo-preview'

export async function POST(req: Request) {
    // Check API Key
    if (!process.env.MOONSHOT_API_KEY) {
        return new Response(JSON.stringify({ error: "MOONSHOT_API_KEY no configurada. Por favor añádela a .env.local" }), { status: 500 })
    }

    try {
        const { messages, proyectoId } = await req.json()

        let systemContext = `Eres 'HidroChat', un asistente experto en ingeniería hidráulica y normativa peruana (RNE OS.050).
        Ayudas a ingenieros a diseñar y validar redes de agua potable.
        Responde de forma concisa, técnica y profesional. Usa formato Markdown.
        
        NORMATIVA VIGENTE:
        - Presión Mínima Urbana: 10 m.c.a. (Rural: 5 m.c.a.)
        - Presión Máxima Estática: 50 m.c.a.
        - Velocidad Mínima: 0.6 m/s
        - Velocidad Máxima: 3.0 m/s
        - Dotaciones (lppd): Cálido 169, Templado 155, Frío 129.`

        // Si hay proyectoId, inyectamos contexto del proyecto
        if (proyectoId) {
            const supabase = await createClient()

            // Fetch basic project info (parallel)
            const [proyectoRes, nudosRes, tramosRes, calculoRes] = await Promise.all([
                supabase.from("proyectos").select("*").eq("id", proyectoId).single(),
                supabase.from("nudos").select("tipo, presion_calc, demanda_base").eq("proyecto_id", proyectoId),
                supabase.from("tramos").select("material, diametro_interior, longitud, velocidad, perdida_carga").eq("proyecto_id", proyectoId),
                supabase.from("calculos").select("*").eq("proyecto_id", proyectoId).order("created_at", { ascending: false }).limit(1).single()
            ])

            const proyecto = proyectoRes.data
            const nudos = nudosRes.data || []
            const tramos = tramosRes.data || []
            const calculo = calculoRes.data

            if (proyecto) {
                const limits = getLimitesNormativos(proyecto.ambito === 'rural' ? 'rural' : 'urbano')

                systemContext += `\n\nCONTEXTO DEL PROYECTO ACTUAL:
                - Nombre: ${proyecto.nombre}
                - Ámbito: ${proyecto.ambito}
                - Tipo Red: ${proyecto.tipo_red}
                - Nudos: ${nudos.length}
                - Tuberías: ${tramos.length}
                
                ESTADO DEL CÁLCULO:
                ${calculo ? `- Último cálculo: ${calculo.convergencia ? 'CONVERGE' : 'NO CONVERGE'}
                - Presión Mín/Max: ${calculo.presion_minima?.toFixed(2)} / ${calculo.presion_maxima?.toFixed(2)} m.c.a.
                - Velocidad Mín/Max: ${calculo.velocidad_minima?.toFixed(2)} / ${calculo.velocidad_maxima?.toFixed(2)} m/s
                - Cumple Validación: ${calculo.validacion_passed ? 'SÍ' : 'NO'}` : '- No calculado aún.'}
                
                LÍMITES NORMATIVOS APLICABLES:
                - P.Mín: ${limits.presion_minima} m.c.a.
                - P.Máx: ${limits.presion_maxima} m.c.a.
                `
            }
        }

        const response = await client.chat.completions.create({
            model: LLM_MODEL,
            stream: true,
            messages: [
                { role: "system", content: systemContext },
                ...messages
            ],
        })

        // Convert to readable stream
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || ""
                    controller.enqueue(new TextEncoder().encode(content))
                }
                controller.close()
            },
        })

        return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        })

    } catch (error) {
        console.error("Copilot Error:", error)
        return new Response(JSON.stringify({ error: "Error procesando tu consulta." }), { status: 500 })
    }
}
