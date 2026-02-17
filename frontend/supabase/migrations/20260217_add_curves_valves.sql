-- Create table for Characteristic Curves (Pumps, Volume, Efficiency)
create type tipo_curva as enum ('bomba', 'volumen', 'eficiencia');

create table if not exists curvas_caracteristicas (
    id uuid not null default gen_random_uuid(),
    proyecto_id uuid not null references proyectos(id) on delete cascade,
    nombre text not null,
    tipo tipo_curva not null default 'bomba',
    puntos jsonb not null default '[]'::jsonb, -- Array of {x, y}
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (id)
);

-- Enable RLS
alter table curvas_caracteristicas enable row level security;

-- Policies for curvas_caracteristicas
create policy "Users can view curves of their projects"
    on curvas_caracteristicas for select
    using ( exists ( select 1 from proyectos where id = curvas_caracteristicas.proyecto_id and usuario_id = auth.uid() ) );

create policy "Users can insert curves to their projects"
    on curvas_caracteristicas for insert
    with check ( exists ( select 1 from proyectos where id = curvas_caracteristicas.proyecto_id and usuario_id = auth.uid() ) );

create policy "Users can update curves of their projects"
    on curvas_caracteristicas for update
    using ( exists ( select 1 from proyectos where id = curvas_caracteristicas.proyecto_id and usuario_id = auth.uid() ) );

create policy "Users can delete curves of their projects"
    on curvas_caracteristicas for delete
    using ( exists ( select 1 from proyectos where id = curvas_caracteristicas.proyecto_id and usuario_id = auth.uid() ) );


-- Add Pump/Valve columns to Tramos table
create type tipo_valvula_control as enum ('PRV', 'PSV', 'FCV', 'TCV', 'GPV');
create type estado_valvula as enum ('open', 'closed', 'active');

alter table tramos 
    add column if not exists curva_bomba_id uuid references curvas_caracteristicas(id) on delete set null,
    add column if not exists estado_inicial estado_valvula default 'open',
    add column if not exists consigna_valvula float default 0, -- Setting (Pressure, Flow, etc.)
    add column if not exists tipo_valvula tipo_valvula_control;
