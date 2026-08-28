---
name: component-architecture
description: Feature-based UI architecture with Spec-Driven Development (SDD), SOLID, design patterns, readable composed returns via local mini components, presentation-only .tsx, and hooks/use*ViewModel.ts.
---

# Component Architecture

This skill is the **single source of truth** for how UI features are structured: feature-based folders, Spec-Driven Development (SDD), SOLID / design patterns, readable composed returns (local mini components), presentation/logic separation, and ViewModel hooks.

`component-standards` requires this skill whenever a component needs state, effects, handlers, derived UI data, a new feature folder, or a non-trivial UI change. Do not keep a parallel copy of these rules in other skills.

## 1. Always Use Feature-Based Component Architecture

Every UI feature lives in its **own folder** under `app/components/<feature-name>/`. Colocate that feature’s components, hooks, models, constants, store, and feature-only sub-UI there. Do **not** scatter a feature across unrelated shared folders or invent a parallel global layout.

### Required layout

```
app/components/<feature-name>/
  FeatureName.tsx                 ← entry / thin composition return
  FeatureNameInner.tsx            ← optional main body composition
  FeatureNameModals.tsx           ← optional feature modal shell
  FeatureNameHeader.tsx           ← optional local mini component (see §5)
  components/                     ← optional folder when many local minis exist
    FeatureNameToolbar.tsx
    FeatureNameEmptyState.tsx
  index.ts                        ← optional public export
  specs/                          ← Spec-Driven Development artifacts (see §2)
    SPEC.md
  tests/                          ← unit tests + Page Objects (see unit-testing-standards)
    FeatureName.page.ts
    FeatureName.test.tsx
  hooks/
    useFeatureNameViewModel.ts    ← primary ViewModel (required when there is logic)
    use*.ts                       ← other feature hooks (fetch, validate, facades)
  models/
    FeatureNameProps.interface.ts
    FeatureNameViewModel.interface.ts
  constants/                      ← feature-only constants (still follow constants-standards for shared values)
  store/                          ← feature Redux slice (see redux-store-architecture)
    featureNameSlice.ts
    FeatureNameState.interface.ts
  modals/                         ← optional feature-specific modal steps/UI
```

Use **kebab-case** folder names (`patient-form`, `schedule-form`, `modal-base`). Match existing neighbors; do not introduce a new top-level taxonomy (`containers/`, `views/`, `smart/`, etc.).

### Rules

- **One feature → one folder.** Patient UI stays under `patient-form/`; schedule UI under `schedule-form/`.
- **Colocate by default.** Feature hooks, models, and slices belong inside that folder — not in a global `hooks/` dumping ground.
- **Compose shared primitives** from `component-standards` (`Button`, `Modal`, `FormField`, …). Feature folders **consume** shared bases; they do not re-implement them.
- **Shared / cross-feature utilities** only go under `app/utils` (or true shared components) when reused by multiple features. Prefer extracting upward only after a second consumer exists.
- **Pages/routes** (`app/(site)/…`) may have thin page-level `hooks/use*PageViewModel.ts`, but the feature UI and its logic still live under `app/components/<feature-name>/`.
- **Do not** create orphan components at `app/components/SomeLooseFile.tsx` without a feature folder when the UI has logic, models, or multiple files.

### Incorrect

```
app/components/
  PatientForm.tsx
  usePatientLogic.ts          ← loose files, no feature folder
app/hooks/
  usePatientFetch.ts          ← feature logic parked globally
app/store/
  patientSlice.ts             ← feature slice not colocated (unless truly global)
```

### Correct

```
app/components/patient-form/
  PatientForm.tsx
  PatientFormInner.tsx
  specs/
    SPEC.md
  hooks/
    usePatientViewModel.ts
    useFetchPatientsData.ts
  models/
    PatientViewModel.interface.ts
  store/
    patientFormSlice.ts
    PatientFormState.interface.ts
  constants/
    PatientField.constants.ts
```

## 2. Always Prefer Spec-Driven Development (SDD)

Before implementing a new feature or a non-trivial change, **specify first**. The spec is the contract; code is derived from it and reviewed against it. Do not jump straight to coding from a vague prompt (“vibe coding”).

### When SDD is required

Use SDD for:

- New features or feature folders
- Behavior changes (flows, validation, permissions, data loading)
- New ViewModels, slices, or API/mutation wiring
- Refactors that change user-visible behavior

Lightweight exception: pure presentational tweaks with no behavior change (e.g. className-only) may skip a full spec — still follow reuse and ViewModel rules.

