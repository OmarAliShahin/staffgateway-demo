# React + Vite Engineering Guidelines

> Audience: AI coding agents and developers working in a React + Vite + TypeScript app.
> These rules are **mandatory** unless the project's `CLAUDE.md` explicitly overrides one.
> When a rule and existing code disagree, follow the rule for new code and do not
> "match" the older pattern. Don't refactor unrelated old code unless asked.

Assumed stack: React 18+, Vite, TypeScript (strict), TanStack Query v5, axios,
React Router, Tailwind CSS, react-hook-form + zod, react-i18next, zustand (only
for global client state). If a project uses something else, keep the principles
and adapt the APIs.

---

## 1. Core principles

1. **Single responsibility.** A component either *renders* or *orchestrates*, not
   both at length. A hook does one job. A function does one thing and its name says what.
2. **Small files.** Size limits are in §2. When you hit one, split the file. Don't
   squeeze code in to stay under it.
3. **Server state lives in React Query.** Never copy query data into `useState`,
   context, or a store.
4. **Data flows one way through the layers:** `api client → service → query keys → query hook → component`.
   A component never calls axios, never builds a query key, never unwraps `response.data.data`.
5. **No logic hidden in JSX.** Derive values above the `return`. JSX only maps, conditionally renders, and wires handlers.
6. **Reuse before you create.** Search `components/ui`, `components/shared`, and
   `hooks/` before writing a new primitive.

---

## 2. File size limits

| File kind | Target | Soft max | Hard max |
|---|---|---|---|
| Component (`.tsx`) | ≤ 150 lines | 200 | 250. Up to **350** only for a truly complex component, and only with a top-of-file comment explaining why it can't be split |
| Hook | ≤ 80 | 120 | 150 |
| Service / utils / mappers | ≤ 150 | 200 | 250 |
| Page | ≤ 100 | 150 | 150. Pages compose sections and do nothing else |

Line counts include imports and blank lines.

**When a file passes its target, split it in this order:**
1. Move **effects, subscriptions, and stateful logic** into a custom hook (`useXxx`).
2. Move **pure computations** (formatting, mapping, filtering, sorting) into `utils/` as plain functions. These are easy to unit test.
3. Move **visual blocks with a clear name** into child components. A JSX region you'd label with a `{/* Header */}` comment is a component waiting to be extracted.
4. Move **constants and config objects** (column defs, option lists, variant maps) into a `*.config.ts` / `constants.ts` file next to the component.

---

## 3. Project structure (feature-based)

```
src/
  app/                    # App.tsx, providers, router, queryClient
  api/
    client.ts             # the single axios instance + interceptors
    apiError.ts           # normalizeApiError(), getApiErrorMessage()
  components/
    ui/                   # design-system primitives: Button, Input, Modal, Typography…
    shared/               # cross-feature composites: PageHeader, EmptyState, Skeletons…
  hooks/                  # generic, feature-agnostic hooks: useMediaQuery, useDebounce…
  lib/                    # generic helpers: cn(), formatters
  i18n/
  features/
    <feature>/            # e.g. news, employees, shifts
      api/
        <feature>Keys.ts      # query-key factory (§5.2)
        <feature>Endpoints.ts # URL constants
      services/
        <feature>Service.ts   # axios calls + DTO → domain mapping
      hooks/
        use<Thing>.ts         # one query/mutation/UI hook per file
      components/
        <Feature>Section.tsx
        <Feature>Card.tsx
      pages/
        <Feature>Page.tsx
      types/
        <feature>.types.ts    # DTO (API) types and domain types
      utils/
        <feature>Mappers.ts
```

Rules:
- Code used by **one feature** stays inside that feature. Promote it to `components/shared`
  or `hooks/` only when a **second** feature needs it.
- Features don't import from each other's internals. If two features need the same thing, promote it.
- Use the `@/` alias for anything outside the current feature. Relative imports are fine inside a feature.

---

## 4. Components

### 4.1 Anatomy (always in this order)

```tsx
// 1. imports: external libs, then @/ aliases, then relative
// 2. types: `interface XxxProps`
// 3. module-level constants (stable references, never recreated per render)

export function XxxCard({ item, onSelect }: XxxCardProps) {
  // 4. hooks: router, i18n, queries, local state, custom hooks
  // 5. derived values (plain consts; useMemo only if measurably expensive)
  // 6. event handlers: handleXxx
  // 7. early returns: loading → error → empty
  // 8. JSX
}
```

