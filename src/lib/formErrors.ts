import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { normalizeApiError } from "@/api/errors";

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
) {
  const apiError = normalizeApiError(error);
  if (apiError.fieldErrors) {
    Object.entries(apiError.fieldErrors).forEach(([path, message]) => {
      setError(path as Path<TFieldValues>, { message });
    });
  }
  return apiError;
}
