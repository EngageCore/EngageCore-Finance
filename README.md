# Frontend Workspace Notes

## Hooks Path Update (Flattening)

- The `hooks` directory has been flattened. All hooks previously under `@/hooks/common/*` or `@/hooks/business/*` are now imported directly from `@/hooks/*`.
- Update imports accordingly:
  - `@/hooks/common/router` → `@/hooks/router`
  - `@/hooks/common/icon` → `@/hooks/icon`
  - `@/hooks/common/echarts` → `@/hooks/echarts`
  - `@/hooks/common/form` → `@/hooks/form`
  - `@/hooks/common/table` → `@/hooks/table`
  - `@/hooks/business/auth` → `@/hooks/auth`
  - `@/hooks/business/captcha` → `@/hooks/captcha`
  - `@/hooks/useCallApi` remains `@/hooks/useCallApi`

## Notes

- The flattening keeps all functional logic and export methods unchanged.
- Empty subfolders `hooks/common` and `hooks/business` have been removed.
- If you maintain external docs or READMEs, replace all `@/hooks/common/` and `@/hooks/business/` paths with the flattened form shown above.