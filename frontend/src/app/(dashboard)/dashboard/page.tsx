import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight, Zap, List, FileText, MoreHorizontal } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { BRAND } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || "User"
  const userId = user?.id

  let recentProjects: any[] = []

  if (userId) {
    const { data } = await supabase
      .from("proyectos")
      .select("id, nombre, ambito, tipo_red, estado, updated_at")
      .eq("usuario_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5)
    recentProjects = data || []
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">

      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome, {userName}!
        </h1>
        <p className="text-muted-foreground text-lg">
          What would you like to build today?
        </p>
      </div>

      {/* Templates Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Start with a template</h2>
          <Link href="/proyectos/nuevo" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            See all templates <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Template Card 1 - Basic Urban */}
          <Link href="/proyectos/nuevo?template=urban" className="block h-full">
            <Card className="h-full hover:shadow-lg transition-all duration-200 border-border/50 bg-card hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Basic Urban Network</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    Quick start for small urban grids. Includes basic demand patterns and reservoir configuration.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    5 min setup
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Template Card 2 - Rural Gravity */}
          <Link href="/proyectos/nuevo?template=rural" className="block h-full">
            <Card className="h-full hover:shadow-lg transition-all duration-200 border-border/50 bg-card hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Rural Gravity System</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    Designed for rural water supply. Gravity flow optimization with pressure reducing valves.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    10 min setup
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Template Card 3 - Pump Station */}
          <Link href="/proyectos/nuevo?template=pump" className="block h-full">
            <Card className="h-full hover:shadow-lg transition-all duration-200 border-border/50 bg-card hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Pumping Station Automation</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    Simulate pump curves and efficiency. Includes automated pump control logic templates.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    Advanced
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="flex justify-center pt-8">
          <span className="text-muted-foreground text-sm mr-2">or</span>
          <Link href="/proyectos/nuevo">
            <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
              <Plus className="w-4 h-4" />
              Start from scratch
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4 pt-8 border-t border-border/40">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your recent workflows</h2>
          <Link href="/proyectos" className="text-muted-foreground text-sm hover:text-foreground">
            View all
          </Link>
        </div>

        <Card className="border-border/50 bg-card/50 overflow-hidden">
          <CardContent className="p-0">
            {recentProjects.length > 0 ? (
              <div className="divide-y divide-border/40">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <div className="col-span-8 md:col-span-5">Name</div>
                  <div className="hidden md:block md:col-span-2">Type</div>
                  <div className="hidden md:block md:col-span-2">Status</div>
                  <div className="hidden md:block md:col-span-2">Last Modified</div>
                  <div className="col-span-4 md:col-span-1"></div>
                </div>

                {recentProjects.map((project) => (
                  <div key={project.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors group">
                    <div className="col-span-8 md:col-span-5 font-medium text-foreground flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <Link href={`/proyectos/${project.id}`} className="hover:underline hover:text-primary truncate">
                        {project.nombre}
                      </Link>
                    </div>
                    <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground truncate">
                      {project.tipo_red}
                    </div>
                    <div className="hidden md:block md:col-span-2">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {project.estado || 'Active'}
                      </Badge>
                    </div>
                    <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </div>
                    <div className="col-span-4 md:col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>No recent workflows found.</p>
                <Link href="/proyectos/nuevo" className="underline hover:text-foreground mt-2 block">
                  Create your first workflow
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
