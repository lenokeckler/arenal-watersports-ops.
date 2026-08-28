---
name: component-standards
description: Standards for UI components and Storybook — reuse existing app/components bases; defers ViewModel / no-logic-in-tsx rules to component-architecture; stories and Nullable types.
---

# Front-End Component and Storybook Standards

When building or working with UI components and stories in this codebase, adhere strictly to the following rules based on the project's established conventions.

Hard-coded string literals and magic numbers must use `@/app/constants` — follow `constants-standards` (also required by `code-style-standards`).

## 1. Reuse Existing Components First (Mandatory)

**Never invent a parallel base component** when one already exists under `app/components/`. Before creating any new UI folder or raw HTML control:

1. Search `app/components/` and `@/app/components` (`app/components/index.ts`) for an existing primitive or wrapper that covers the need.
2. Prefer **compose / configure** (props, `className`, variants, children) over cloning.
3. Prefer **extend** a thin feature wrapper that imports the shared base (e.g. a confirm dialog built on `Modal` / `ConfirmModal`) over a new from-scratch control.
4. Create a **new** component only when no existing base fits after an honest search — and still build it **on top of** shared primitives (`Button`, `Modal`, `FormField`, `Section`, etc.), not native HTML duplicates.

If you are about to write `<button>`, `<img>`, `<section>`, `<h1>`–`<h6>`, `<input>`, `<select>`, `<textarea>`, a custom spinner, a custom modal shell, or a one-off table — **stop** and use the catalog below.

### Decision checklist

| Need | Do this | Do not do this |
| --- | --- | --- |
| Click action | `Button` | Native `<button>` or a new `PrimaryButton` clone |
| Delete icon action | `DeleteButton` / icon + `Button` | New delete button component with the same behavior |
| Image / logo / icon | `Image` / `Logo` / `Icon` | Raw `<img>` or ad-hoc `next/image` wrappers |
| Page / section layout | `PageTemplate` / `Section` / `AuthTemplate` | New layout shell that duplicates chrome |
| Heading / body text | `Title` / `SectionTitle` / `Text` / `Label` / `InlineText` | Raw heading/paragraph tags for product UI |
| Form control | `FormField` / `FieldFactory` / `CustomSelect` / `SearchField` / `ToggleField` / `UploadFile` | New input wrappers or native fields |
| Loading | `Spinner` | CSS-only spinner markup |
| Dialog / confirm | `Modal` / `ConfirmModal` | New modal shell or `window.confirm` UI |
| Table / pager | `Table` / `InfoViewerTable` / `Pagination` | One-off HTML tables with the same patterns |
| Tabs / steps | `Tabs` / `StepperNav` / `MultiStepForm` / `StepCarousel` | Custom tab/step bars |
| Toast / badge | `ToastContainer` (+ toast store) / `Badge` | Ad-hoc alert chips |
| Card / summary | `SectionCard` / `SummaryCard` | New generic `Card` with the same structure |

### Reusable catalog (prefer these)

Import from `@/app/components` when exported from the barrel; otherwise deep-import the path shown.

#### Layout

| Component | Import | Use for |
| --- | --- | --- |
| `Section` | `@/app/components` | Page section blocks (never raw `<section>`) |
| `PageTemplate` | `@/app/components` | Standard page title / subtitle / actions / content |
| `AuthTemplate` | `@/app/components` | Auth split layouts |
| `DocumentTemplate` | `@/app/components` | Legal / document pages |
| `Overlay` | `@/app/components` | Dimmed full-screen backdrop |
| `HorizontalLine` / `DecorativeLine` | `@/app/components` | Decorative rules |
| `HeaderWithLines` | `@/app/components/header-with-lines/HeaderWithLines` | Title with flanking lines |

#### Typography & lists

| Component | Import | Use for |
| --- | --- | --- |
| `Title` | `@/app/components` | Design-system headings |
| `SectionTitle` | `@/app/components` | Section headings |
| `Text` / `Label` / `InlineText` | `@/app/components` | Body text, labels, inline spans |
| `UnorderedList` / `OrderedList` | `@/app/components` | Styled lists |

