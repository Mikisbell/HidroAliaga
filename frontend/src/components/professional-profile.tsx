import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { 
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
        role: "Docente Ordinario Auxiliar",
        company: "Universidad Nacional Autónoma de Tayacaja Daniel Hernández Morillo",
        period: "2024 - Presente",
        description: "Docencia en ingeniería civil con especialización en sistemas hidráulicos. Desarrollo de Hidroaliaga, software profesional para diseño de redes de agua potable.",
        skills: ["Docencia", "Diseño Hidráulico", "RNE OS.050", "Hardy Cross"]
    },
    {
        role: "Asesor y Jurado de Tesis",
        company: "Universidad Continental - Facultad de Ingeniería",
        period: "2023 - Presente",
        description: "Asesoría y evaluación de tesis de grado en ingeniería civil, con enfoque en proyectos de infraestructura hidráulica y saneamiento.",
        skills: ["Asesoría Académica", "Investigación", "Evaluación"]
    },
    {
        role: "Ingeniero Civil - Especialista Hidráulico",
        company: "Consultora Independiente",
        period: "2018 - Presente",
        description: "Diseño y supervisión de proyectos de infraestructura hidráulica en 15 departamentos del Perú. Más de 80 proyectos completados.",
        skills: ["Diseño Hidráulico", "EPANET", "Gestión de Proyectos", "Normativa"]
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
                        {/* Cover Image - Azul profesional */}
                        <div className="h-48 md:h-64 rounded-t-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                        
                        {/* Profile Content */}
                        <div className="glass-card rounded-b-2xl rounded-t-none p-6 md:p-8 -mt-20 relative">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Avatar con foto real */}
                                <div className="relative -mt-24 md:-mt-28">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-1">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                                            <Image
                                                src="/Aron-Jhonatan-Aliaga-Contreras.jpg"
                                                alt="Aron Jhonatan Aliaga Contreras"
                                                width={160}
                                                height={160}
                                                className="w-full h-full object-cover"
                                                priority
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900" aria-label="Disponible"></div>
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl md:text-4xl font-bold mb-1 text-slate-100">
                                                Aron Jhonatan Aliaga Contreras
                                            </h1>
                                            <p className="text-lg text-blue-300 mb-2">Ingeniero Civil | Especialista en Sistemas Hidráulicos | Docente Universitario</p>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" aria-hidden="true" />
                                                    Huancayo, Junín, Perú
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" aria-hidden="true" />
                                                    300+ usuarios Hidroaliaga
                                                </span>
                                                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                                                    Disponible para proyectos
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons - Solo azul */}
                                        <div className="flex flex-wrap gap-2">
                                            <a href="mailto:aaliagacontreras@gmail.com">
                                                <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                                                    <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                                                    Contactar
                                                </Button>
                                            </a>
                                            <a href="https://orcid.org/0000-0002-5789-1946" target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/10">
                                                    <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                                                    ORCID
                                                </Button>
                                            </a>
                                            <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/10">
                                                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                                                CV
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Stats - Solo azul */}
                                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-400">6+</p>
                                            <p className="text-xs text-slate-400">Años Exp.</p>
                                        </div>
                                        <div className="text-center border-x border-slate-700/50">
                                            <p className="text-2xl font-bold text-blue-400">80+</p>
                                            <p className="text-xs text-slate-400">Proyectos</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-400">300+</p>
                                            <p className="text-xs text-slate-400">Usuarios</p>
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
                                    <Award className="w-5 h-5 text-blue-400" aria-hidden="true" />
                                    Sobre mí
                                </h2>
                                <div className="space-y-3 text-slate-300 leading-relaxed">
                                    <p>
                                        Ingeniero Civil y Docente Universitario con experiencia en diseño, análisis y 
                                        optimización de sistemas de agua potable y saneamiento. Actualmente Docente Ordinario 
                                        Auxiliar en la Universidad Nacional Autónoma de Tayacaja Daniel Hernández Morillo y 
                                        Asesor de Tesis en la Universidad Continental.
                                    </p>
                                    <p>
                                        Fundador de <strong className="text-blue-400">Hidroaliaga</strong>, software profesional 
                                        utilizado por más de 300 ingenieros en todo el Perú. Experto en normativa peruana 
                                        (RNE OS.050, RM 192-2018, RM 107-2025) y metodologías de cálculo hidráulico avanzadas 
                                        incluyendo Hardy Cross, Hazen-Williams y algoritmos genéticos de optimización.
                                    </p>
                                    <p>
                                        He liderado proyectos de infraestructura hídrica en 15 departamentos del Perú, 
                                        beneficiando a más de 50,000 habitantes con sistemas de agua potable diseñados 
                                        bajo los más altos estándares técnicos y académicos.
                                    </p>
                                </div>
                                
                                {/* Skills Tags - Solo azul y gris */}
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">Habilidades principales</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {["Diseño Hidráulico", "Hardy Cross", "EPANET", "RNE OS.050", "GIS", "Algoritmos Genéticos", "Optimización", "Gestión de Proyectos", "AutoCAD", "Revit"].map((skill) => (
                                            <span key={skill} className="px-3 py-1.5 rounded-full text-xs bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors cursor-default">
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
                                    <Briefcase className="w-5 h-5 text-blue-400" aria-hidden="true" />
                                    Experiencia
                                </h2>
                                <div className="space-y-6">
                                    {experiences.map((exp, index) => (
                                        <div key={index} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-slate-700 last:border-0">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900"></div>
                                            <h3 className="font-semibold text-slate-200">{exp.role}</h3>
                                            <p className="text-blue-400 text-sm">{exp.company}</p>
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
                                    <GraduationCap className="w-5 h-5 text-blue-400" aria-hidden="true" />
                                    Educación
                                </h2>
                                <div className="space-y-4">
                                    {education.map((edu, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="w-6 h-6 text-blue-400" aria-hidden="true" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-200">{edu.degree}</h3>
                                                <p className="text-blue-400 text-sm">{edu.school}</p>
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
                                <div className="p-4 rounded-xl bg-blue-600/20 border border-blue-500/30">
                                    <h3 className="font-semibold text-blue-300 mb-2">Software de Ingeniería</h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        Plataforma profesional para diseño de redes hidráulicas con más de 300 usuarios activos.
                                    </p>
                                    <div className="space-y-2 text-xs text-slate-500">
                                        <div className="flex justify-between">
                                            <span>Usuarios activos:</span>
                                            <span className="text-blue-400">300+</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Proyectos calculados:</span>
                                            <span className="text-blue-400">80+</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Departamentos:</span>
                                            <span className="text-blue-400">15</span>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white border-0">
                                    <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
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