### Workflow (Specify → Plan → Tasks → Implement → Validate)

1. **Specify** — Write / update `specs/SPEC.md` inside the feature folder (intent, scope, requirements, edge cases, acceptance criteria). Prefer *what* and *why*; avoid locking premature implementation detail unless it is a hard constraint (e.g. must use existing `Modal` + Redux).
2. **Plan** — Derive a short technical plan from the spec + project skills (`component-standards`, `constants-standards`, `redux-store-architecture`, etc.): files to touch, reuse targets, data/store shape. Optional `specs/plan.md` for larger work.
3. **Tasks** — Break the plan into small, ordered implementation units. Optional `specs/tasks.md`.
4. **Implement** — Build task-by-task inside the feature folder (presentation `.tsx` + `use*ViewModel.ts`), following this skill and the rest of the catalog.
5. **Validate** — Check the result against the acceptance criteria in `SPEC.md` before considering the work done. If requirements change, **update the spec first**, then the code.

### Minimum `specs/SPEC.md` template

```md
# <Feature / change name>

## Intent
Who is this for and what outcome should they get?

## In scope
- …

## Out of scope
- …

## Requirements
- …

## Edge cases & errors
- …

## Constraints
- Reuse existing components / constants / store patterns: …
- Skills that apply: component-standards, constants-standards, …

## Acceptance criteria
- [ ] …
- [ ] …
```

### Agent rules

- Do not start non-trivial implementation until a spec exists (or the user explicitly provided equivalent acceptance criteria in the prompt — then persist them into `specs/SPEC.md` when creating/updating the feature).
- Implement and review **against the spec**, not against guessed requirements.
- Keep specs colocated with the feature (`app/components/<feature>/specs/`). Page-only work may use `app/(site)/<route>/specs/` when there is no feature folder yet — prefer promoting UI into a feature folder.

## 3. Always Apply SOLID and Proper Design Patterns

Every non-trivial feature must be designed with **SOLID** principles and established patterns — not ad-hoc glue. Prefer the simplest pattern that fits; do not force enterprise ceremony onto a pure presentational component.

### SOLID mapped to this codebase

| Principle | Apply as |
| --- | --- |
| **S — Single Responsibility** | One feature folder, one primary concern. `.tsx` renders; `use*ViewModel` orchestrates UI state; dedicated hooks for fetch/validate; Redux slice for shared state. Do not build god components or god ViewModels. |
| **O — Open/Closed** | Extend via props, composition, variants, and new hooks/modules — not by copy-pasting or rewriting shared bases (`Button`, `Modal`, `FormField`). Prefer opening extension points over editing unrelated features. |
| **L — Liskov Substitution** | Shared components and hooks must honor their contracts. Do not overload a primitive with incompatible behavior (e.g. a `Button` that secretly navigates and submits and fetches). Specialize in the feature layer instead. |
| **I — Interface Segregation** | Keep props and ViewModel return shapes focused. Prefer small interfaces (`Props`, `ViewModel`) over dumping every flag into one bag. Split hooks when consumers only need a subset (fetch vs validate vs modal). |
| **D — Dependency Inversion** | Depend on abstractions already used in the project: constants, typed models, mutation types, Redux selectors/actions, shared components. ViewModels should not hard-wire low-level transport details throughout JSX; call shared APIs/hooks/mutations. |

### Preferred design patterns (use when they fit)

| Pattern | When to use in MediXenter |
| --- | --- |
| **ViewModel / Presentation** | Default for any component with logic (§4) |
| **Composition** | Build screens from shared primitives + **local feature minis** (§5); avoid inheritance hierarchies and monolith returns |
| **Facade** | `use*Facade` / thin ViewModel that coordinates several feature hooks (fetch + validate + modal) |
| **Container / Inner** | `Feature.tsx` (load/gate) + `FeatureInner.tsx` (composed body of minis) when loading/auth branches clutter presentation |
| **Factory** | Config-driven UI via existing `FieldFactory` / field configs — do not invent a second factory system |
| **Adapter** | Map API/DTO shapes into view models/interfaces in hooks or utils — keep raw payloads out of JSX |
| **Observer / Store** | Shared cross-component state via Redux (`redux-store-architecture`), not prop-drilling or ad-hoc events |
| **Strategy** | Swap behaviors through props/variants/constants (button variants, table column renderers) instead of `switch`-heavy JSX |
| **Decorator** | Wrap a component/hook to add cross-cutting behavior without changing its core (providers, `PrivateRoute`, loading/error shells, permission gates). Prefer composition wrappers over inheritance; do not bury extra behavior inside the decorated feature’s ViewModel |
| **State** | Model mutually exclusive UI modes as an explicit state (union / const map / small state handlers) — e.g. `idle \| loading \| error \| ready`, wizard steps, modal phases — instead of many overlapping booleans. Transition in the ViewModel; render by state in minis |
| **Template method (light)** | Shared shells like `PageTemplate`, `AuthTemplate`, `MultiStepForm` — fill slots via children/props |

