export type PermissionCode = string;

export type Permission = {
  code: PermissionCode;
  module: string;
  action: string;
  description?: string | null;
};

export type RoleDetail = {
  id: number;
  name: string;
  description?: string | null;
  permissions: PermissionCode[];
  users_count: number;
  is_system: boolean;
};

export type RoleCreatePayload = {
  name: string;
  description?: string | null;
  permissions: PermissionCode[];
};

export type RoleUpdatePayload = {
  name?: string;
  description?: string | null;
  permissions?: PermissionCode[];
};
