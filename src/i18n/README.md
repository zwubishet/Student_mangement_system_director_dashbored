# FinoteSchool localization

**Product:** FinoteSchool (ፊኖት ትምህርት ቤት) — Ethiopia school EMS: students, fees, payroll, exams.

## Locale files

| File | Language |
|------|----------|
| `locales/en.json` | English (source) |
| `locales/am.json` | አማርኛ |
| `locales/om.json` | Afaan Oromoo |

## Usage in React

```jsx
import { useI18n } from '../context/I18nContext';

function MyPage() {
  const { t, locale, setLocale } = useI18n();
  return <h1>{t('students.title')}</h1>;
}
```

Interpolation: `t('greeting', { name: 'Abebe' })` with `"greeting": "Hello {{name}}"` in JSON.

## Key namespaces

- `app.*` — branding, login
- `common.*` — Save, Cancel, Search, Loading…
- `nav.*` — all sidebar items (used in `navigation/menuKeys.js`)
- `dashboard`, `students`, `teachers`, `finance`, `payroll`, `settings`, `superAdmin`, `teacherPortal`
- `auth.*`, `errors.*`, `theme.*`, `language.*`

## Adding strings

1. Add the key to **en.json**, **am.json**, and **om.json**.
2. Use `t('your.key')` in components.
3. Prefer `PageHeader`, `PageCard`, and `theme/tokens.js` (`ui.card`, `ui.panel`) for consistent dark mode.

## Navigation

Menu labels come from `src/navigation/menuKeys.js` (`labelKey` per item). Layouts use `AppShell` + `t(item.labelKey)`.

## Theme

Dark/light: `ThemeProvider` in `main.jsx`. Surfaces: import `{ ui } from '../theme/tokens'`.
