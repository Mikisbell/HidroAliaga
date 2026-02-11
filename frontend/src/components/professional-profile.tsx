"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Linkedin, 
    Mail, 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    Award,
    Users,
    Download,
    ExternalLink
} from "lucide-react"

const experiences = [
    {
        role: "Ingeniero Civil - Especialista Hidráulico",
        company: "Consultora Independiente",
        period: "2018 - Presente",
        description: "Diseño y supervisión de proyectos de infraestructura hidráulica. Desarrollo de Hidroaliaga.",
        skills: ["Diseño Hidráulico", "RNE OS.050", "Hardy Cross", "EPANET"]
    },
    {
        role: "Jefe de Proyectos",
        company: "Constructora Andina S.A.C.",
        period: "2015 - 2018",
        description: "Liderazgo de equipos multidisciplinarios en proyectos de agua potable y saneamiento.",
        skills: ["Gestión de Proyectos", "Equipos", "Supervisión"]
    },
    {
        role: "Ingeniero de Proyectos",
        company: "Ingeniería San Marcos E.I.R.L.",
        period: "2012 - 2015",
        description: "Elaboración de expedientes técnicos y cálculos hidráulicos para sistemas de agua.",
        skills: ["Expedientes", "Cálculos", "Normativa"]
    }
]

const education = [
    {
        degree: "Ingeniero Civil",
        school: "Universidad Nacional de Ingeniería (UNI)",
        period: "2007 - 2012",
        details: "Especialización en Hidráulica y Recursos Hídricos"
    },
    {
        degree: "Diplomado en Gestión de Proyectos",
        school: "PUCP - Pontificia Universidad Católica",
        period: "2014",
        details: "Gestión de proyectos de infraestructura"
    }
]

const certifications = [
    { name: "Colegiado CIP", number: "CIP 12345", year: "2012" },
    { name: "ISO 9001:2015", number: "Calidad", year: "2019" },
    { name: "RNE OS.050", number: "Especialista", year: "2020" },
]

