-- Correccion de 20260828001950, que entendio mal lo que pedia la duena.
--
-- Aquella migracion trato la baja como una despedida definitiva: bloqueaba
-- reactivar el perfil, y la ruta borraba el correo, la cedula y hasta el
-- nombre de usuario. Lo que hace falta es lo contrario: la persona se va,
-- pierde el acceso y desaparece del panel, pero su cuenta se guarda entera
-- por si vuelve — y si vuelve, entra con la misma cuenta que tenia, con sus
-- areas y sus marcas.
--
-- `deleted_at` se queda, pero significa "dada de baja", no "borrada": la
-- fila sigue siendo una cuenta completa, solo que archivada y sin acceso.
-- El acceso lo corta la ruta de servidor baneando la cuenta de auth y
-- poniendole una contrasena que nadie conoce; recontratar levanta el baneo
-- y entrega una contrasena temporal nueva, porque quien vuelve no deberia
-- entrar con la clave que tenia el dia que se fue.
drop trigger if exists workers_guard_deleted on workers;
drop function if exists guard_worker_stays_deleted();

comment on column workers.deleted_at is
  'Cuando se dio de baja a la persona. La cuenta se conserva entera y sin acceso: no sale del panel principal, y si la recontratan vuelve con sus mismas areas y marcas.';
