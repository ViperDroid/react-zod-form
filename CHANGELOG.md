# Changelog

All notable changes to **@viper_droid/react-zod-form-builder** are summarized here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-04-17

### Documentation & discoverability

- **README**: npm + GitHub links table, version/license badges, explicit **conditional fields (`components.visibleIf`)** bullet, clarified **AI-ready** story (`AI_USAGE_GUIDE.md` + `dist/` copy after build).
- **`package.json`**: Richer **description** and **keywords** (multi-step, wizard, Tailwind, Cursor, AI) so npm search surfaces the power features.
- **Metadata**: `repository`, `homepage`, and `bugs` URLs for GitHub.
- **Pack contents**: `CHANGELOG.md` included in the published tarball.

### Unchanged in 1.1.0

- No runtime API changes versus **1.0.0**; upgrade is safe for existing consumers.

## [1.0.0] - 2026-04-17

### Added

- **`SchemaForm`**: `currentStep` + `step:N` in `.describe()` for multi-step UIs.
- **`components.visibleIf`**: map of field name → `(formValues) => boolean` for conditional visibility.
- **Grid**: `cols:N` in `.describe()` → Tailwind `col-span-*` in a 2-column field grid when any field uses `cols:`.
- **UX flags**: `isLoading`, `isSuccess`, `successMessage`, `loadingLabel`, `showSubmitButton`.
- **`AI_USAGE_GUIDE.md`**: agent-oriented guide and golden prompt; copied to **`dist/AI_USAGE_GUIDE.md`** on library build.
- Default Tailwind field components and shipped **`style.css`**.

[1.1.0]: https://github.com/ViperDroid/react-zod-form/releases
[1.0.0]: https://github.com/ViperDroid/react-zod-form/releases
