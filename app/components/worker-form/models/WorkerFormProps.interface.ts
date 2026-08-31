export interface WorkerFormProps {
  /**
   * US-RES-013: `/reservas/guia-externo/nuevo` reuses this exact form, but
   * reservas can only ever produce the temporary external-guide shape —
   * the role picker and the toggle are hidden, not just disabled.
   */
  restrictToExternalGuide?: boolean;
}
