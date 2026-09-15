export type PaginationParams = {
  skip?: number;
  limit?: number;
};

export type Id = number | string;

export type UnknownRecord = Record<string, unknown>;

export type ValidationIssue = {
  loc: Array<string | number>;
  msg: string;
  type: string;
  input?: unknown;
  ctx?: UnknownRecord;
};

export type ValidationErrorResponse = {
  detail?: ValidationIssue[];
};

export type ApiErrorKind =
  | "bad-request"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "validation"
  | "server"
  | "network"
  | "timeout"
  | "unknown";

export type NormalizedApiError = {
  kind: ApiErrorKind;
  status?: number;
  message: string;
  fieldErrors?: Record<string, string>;
  raw?: unknown;
};
