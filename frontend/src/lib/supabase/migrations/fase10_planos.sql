-- Phase 10: Map Support for Rural Plans

-- 1. Enable Storage if not already enabled (usually enabled by default)

-- 2. Create 'planos' bucket
insert into storage.buckets (id, name, public)
values ('planos', 'planos', true)
on conflict (id) do nothing;

-- 3. Policy to allow authenticated users to upload plans
create policy "Authenticated users can upload plans"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'planos' );

create policy "Authenticated users can update plans"
on storage.objects for update
to authenticated
with check ( bucket_id = 'planos' );

create policy "Anyone can read plans"
on storage.objects for select
to public
using ( bucket_id = 'planos' );

-- 4. Add 'configuracion_plano' column to 'proyectos' table
alter table proyectos
add column if not exists configuracion_plano jsonb default null;

-- Example JSON structure for configuracion_plano:
-- {
--   "url": "https://.../planos/plano-123.png",
--   "opacity": 0.5,
--   "rotation": 0,
--   "bounds": [ [lat1, lng1], [lat2, lng2] ]
-- }