### 4.2 Rules

- **One exported component per file.** File name = component name (PascalCase).
- **Named exports** for components, hooks, and functions (`export function Foo`). Default
  export only where a tool requires it (e.g. lazy route modules).
- Props interface is named `<Component>Props`. Pass **domain objects or ids**, not 6 spread fields, unless the child is a generic UI primitive.
- Handlers are named `handleXxx` inside the component and passed as `onXxx` props.
- **Every data-driven component handles 3 states:** loading (skeleton), error, empty. Use the shared Skeleton / ErrorState / EmptyState components.
- **No inline arrow soup.** If a JSX handler is longer than one short expression, make it a named handler.
- **Conditional classes go through `cn()`** (clsx + tailwind-merge). No template-string ternaries.
- **No hardcoded user-facing strings.** Everything goes through `t("feature.key")`.
- **RTL:** use logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`)
  and the `rtl:` variant (`rtl:rotate-180`). Don't compute `isRTL` just to flip an icon.
  When you do need the direction (e.g. for a carousel lib), read it reactively: `const { i18n } = useTranslation(); i18n.dir()`.
  Never read `i18n.language` from the imported singleton, because it won't re-render on change.
- **Design tokens only.** Use theme color/spacing tokens (`text-heading`, `bg-surface-action`), not raw hex or arbitrary values.
- **No `useEffect` in a component body** except trivial one-liners. Any effect that subscribes, listens, measures, or syncs goes in a named custom hook **with cleanup**.

### 4.3 Pages

A page:
- reads route params / search params,
- composes feature sections,
- handles page-level layout and permissions.

It doesn't fetch, map, or hold business logic. Filters and pagination that should
survive refresh or sharing live in **URL search params**, not `useState`.

---

## 5. Data layer (TanStack Query)

### 5.1 The layers

| Layer | File | Responsibility | Must NOT |
|---|---|---|---|
| API client | `src/api/client.ts` | axios instance, auth headers, token refresh, error normalization | know about features |
| Service | `features/x/services/xService.ts` | one async function per endpoint; returns **domain types**; maps DTO → domain | use React, hooks, toasts |
| Keys | `features/x/api/xKeys.ts` | the only place query keys are built | contain logic |
| Query hook | `features/x/hooks/useX.ts` | wraps `useQuery`/`useMutation`; returns a stable, domain-named shape | toast, navigate, close modals |
| Component | anywhere | consumes the hook; owns UI reactions (toast, close, navigate) | call services or build keys |

### 5.2 Query-key factory (required)

Never write a key as an inline array at a call site. Every key comes from the factory,
so invalidations and queries are connected at compile time.

```ts
// features/news/api/newsKeys.ts
import type { NewsListParams } from "../types/news.types";

export const newsKeys = {
  all: ["news"] as const,                                   // invalidate everything in the feature
  lists: () => [...newsKeys.all, "list"] as const,           // invalidate every list variant
  list: (params: NewsListParams) => [...newsKeys.lists(), params] as const,
  detail: (id: number | null) => [...newsKeys.all, "detail", id] as const,
};
```

- Keys are hierarchical. Invalidation matches by **prefix**, so `all` → `lists()` → `list(params)`.
- Every input the `queryFn` uses **must** be in the key (filters, page, ids, scope/tenant id).

### 5.3 Service

```ts
// features/news/services/newsService.ts
import { apiClient } from "@/api/client";
import { NEWS_ENDPOINTS } from "../api/newsEndpoints";
import { mapNewsDto } from "../utils/newsMappers";
import type { NewsItem, NewsListParams, NewsListResponseDto, CreateNewsPayload } from "../types/news.types";

export async function getNews(params: NewsListParams): Promise<NewsItem[]> {
  const { data } = await apiClient.get<NewsListResponseDto>(NEWS_ENDPOINTS.list, { params });
  return data.data.map(mapNewsDto);
}