export function ProfessionalProfile() {
    return (
        <section id="perfil" className="relative z-10 px-6 md:px-12 py-24">
            <div className="max-w-6xl mx-auto">
                <ScrollReveal>
                    {/* Main Profile Card */}
                    <div className="relative mb-8">
                        {/* Cover Image */}
                        <div className="h-48 md:h-64 rounded-t-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                        
                        {/* Profile Content */}
                        <div className="glass-card rounded-b-2xl rounded-t-none p-6 md:p-8 -mt-20 relative">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Avatar */}
                                <div className="relative -mt-24 md:-mt-28">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 p-1">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-4xl md:text-5xl font-bold text-white">
                                            JA
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900"></div>
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                                Jhonata Aliaga
                                            </h1>
                                            <p className="text-lg text-purple-300 mb-2">Ingeniero Civil | Especialista en Sistemas Hidráulicos</p>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    Lima, Perú
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    500+ conexiones
                                                </span>
                                                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                                                    Disponible para proyectos
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0">
                                                <Mail className="w-4 h-4 mr-2" />
                                                Contactar
                                            </Button>
                                            <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/10">
                                                <Linkedin className="w-4 h-4 mr-2" />
                                                LinkedIn
                                            </Button>
                                            <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/10">
                                                <Download className="w-4 h-4 mr-2" />
                                                CV
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-400">12+</p>
                                            <p className="text-xs text-slate-400">Años Exp.</p>
                                        </div>
                                        <div className="text-center border-x border-slate-700/50">
                                            <p className="text-2xl font-bold text-pink-400">80+</p>
                                            <p className="text-xs text-slate-400">Proyectos</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-violet-400">300+</p>
                                            <p className="text-xs text-slate-400">Clientes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
                
                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About */}
                        <ScrollReveal delay={0.1}>
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-400" />
                                    Sobre mí
                                </h2>
                                <div className="space-y-3 text-slate-300 leading-relaxed">
                                    <p>
                                        Ingeniero Civil con más de 12 años de experiencia especializado en diseño, 
                                        análisis y optimización de sistemas de agua potable y saneamiento. Fundador 
                                        de <strong className="text-purple-400">Hidroaliaga</strong>, software profesional 
                                        utilizado por más de 300 ingenieros en todo el Perú.
                                    </p>
                                    <p>
                                        Experto en normativa peruana (RNE OS.050, RM 192-2018, RM 107-2025) y metodologías 
                                        de cálculo hidráulico avanzadas incluyendo Hardy Cross, Hazen-Williams y algoritmos 
                                        genéticos de optimización.
                                    </p>
                                    <p>
                                        He liderado proyectos de infraestructura hídrica en 15 departamentos del Perú, 
                                        beneficiando a más de 50,000 habitantes con sistemas de agua potable diseñados 
                                        bajo los más altos estándares técnicos.
                                    </p>
                                </div>
                                
                                {/* Skills Tags */}
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">Habilidades principales</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {["Diseño Hidráulico", "Hardy Cross", "EPANET", "RNE OS.050", "GIS", "Algoritmos Genéticos", "Optimización", "Gestión de Proyectos", "AutoCAD", "Revit"].map((skill) => (
                                            <span key={skill} className="px-3 py-1.5 rounded-full text-xs bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-purple-500/50 hover:text-purple-300 transition-colors cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                        
                        {/* Experience */}
                        <ScrollReveal delay={0.2}>
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-400" />
                                    Experiencia
                                </h2>
                                <div className="space-y-6">
                                    {experiences.map((exp, index) => (
                                        <div key={index} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-slate-700 last:border-0">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 border-4 border-slate-900"></div>
                                            <h3 className="font-semibold text-slate-200">{exp.role}</h3>
                                            <p className="text-purple-400 text-sm">{exp.company}</p>
                                            <p className="text-slate-500 text-xs mb-2">{exp.period}</p>
                                            <p className="text-slate-400 text-sm mb-3">{exp.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {exp.skills.map((skill) => (
                                                    <span key={skill} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                        
                        {/* Education */}
                        <ScrollReveal delay={0.3}>
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-purple-400" />
                                    Educación
                                </h2>
                                <div className="space-y-4">
                                    {education.map((edu, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-200">{edu.degree}</h3>
                                                <p className="text-purple-400 text-sm">{edu.school}</p>
                                                <p className="text-slate-500 text-xs">{edu.period}</p>
                                                <p className="text-slate-400 text-xs mt-1">{edu.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Certifications */}
                        <ScrollReveal delay={0.2}>
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Certificaciones</h2>
                                <div className="space-y-3">
                                    {certifications.map((cert, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                            <div>
                                                <p className="font-medium text-sm text-slate-200">{cert.name}</p>
                                                <p className="text-xs text-slate-500">{cert.number}</p>
                                            </div>
                                            <span className="text-xs text-slate-500">{cert.year}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                        
                        {/* Software */}
                        <ScrollReveal delay={0.3}>
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Hidroaliaga</h2>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30">
                                    <h3 className="font-semibold text-purple-300 mb-2">Software de Ingeniería</h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        Plataforma profesional para diseño de redes hidráulicas con más de 300 usuarios activos.
                                    </p>
                                    <div className="space-y-2 text-xs text-slate-500">
                                        <div className="flex justify-between">
                                            <span>Usuarios activos:</span>
                                            <span className="text-purple-400">300+</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Proyectos calculados:</span>
                                            <span className="text-purple-400">80+</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Departamentos:</span>
                                            <span className="text-purple-400">15</span>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Ver Software
                                </Button>
                            </div>
                        </ScrollReveal>
                        
                        {/* Languages */}
                        <ScrollReveal delay={0.4}>
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Idiomas</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-300">Español</span>
                                        <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">Nativo</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-300">Inglés</span>
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">Avanzado</Badge>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    )
}
