"use client"

import { useEffect, useState } from "react"
import { getUsers, updateUserRole, updateUserProfile } from "@/app/actions/admin"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
    Mail,
    Shield,
    Trash2,
    Globe,
    MoreHorizontal,
    Search,
    Pencil,
    UserCog,
    CheckCircle2
} from "lucide-react"

type RichProfile = {
    id: string
    email: string
    full_name: string | null
    role: 'user' | 'admin'
    avatar_url: string | null
    provider: string
    last_sign_in_at: string | null
    created_at: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<RichProfile[]>([])
    const [filteredUsers, setFilteredUsers] = useState<RichProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<RichProfile | null>(null)
    const [editName, setEditName] = useState("")

    const loadUsers = async () => {
        setLoading(true)
        try {
            // Get current user first
            const { createClient } = await import("@/lib/supabase/client")
            const supabase = createClient()
            const { data: { user: me } } = await supabase.auth.getUser()
            setCurrentUser(me)

            const data = await getUsers()
            setUsers(data as RichProfile[])
            setFilteredUsers(data as RichProfile[])
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar usuarios")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase()
        const filtered = users.filter(user =>
            (user.full_name?.toLowerCase() || "").includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        )
        setFilteredUsers(filtered)
    }, [searchQuery, users])

    const handleToggleRole = async (user: RichProfile) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin'

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))

        try {
            await updateUserRole(user.id, newRole)
            toast.success(`Rol actualizado: ${user.full_name || 'Usuario'} es ahora ${newRole}`)
        } catch (error) {
            console.error(error)
            // Revert
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: user.role } : u))
            toast.error("No se pudo actualizar el rol")
        }
    }

    const handleEditUser = (user: RichProfile) => {
        setEditingUser(user)
        setEditName(user.full_name || "")
        setIsEditOpen(true)
    }

    const saveUserChanges = async () => {
        if (!editingUser) return

        try {
            await updateUserProfile(editingUser.id, { full_name: editName })

            setUsers(prev => prev.map(u =>
                u.id === editingUser.id ? { ...u, full_name: editName } : u
            ))

            toast.success("Perfil actualizado correctamente")
            setIsEditOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar cambios")
        }
    }

    const handleDeleteUser = async (user: RichProfile) => {
        if (confirm(`¿ELIMINAR a ${user.email}?\n\nEsta acción es IRREVERSIBLE. Se borrarán todos sus proyectos.`)) {
            try {
                const { deleteUser } = await import("@/app/actions/admin")
                await deleteUser(user.id)
                toast.success("Usuario eliminado correctamente")
                setUsers(prev => prev.filter(u => u.id !== user.id))
            } catch (error) {
                console.error(error)
                toast.error("Error al eliminar usuario")
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
                    <p className="text-muted-foreground">Administra el acceso y roles de la plataforma.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar usuarios..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm animate-fade-in-up">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[60px] pl-6">Avatar</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Ingreso</TableHead>
                            <TableHead className="text-right pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Cargando usuarios...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No se encontraron usuarios.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="relative w-10 h-10">
                                            <Avatar>
                                                <AvatarImage src={user.avatar_url || ""} />
                                                <AvatarFallback>{user.full_name ? user.full_name[0] : "?"}</AvatarFallback>
                                            </Avatar>
                                            {/* Provider Icon Badge */}
                                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border shadow-sm" title={`Proveedor: ${user.provider}`}>
                                                {user.provider === 'google' ? (
                                                    <Globe className="w-3 h-3 text-blue-500" />
                                                ) : (
                                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm flex items-center gap-2">
                                                {user.full_name || "Sin nombre"}
                                                {user.id === currentUser?.id && (
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1">Tú</Badge>
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.role === 'admin' ? "default" : "secondary"}
                                            className={user.role === 'admin' ? "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200" : "bg-slate-100 text-slate-600"}
                                        >
                                            {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <UserCog className="w-3 h-3 mr-1" />}
                                            {user.role === 'admin' ? "Administrador" : "Usuario"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {user.last_sign_in_at
                                            ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true, locale: es })
                                            : "Nunca"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Abrir menú</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                    Copiar ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar Perfil
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleRole(user)}
                                                    disabled={user.id === currentUser?.id}
                                                    className={user.id === currentUser?.id ? "opacity-50 cursor-not-allowed" : ""}
                                                >
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    {user.role === 'admin' ? 'Degradar a Usuario' : 'Promover a Admin'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-red-600 focus:text-red-600"
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar Usuario
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Realiza cambios en el perfil del usuario aquí. Haz clic en guardar cuando termines.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button onClick={saveUserChanges}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