export async function createNews(payload: CreateNewsPayload): Promise<NewsItem> {
  const { data } = await apiClient.post(NEWS_ENDPOINTS.list, payload);
  return mapNewsDto(data.data);
}
```

- Plain named functions, not objects of functions, not default exports.
- Envelope unwrapping (`data.data`) and field renaming happen **here**, once.
- Keep DTO types (API shape) and domain types (what the UI uses) separate.

### 5.4 Query hook

```ts
// features/news/hooks/useNews.ts
import { useQuery } from "@tanstack/react-query";
import { newsKeys } from "../api/newsKeys";
import { getNews } from "../services/newsService";
import type { NewsItem, NewsListParams } from "../types/news.types";

const EMPTY: NewsItem[] = []; // stable reference, so no re-render churn

export function useNews(params: NewsListParams = {}, options: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: newsKeys.list(params),
    queryFn: () => getNews(params),
    enabled: options.enabled ?? true,
  });

  return {
    news: query.data ?? EMPTY,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
```

Detail query with a nullable id: use `skipToken` instead of `enabled` + non-null assertion:

```ts
export function useNewsDetail(id: number | null) {
  const query = useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: id === null ? skipToken : () => getNewsById(id),
  });
  return { newsItem: query.data ?? null, isLoading: query.isLoading, error: query.error };
}
```

Rules:
- **One hook per file**, named `use<Noun>` for queries and `use<Verb><Noun>` for mutations (`useCreateNews`, `useDeleteNews`).
- **Return a domain-named object** (`news`, `newsItem`), not raw `data`. Default lists to a module-level `EMPTY` constant.
- Use `select` only for cheap, view-specific derivations. Do the main mapping in the service.
- Paginated lists: `placeholderData: keepPreviousData`.
- Need to prefetch, or share options between `useQuery` and `queryClient.ensureQueryData`?
  Export a `newsListOptions(params)` built with `queryOptions()` and use it in both.
- No `console.log` in hooks or services.

### 5.5 Mutation hook

```ts
// features/news/hooks/useCreateNews.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newsKeys } from "../api/newsKeys";
import { createNews } from "../services/newsService";

