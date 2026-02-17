-- Create table for Demand Patterns (Curvas de Modulación)
create table public.patrones_demanda (
    id uuid not null default gen_random_uuid(),
    proyecto_id uuid not null references public.proyectos(id) on delete cascade,
    nombre text not null,
    descripcion text,
    multiplicadores jsonb not null default '[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]', -- Array of 24 floats
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    
    constraint patrones_demanda_pkey primary key (id)
);

-- Add foreign key to nudos table
alter table public.nudos 
add column patron_demanda_id uuid references public.patrones_demanda(id) on delete set null;

-- Enable RLS
alter table public.patrones_demanda enable row level security;

-- Policies for patrones_demanda (inherit from project access usually, but for now simple owner check based on project)
-- Assuming policies exist on proyectos that restrict access. We can link via project_id.

create policy "Users can view patterns of their projects"
on public.patrones_demanda for select
using (
    exists (
        select 1 from public.proyectos
        where proyectos.id = patrones_demanda.proyecto_id
        and proyectos.usuario_id = auth.uid()
    )
);

create policy "Users can insert patterns to their projects"
on public.patrones_demanda for insert
with check (
    exists (
        select 1 from public.proyectos
        where proyectos.id = patrones_demanda.proyecto_id
        and proyectos.usuario_id = auth.uid()
    )
);

create policy "Users can update patterns of their projects"
on public.patrones_demanda for update
using (
    exists (
        select 1 from public.proyectos
        where proyectos.id = patrones_demanda.proyecto_id
        and proyectos.usuario_id = auth.uid()
    )
);

create policy "Users can delete patterns of their projects"
on public.patrones_demanda for delete
using (
    exists (
        select 1 from public.proyectos
        where proyectos.id = patrones_demanda.proyecto_id
        and proyectos.usuario_id = auth.uid()
    )
);
