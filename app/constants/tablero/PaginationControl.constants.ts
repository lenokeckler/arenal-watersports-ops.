/** Shared by every server-paginated listing (US-TAB-008). */
export const PAGINATION_CONTROL = {
  NEXT: "Siguiente",
  PAGE_OF: (page: number, totalPages: number): string =>
    `Página ${page} de ${totalPages}`,
  PREVIOUS: "Anterior",
} as const;
