-- purge_expired_history es la unica funcion de todo el esquema que puede
-- borrar. Al ser security definer, corre con los privilegios de postgres
-- (su dueno) sin importar quien la invoque -- y Postgres otorga EXECUTE a
-- PUBLIC por defecto en toda funcion nueva. Esa combinacion convertia la
-- unica excepcion al no borrado en una puerta abierta: anon, sin
-- autenticar, podia llamarla y borrar cinco anos de historial de reservas,
-- saltandose tanto RLS como la revocacion de DELETE de la tarea 13.
--
-- Aqui se cierra esa puerta: solo el dueno y service_role pueden ejecutarla.
-- El job de pg_cron no pasa por este GRANT porque corre como el rol de la
-- base (el dueno de la funcion), no como anon ni authenticated, asi que la
-- revocacion no le afecta.
revoke execute on function purge_expired_history() from public;
revoke execute on function purge_expired_history() from anon;
revoke execute on function purge_expired_history() from authenticated;
grant execute on function purge_expired_history() to service_role;
