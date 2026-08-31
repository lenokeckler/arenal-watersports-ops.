-- US-OPE-015 / US-OPE-016: las fotos de estado de una maquina son el primer
-- archivo que este sistema guarda. El bucket es privado: la aplicacion sirve
-- cada foto con una URL firmada de vida corta, nunca por un enlace publico
-- adivinable, porque estas imagenes documentan el estado de un activo de la
-- empresa y no tienen por que verse desde fuera de la sesion.
--
-- Convencion de ruta: "<unit_id>/<angle>". La unicidad (unit_id, angle) de
-- unit_condition_photos ya implementa "se reemplazan cuando cambia el
-- estado"; que la ruta sea la misma hace que la subida nueva sobrescriba el
-- archivo viejo en vez de acumular uno por cada reemplazo.
insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values (
  'unit-condition-photos',
  'unit-condition-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- El resto de operaciones las ve pero no las cambia (US-OPE-016): el select
-- queda abierto a cualquier autenticado, igual que photos_select sobre
-- unit_condition_photos, y acotado a este bucket para que no se convierta en
-- un permiso general sobre el almacenamiento.
create policy condition_photos_select on storage.objects
  for select to authenticated
  using (bucket_id = 'unit-condition-photos');

-- Solo puede subirlas quien tenga la marca de encargado general, ademas de
-- administracion (US-OPE-015). Misma condicion que photos_insert sobre la
-- tabla: si alguien intenta subir el archivo saltandose la pantalla, el
-- almacenamiento lo rechaza igual.
create policy condition_photos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'unit-condition-photos'
    and (public.has_mark('encargado_general') or public.is_admin())
  );

create policy condition_photos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'unit-condition-photos'
    and (public.has_mark('encargado_general') or public.is_admin())
  )
  with check (
    bucket_id = 'unit-condition-photos'
    and (public.has_mark('encargado_general') or public.is_admin())
  );

-- Sin politica de delete, a proposito: reemplazar una foto sobrescribe su
-- ruta, y borrarla del todo seria perder la referencia visual sin dejar
-- rastro. Es la misma regla de "sin borrado fisico" (RNF-030) que ya rige
-- todo el esquema publico.