#### Actions & navigation chrome

| Component | Import | Use for |
| --- | --- | --- |
| `Button` | `@/app/components` | All buttons |
| `DeleteButton` | `@/app/components/delete-button/DeleteButton` | Icon delete actions |
| `Link` | `@/app/components` | In-app / styled links |
| `Toggle` | `@/app/components` | On/off switch |
| `FloatingButton` | `@/app/components` | Floating WhatsApp CTA |
| `Tabs` | `@/app/components/tabs` | Segmented tabs |
| `StepperNav` | `@/app/components` | Step progress |
| `NavMenu` / `SideMenu` / `Footer` | `@/app/components` | Site / app chrome (do not rebuild) |

#### Forms & inputs

| Component | Import | Use for |
| --- | --- | --- |
| `FormField` | `@/app/components` | Labeled input / select / textarea / checkbox |
| `FieldFactory` | `@/app/components` | Config-driven field rendering |
| `CustomSelect` | `@/app/components` | Searchable / multi select |
| `SearchField` | `@/app/components` | Search UIs |
| `ToggleField` | `@/app/components` | Labeled toggle + copy |
| `UploadFile` | `@/app/components` | File upload |
| `DynamicArrayInput` | `@/app/components` | Add/remove string lists |
| `DayPills` | `@/app/components/day-pills/DayPills` | Weekday pickers |
| `MultiStepForm` | `@/app/components` | Wizard shells |
| `PasswordRequirements` | `@/app/components/password-requirements/PasswordRequirements` | Password rule checklist |
| `ReCaptcha` / `TermsAcceptance` | `@/app/components` | Captcha / terms gates |

#### Feedback & overlays

| Component | Import | Use for |
| --- | --- | --- |
| `Spinner` | `@/app/components` | Loading (`fullScreen` when needed) |
| `Badge` | `@/app/components` | Status chips |
| `ToastContainer` | `@/app/components` | Global toasts (store-driven) |
| `Modal` | `@/app/components` | Dialog shell |
| `ConfirmModal` | `@/app/components/confirm-modal/ConfirmModal` | Confirm / cancel flows |

#### Media & icons

| Component | Import | Use for |
| --- | --- | --- |
| `Image` | `@/app/components` | Images (never raw `<img>`) |
| `Logo` / `Icon` / `DeepLinkImage` | `@/app/components` | Brand, icons, linked images |
| `Line` / `SliderIcon` / `SliderFigure` | `@/app/components` | Decorative / carousel media |
| `DeleteIcon` / `EditIcon` | under `@/app/components/icons/…` | Standard action icons |

#### Data display

| Component | Import | Use for |
| --- | --- | --- |
| `Table` | `@/app/components` | CRUD-style data tables |
| `InfoViewerTable` | `@/app/components` | Key/value detail tables |
| `Pagination` | `@/app/components` | Pagers |
| `SectionCard` | `@/app/components/section-card` | Generic card shell |
| `SummaryCard` | `@/app/components` | Label/value summary cards |
| `Accordion` | `@/app/components/accordion/Accordion` | Expand/collapse panels |
| `AppointmentCard` / `ScheduleRuleCard` | deep / barrel | Domain cards — reuse before inventing similar cards |

Feature forms (`PatientForm`, `DoctorForm`, …) are product features, not primitives. Still compose them from the primitives above; do not fork a second form system.

### Incorrect vs correct

**Incorrect** — new parallel base / native HTML:

```tsx
<button className="bg-blue-500 text-white p-2" onClick={handleAction}>
  Click Me
</button>

<section className="py-16">
  <h2>My Feature Title</h2>
  <div className="animate-spin border-4 ..." />
  <img src="/image.png" alt="Feature" />
</section>
```

**Correct** — reuse shared bases:

```tsx
import {
  Button,
  Image,
  Section,
  SectionTitle,
  Spinner,
} from "@/app/components";
import { BUTTON } from "@/app/constants";

<Section className="py-16 bg-gray-50">
  <SectionTitle text="My Feature Title" />
  {loading && <Spinner />}
  <div className="relative w-full h-64">
    <Image
      src="/image.png"
      alt="Feature"
      fill
      className="object-cover"
    />
  </div>
  <Button variant={BUTTON.BASE} onClick={handleAction}>
    Click Me
  </Button>
</Section>;
```

