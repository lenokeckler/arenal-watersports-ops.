export const ERROR_STYLES = {
  container:
    "mt-6 mb-2 p-3 rounded-md shadow-sm mx-2 sm:mx-8 md:mx-12 lg:mx-20",
  getErrorMessageClass: (
    shouldShake: boolean,
    error: boolean
  ) =>
    `mt-4 text-sm text-center text-red-500 font-bold ${shouldShake ? "shake" : ""} ${error ? "visible" : "invisible"}`,
};