### Anti-patterns (forbidden defaults)

- God component / god ViewModel (unrelated responsibilities piled together)
- Copy-paste of an existing feature folder “with tweaks” instead of reuse + composition
- Prop drilling deep trees when feature Redux or a colocated store fits
- Premature abstraction (new pattern frameworks, HOCs, or generic “managers”) without a second real consumer
- Inheritance trees for React UI — prefer composition
- Leaking fetch/mutation/transport details into `.tsx`

### Design gate (before coding)

After the SDD spec (§2), briefly confirm in the plan (or `specs/plan.md`):

1. Which SOLID risks exist (especially SRP / DIP)?
2. Which pattern(s) apply (ViewModel, Facade, Inner split, Redux, Factory, …)?
3. Which existing components/hooks/slices will be reused?

If you cannot name the responsibilities and pattern, the design is not ready to implement.

## 4. Presentation vs Logic

| File | Role |
| --- | --- |
| `ComponentName.tsx` | **Presentation only** — JSX structure, composition, binding ViewModel outputs to UI |
| `hooks/useComponentNameViewModel.ts` | **Logic** — state, effects, handlers, derived data, API/orchestration |

`.tsx` files must not own business logic, state orchestration, derived values, effects, or non-trivial handlers.

Naming: for `File.tsx` → `hooks/useFileViewModel.ts` (component name + `ViewModel` suffix). Prefer a `.ts` extension (not `.tsx`) unless the hook must return JSX (avoid that).

Presentational components with **no** logic (props → JSX only) do not need a ViewModel — they still live inside the feature folder when they belong to that feature.

## 5. Keep Main Returns Readable — Extract Local Mini Components

The primary `.tsx` return must stay **short and scannable** — a composition outline, not a long wall of nested markup. When the return grows hard to maintain (many regions, deep nesting, repeated blocks, or mixed conditionals), **extract local mini components** inside the same feature folder.

### Goals

- Main component return reads top-to-bottom like a page outline
- Future changes touch a named mini (`FeatureNameToolbar`) instead of hunting inside a 200-line `return`
- SRP: each mini owns one UI region; the parent only wires props from the ViewModel

### Where to put minis

| Situation | Placement |
| --- | --- |
| One or two extractions regions | Colocate next to the parent: `FeatureNameHeader.tsx`, `FeatureNameModals.tsx` |
| Several feature-only pieces | `app/components/<feature>/components/*.tsx` |
| Modal steps / multi-step panels | `modals/` (existing project pattern) |
| Already a shared primitive | Reuse from `component-standards` — do **not** invent a local duplicate of `Button`, `Modal`, `Section`, etc. |

Local minis are **feature-private** presentation. Promote to shared `app/components/` only when a second feature needs the same UI (reuse rule).

### What to extract

Extract when you see:

- Distinct visual regions (header, filters, table, footer actions, empty state, modals)
- Nested ternaries / long conditional JSX in the main return
- Repeated card/row/section markup
- A return that cannot be understood in one short screenful

Do **not** extract every trivial wrapper `div`. Prefer clarity over file explosion.

### Rules

- Minis are presentation-only: receive props; no fetch/`useEffect`/business logic (that stays in `use*ViewModel`)
- Parent passes ViewModel outputs into minis — avoid re-deriving logic inside the mini
- Name minis by **UI region / role** (`PatientFormToolbar`, `ScheduleFormEmptyState`), not vague names (`Part1`, `Helper`)
- Arrow-function components per `code-style-standards`

### Incorrect — unmaintainable monolith return

```tsx
const PatientFormInner = ({ ... }: Props) => {
  const vm = usePatientFormViewModel(...);

  return (
    <Section>
      <div className="...">
        {/* 40 lines of header / title / actions */}
      </div>
      <div className="...">
        {/* 60 lines of filters + search */}
      </div>
      <div className="...">
        {/* 80 lines of table + row actions */}
      </div>
      {vm.isModalOpen && (
        <div>{/* 50 lines of modal fields */}</div>
      )}
    </Section>
  );
};
```

### Correct — thin composed return

