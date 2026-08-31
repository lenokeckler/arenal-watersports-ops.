/**
 * The one sanctioned place to write to the server console. The project's
 * `eslint.config.mjs` bans `console.*` everywhere (`no-console`) to keep
 * debug output out of the codebase, but a genuine failure caught at an API
 * route boundary — a `SupabaseQueryError`, for instance — still has to
 * reach the server log instead of disappearing when the route converts it
 * into a generic `Response.internalError(...)` for the client. Every route
 * that needs that funnels through here instead of a local
 * `eslint-disable-next-line no-console`.
 */
export const logServerError = (error: unknown): void => {
  // eslint-disable-next-line no-console
  console.error(error);
};
