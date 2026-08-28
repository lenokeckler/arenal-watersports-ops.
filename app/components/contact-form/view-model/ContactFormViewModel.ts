export const createHandleChange =
  (
    onChange: (
      _event: React.ChangeEvent<
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
      >
    ) => void
  ) =>
  (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) =>
    onChange(event);