```tsx
// PatientFormInner.tsx
const PatientFormInner = ({ ... }: Props) => {
  const {
    title,
    toolbar,
    table,
    emptyState,
    modals,
  } = usePatientFormViewModel(...);

  return (
    <Section>
      <PatientFormHeader title={title} />
      <PatientFormToolbar {...toolbar} />
      {table.rows.length === 0 ? (
        <PatientFormEmptyState {...emptyState} />
      ) : (
        <PatientFormTable {...table} />
      )}
      <PatientFormModals {...modals} />
    </Section>
  );
};
```

```tsx
// PatientFormToolbar.tsx — local mini, presentation only
const PatientFormToolbar = ({
  search,
  onSearchChange,
  onAdd,
}: PatientFormToolbarProps) => (
  // small, focused JSX using shared Button / SearchField / etc.
);
```

Entry files like `FeatureName.tsx` should stay especially thin (load/spinner gate → `FeatureNameInner`), matching existing `PatientForm` / `ScheduleForm` patterns.

## 6. What Belongs in the ViewModel (`.ts`)

- `useState` / Redux selectors / store wiring (see also `redux-store-architecture`)
- `useEffect` and data fetching
- Event handlers and submit / delete / confirm flows
- Derived flags, labels, classNames, and view-state unions
- Validation and mapping of props → UI model

Prefer returning a typed view-model object/interface when the surface area grows (e.g. `models/ComponentNameViewModel.interface.ts`).

## 7. What May Stay in the `.tsx`

- Short composed JSX outlines and local mini imports (see §5)
- JSX markup built from shared components (see `component-standards` reuse catalog)
- Passing ViewModel outputs into child / mini props
- Trivial render branches already decided by the ViewModel (e.g. `viewContent === STRING.SPINNER ? <Spinner /> : …`)

Long nested markup does **not** “stay” in the main file — extract minis per §5.

## 8. Incorrect vs Correct (ViewModel)

**Incorrect** — logic embedded in the TSX file:

```tsx
// PatientForm.tsx
const PatientForm = ({ patients_section }: Props) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients().then((response) => {
      setPatients(response);
      setIsLoading(false);
    });
  }, []);

  const handleDelete = async (patientId: string) => {
    await deletePatient(patientId);
    setPatients((current) =>
      current.filter((patient) => patient.id !== patientId)
    );
  };

  if (isLoading) return <Spinner />;
  return <PatientList patients={patients} onDelete={handleDelete} />;
};
```

**Correct** — presentation + ViewModel inside the feature folder:

```tsx
// patient-form/PatientForm.tsx — presentation only
import { usePatientFormViewModel } from "./hooks/usePatientFormViewModel";

const PatientForm = ({ patients_section }: Props) => {
  const { isLoading, patients, handleDelete } =
    usePatientFormViewModel({ patients_section });

  if (isLoading) return <Spinner />;
  return <PatientList patients={patients} onDelete={handleDelete} />;
};
```

```ts
// patient-form/hooks/usePatientFormViewModel.ts — all logic
export const usePatientFormViewModel = ({
  patients_section,
}: Props) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients().then((response) => {
      setPatients(response);
      setIsLoading(false);
    });
  }, []);

  const handleDelete = async (patientId: string) => {
    await deletePatient(patientId);
    setPatients((current) =>
      current.filter((patient) => patient.id !== patientId)
    );
  };

  return { isLoading, patients, handleDelete };
};
```

## 9. Checklist

- [ ] Non-trivial work has `specs/SPEC.md` (or equivalent acceptance criteria persisted) and was validated against it
- [ ] Design applies SOLID and an intentional pattern (ViewModel, composition, facade, Redux, …) — no god components / anti-patterns
- [ ] Feature lives under `app/components/<kebab-feature>/` with colocated `hooks/`, `models/`, `specs/`, and `store/` / `constants/` as needed
- [ ] Main `.tsx` return is a short composition of local minis / shared primitives — not a long monolith JSX block
- [ ] No feature logic scattered into global dumps or orphan `.tsx` files
- [ ] No `useState` / `useEffect` / fetch / non-trivial handlers left in the `.tsx`
- [ ] Logic lives in `hooks/use<Name>ViewModel.ts`
- [ ] Hook is arrow-function style per `code-style-standards`
- [ ] Shared UI still reuses bases from `component-standards` (no parallel primitives)
- [ ] Shared feature state uses Redux per `redux-store-architecture` when applicable
- [ ] Non-trivial behavior covered by tests per `unit-testing-standards` (POM for UI)
