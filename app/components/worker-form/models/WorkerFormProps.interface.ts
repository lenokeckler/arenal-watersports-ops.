export interface WorkerFormProps {
  /**
   * US-ADM-001: hides "Administración" from the role picker and explains
   * why — `workers_single_admin` allows at most one, and the form should
   * say so before the worker fills it out, not after the database rejects
   * it. Always `false` when `restrictToExternalGuide` is set: that path
   * never shows the role picker at all.
   */
  adminAccountExists?: boolean;
  /**
   * US-RES-013: `/reservas/guia-externo/nuevo` reuses this exact form, but
   * reservas can only ever produce the temporary external-guide shape —
   * the role picker and the toggle are hidden, not just disabled.
   */
  restrictToExternalGuide?: boolean;
}