export function useCreateNews() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createNews,
    // returning the promise keeps isPending true until the refetch finishes
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.lists() }),
  });

  return {
    createNews: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
```

Using it in a component, where the UI reactions live:

```tsx
const { createNews, isPending } = useCreateNews();

const handleSubmit = (values: NewsFormValues) =>
  createNews(toCreateNewsPayload(values), {
    onSuccess: () => {
      toast.success(t("news.created"));
      onClose();
    },
  });
```

Rules:
- The mutation hook does **cache work only** (invalidate / setQueryData / optimistic update).
- Toasts, closing modals, navigation, and form resets belong to the **component**, via per-call `onSuccess`.
- **Errors are toasted globally** by the `MutationCache` (§5.6). Only handle errors locally
  when the UI needs something special (e.g. map server errors onto form fields). Then set
  `meta: { skipGlobalErrorToast: true }` on that mutation.
- Expose `mutate` by default. Expose `mutateAsync` only when the caller must `await` a sequence.
- Invalidate the **narrowest prefix** that covers what changed (`lists()` after create, `all` after delete).

### 5.6 QueryClient setup (once per app)

```ts
// src/app/queryClient.ts
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/apiError";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.skipGlobalErrorToast) return;
      toast.error(getApiErrorMessage(error));
    },
  }),
});
```

Declare the `meta` type once via module augmentation (`Register` interface) so `meta` is typed.

---

## 6. Custom hooks (non-query)

- One concern per hook: `useMediaQuery`, `useCarousel`, `useDebounce`, `useNewsFilters`.
- Generic hooks (no feature knowledge) go in `src/hooks/`. Feature-specific ones go in `features/x/hooks/`.
- Every subscription / listener / timer **must clean up** in the effect's return.
- Return an object with named fields (or a tuple only for `useState`-like pairs).
- A form hook (`useNewsForm`) owns the zod schema, default values, and the
  `formValues → payload` mapper. Export the schema and mapper as plain functions so they can be unit tested.

---

## 7. State: where does it go?

| Kind of state | Where |
|---|---|
| Data from the server | React Query, **only** |
| Filters, search, pagination, active tab (shareable) | URL search params |
| Form state | react-hook-form |
| Local UI (open/closed, hovered, selected id) | `useState` in the nearest common parent |
| Global client state (theme, auth session, sidebar) | zustand store (small, sliced) |

Don't derive state with `useEffect` + `setState`. Compute it during render.

---

## 8. Forms

- react-hook-form + zod (`zodResolver`). The schema lives in the form hook or a `*.schema.ts`.
- Validation messages are i18n keys.
- The shared `Input` / `TextArea` / `Select` components own the error border **and** the
  error message. Pass `error={errors.field?.message}`. Don't render a separate `<ErrorMsg>` next to them.
- Submit buttons show `isPending` and are disabled while pending.
- Map form values → API payload in a pure function (`toCreateXPayload`), never inline in `onSubmit`.

---

## 9. TypeScript

- `strict: true`. No `any`. Use `unknown` and narrow it. No non-null `!` assertions where a guard or `skipToken` works.
- Use `import type` for type-only imports.
- Union string literals over enums.
- Don't annotate what TS infers. Do annotate exported function return types for services.

---

## 10. Worked example: applying these rules to a carousel section

**Before** (147 lines, one file). It works, but it mixes 5 responsibilities:
fetching, window-resize tracking, carousel-library wiring, pagination UI, and modal selection.
It also has hidden bugs: the embla `select` listener is never removed, and
`i18n.language` is read from the imported singleton so it doesn't react to language changes.

**After:**

```
src/hooks/useMediaQuery.ts                       # generic: matchMedia + cleanup (~20 lines)
src/components/shared/carousel/useCarousel.ts    # embla wiring: ref, selectedIndex, pageCount, prev/next, cleanup (~45 lines)
src/components/shared/carousel/CarouselControls.tsx  # prev/next buttons + dots, rtl:rotate-180 (~50 lines)
features/news/hooks/useNews.ts                   # query hook (§5.4)
features/news/components/NewsSection.tsx         # orchestrates (~60 lines)
```

```tsx
// features/news/components/NewsSection.tsx
export function NewsSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { news, isLoading } = useNews();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const isLarge = useMediaQuery("(min-width: 1024px)");
  const carousel = useCarousel({
    slidesToScroll: isLarge ? 3 : 2,
    direction: i18n.dir(),
    itemCount: news.length,
  });

  const selectedNews = news.find((n) => n.id === selectedId) ?? null;

  if (isLoading) return <SectionSkeleton variant="news" items={3} />;
  if (news.length === 0) return null;

  return (
    <section className="space-y-4 py-2">
      <SectionHeader title={t("home.newsTitle")} actionLabel={t("home.viewAll")} onAction={() => navigate("/news")} />
      <div ref={carousel.ref} className="overflow-hidden p-2">
        <div className="flex gap-4">
          {news.map((item) => (
            <NewsCarouselCard key={item.id} news={item} onReadMore={setSelectedId} />
          ))}
        </div>
      </div>
      <CarouselControls {...carousel.controls} />
      <NewsModal news={selectedNews} onClose={() => setSelectedId(null)} />
    </section>
  );
}
```

What changed and why:
- Resize logic → `useMediaQuery` (generic, reusable, cleans up).
- Embla setup + listeners → `useCarousel` (one job, cleans up, reusable by any carousel).
- Prev/next/dots JSX → `CarouselControls` (a named visual block).
- `isRTL` icon flipping → `rtl:rotate-180` inside `CarouselControls`.
- Card receives the domain object (`news={item}`), not four spread props.
- `NewsModal` gets `news | null` and handles its own open state, so no duplicated `selectedId !== null &&` check.

---

## 11. Before you finish: self-check

Before reporting a task done, check each of these:

- [ ] Every file you touched is within its size target (§2), or has a justification comment.
- [ ] No component contains a non-trivial `useEffect`. Each one is in a named hook with cleanup.
- [ ] No component imports axios or a service directly, or builds a query key.
- [ ] Every query key comes from the feature's key factory, and includes every queryFn input.
- [ ] Mutation hooks contain no toast / navigate / close logic.
- [ ] Loading, error, and empty states are handled.
- [ ] No hardcoded user-facing strings. RTL uses logical utilities.
- [ ] No `any`, no `console.log`, no unused imports.
- [ ] You reused existing `ui/` and `shared/` components instead of creating near-duplicates.
- [ ] `tsc` and `eslint` pass.

---

## 12. Corrections log

Rules added after an agent got something wrong. Each entry: what went wrong → the rule.
These take precedence over anything above that they contradict.

<!-- - YYYY-MM-DD: <what the agent did> → <the rule> -->