## 2. Presentation vs Logic → `component-architecture`

Do **not** keep separate rules here for ViewModels. Whenever a `.tsx` component would include state, effects, handlers, fetching, or derived UI logic — **open and follow** `.agents/skills/component-architecture/SKILL.md` in full.

That skill is the single source of truth for:

- Feature-based folders under `app/components/<feature-name>/`
- Spec-Driven Development (`specs/SPEC.md` before non-trivial implementation)
- SOLID principles and intentional design patterns
- Local mini components so main `.tsx` returns stay short and readable
- Keeping `.tsx` presentation-only
- Colocating logic in `hooks/use<Name>ViewModel.ts` (e.g. `File.tsx` → `useFileViewModel.ts`)
- What belongs in the hook vs the component

**Required agent step:** load `component-architecture` before adding logic to a component. If the two skills ever seem to disagree, `component-architecture` wins for presentation/logic separation.

Presentational components with props → JSX only may skip a ViewModel (see that skill).

## 3. New Components Must Have Storybook Stories

Every new UI component must be accompanied by a Storybook story file (`ComponentName.stories.tsx`) in the same directory. Stories must cover the component's key states and variants so the component can be developed, reviewed, and tested in isolation.

Only add a **new** component after §1 — and document why existing bases were insufficient if the work introduces another primitive-like wrapper.

- Place the story file alongside the component: `ComponentName/ComponentName.stories.tsx`.
- Use `STORYBOOK_LAYOUT` constants instead of raw layout strings (see `constants-standards`).
- Export a `Default` story at minimum; add named stories for each meaningful variant or state (e.g., `Loading`, `Empty`, `WithError`).
- Pass only realistic props — no inline placeholder strings. Import string mocks from `@/app/constants/storybook/storybookMocks.json` instead (see below).

**Incorrect:**

```tsx
// MyCard/MyCard.stories.tsx
export default {
  title: "MyCard",
  layout: "centered",
};

export const Default = () => (
  <MyCard
    title="Some title"
    description="Some description"
  />
);
```

**Correct:**

```tsx
// MyCard/MyCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { STORYBOOK_LAYOUT } from "@/app/constants";
import mocks from "@/app/constants/storybook/storybookMocks.json";
import MyCard from "./MyCard";

const meta: Meta<typeof MyCard> = {
  title: "Components/MyCard",
  component: MyCard,
  parameters: { layout: STORYBOOK_LAYOUT.CENTERED },
};
export default meta;

type Story = StoryObj<typeof MyCard>;

export const Default: Story = {
  args: {
    title: mocks.featuredSection.items[0].title,
    description: mocks.featuredSection.items[0].description,
  },
};
export const Loading: Story = {
  args: {
    title: mocks.featuredSection.items[0].title,
    isLoading: true,
  },
};
```

### Adding new mocks

If no existing entry in `storybookMocks.json` fits your component, add a new top-level key for it rather than inlining strings in the story file. Keep mock values realistic (no `"foo"` / `"test"` / `"string"`).

## 4. Use Nullable Utility Types

Never use union types with `null` or `undefined` directly (e.g., `PatientData | null` or `string | undefined`). Instead, use the centralized semantic utility types from `@/app/types/Nullable` (or export through `@/app/types`) to ensure consistency and readability in type definitions.

- **`Nullable<T>`**: Resolves to `T | null | undefined`.
- **`NullableRef<T>`**: Resolves to `T | null`.
- **`NullableUndefined<T>`**: Resolves to `T | undefined`.

**Incorrect:**

```tsx
export interface PatientSession {
  patient: PatientData | null;
  id: string | undefined;
}
```

**Correct:**

```tsx
import { Nullable } from "@/app/types";

export interface PatientSession {
  patient: Nullable<PatientData>;
  id: NullableUndefined<string>;
}
```
