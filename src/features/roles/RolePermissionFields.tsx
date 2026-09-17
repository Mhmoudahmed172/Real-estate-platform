import { useMemo } from "react";
import { allPermissionCodes, permissionActionLabels, permissionCode, permissionGroups } from "@/features/roles/permissionCatalog";

type RolePermissionFieldsProps = {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function RolePermissionFields({ selected, onChange, disabled = false }: RolePermissionFieldsProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const catalogCodes = allPermissionCodes();
  const selectedCount = catalogCodes.filter((code) => selectedSet.has(code)).length;

  function toggle(code: string, checked: boolean) {
    const next = new Set(selectedSet);
    if (checked) next.add(code);
    else next.delete(code);
    onChange(catalogCodes.filter((item) => next.has(item)));
  }

  function toggleModule(module: string, actions: readonly string[], checked: boolean) {
    const next = new Set(selectedSet);
    actions.forEach((action) => {
      const code = permissionCode(module, action);
      if (checked) next.add(code);
      else next.delete(code);
    });
    onChange(catalogCodes.filter((item) => next.has(item)));
  }

  function toggleAll(checked: boolean) {
    onChange(checked ? [...catalogCodes] : []);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            checked={selectedCount === catalogCodes.length && catalogCodes.length > 0}
            className="size-4 accent-primary"
            disabled={disabled}
            type="checkbox"
            onChange={(event) => toggleAll(event.target.checked)}
          />
          تحديد الكل
        </label>
        <p className="text-meta">تم اختيار {selectedCount} من {catalogCodes.length} صلاحية</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {permissionGroups.map((group) => {
          const moduleSelected = group.actions.filter((action) => selectedSet.has(permissionCode(group.module, action))).length;
          return (
            <section key={group.module} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{group.labelAr}</h3>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    checked={moduleSelected === group.actions.length}
                    className="size-4 accent-primary"
                    disabled={disabled}
                    type="checkbox"
                    onChange={(event) => toggleModule(group.module, group.actions, event.target.checked)}
                  />
                  تحديد الكل
                </label>
              </div>
              <div className="grid gap-2">
                {group.actions.map((action) => {
                  const code = permissionCode(group.module, action);
                  return (
                    <label key={code} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        checked={selectedSet.has(code)}
                        className="size-4 accent-primary"
                        disabled={disabled}
                        type="checkbox"
                        onChange={(event) => toggle(code, event.target.checked)}
                      />
                      {permissionActionLabels[action] ?? action}
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
