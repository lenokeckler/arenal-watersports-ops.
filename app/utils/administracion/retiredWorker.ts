/**
 * `workers.username` es unico y obligatorio, con formato de minusculas sin
 * espacios. Al eliminar un perfil hay que soltarlo: quien entre despues
 * puede necesitar ese mismo nombre, y dejarlo ocupado por alguien que ya no
 * trabaja aqui es exactamente el perfil que la duena pidio que no quedara.
 *
 * El reemplazo no se inventa al azar: se arma del propio identificador, asi
 * que dos perfiles eliminados nunca chocan entre si y el nombre resultante
 * sigue cumpliendo el `check` de formato.
 */
const RETIRED_PREFIX = "eliminado-";
const ID_FRAGMENT_LENGTH = 12;

export const buildRetiredUsername = (
  workerId: string
): string =>
  `${RETIRED_PREFIX}${workerId
    .replace(/-/g, "")
    .slice(0, ID_FRAGMENT_LENGTH)}`;

/**
 * El correo sintetico con el que la cuenta de auth entra al sistema se arma
 * del nombre de usuario, asi que al liberar el nombre hay que liberar
 * tambien el correo: si no, crear despues a alguien con ese mismo usuario
 * chocaria contra un `auth.users` que todavia lo tiene ocupado.
 */
export const buildRetiredEmail = (
  workerId: string,
  domain: string
): string => `${buildRetiredUsername(workerId)}${domain}`;
