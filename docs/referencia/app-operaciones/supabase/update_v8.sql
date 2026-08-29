-- Arenal Ops — v8: never let the org lose its last active admin.
-- Enforces, at the DB level, that an active (not blocked) admin cannot be
-- demoted or blocked when they are the only one left. Covers both RLS-path
-- role edits and the Netlify Function's block mirror-write. Idempotent.
-- Scope: this is a per-row guard. Every admin mutation in the app updates a
-- single row (.eq('id', …)), so it holds for all current paths. A single bulk
-- statement that demoted/blocked several admins at once (UPDATE … WHERE
-- role='admin') is NOT covered by this guard — don't rely on it for that.

create or replace function public.prevent_last_admin_lockout()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only relevant when this row WAS an active admin and is ceasing to be one
  -- (role changes away from admin, or it becomes blocked).
  if (old.role = 'admin' and old.blocked = false)
     and (new.role <> 'admin' or new.blocked = true) then
    if (select count(*) from public.profiles
        where role = 'admin' and blocked = false and id <> old.id) = 0 then
      raise exception 'No se puede bloquear ni degradar al último administrador activo.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_last_admin_lockout on public.profiles;
create trigger trg_prevent_last_admin_lockout
  before update on public.profiles
  for each row execute function public.prevent_last_admin_lockout();
