# MoneyTear

Expo / React Native app. Run it with `npm install` then `npx expo start`.
Checks: `npm run verify` (typecheck + lint).

## Project structure

Rule: **everything about one business area lives in one module folder.** Code used by
two or more modules goes in a shared folder. Route files stay one line.

```
src/
├── app/                      # Expo Router routes ONLY: each file renders one module page
│   ├── _layout.tsx           # providers + auth guard
│   ├── index.tsx             # entry: redirects to login / set-pin / pin
│   ├── (auth)/login.tsx      # → <LoginPage />
│   └── (tabs)/               # index → <HomePage />, category, history, profile
│
├── modules/                  # one folder per business area
│   ├── auth/
│   │   ├── pages/            # full screens: own state, call hooks, lay out ui
│   │   ├── ui/               # parts only auth uses (PinInput, DatePickerSheet, layout)
│   │   ├── hooks/            # one React Query hook per endpoint + keys.ts
│   │   ├── schema/           # zod form schemas
│   │   ├── store/            # session provider
│   │   └── types/            # API data types
│   ├── security/             # PIN endpoints: hooks/, types/
│   ├── users/                # profile endpoints: hooks/, types/
│   ├── home/pages/           # Home tab
│   ├── category/pages/       # Category tab
│   ├── history/pages/        # History tab
│   └── profile/pages/        # Profile tab
│
├── components/               # shared app widgets (header, bottom nav, logo, icons)
├── lib/                      # infrastructure: http-client, errors, session, storage, query-client
├── providers/                # QueryProvider
└── constants/theme.ts        # colours, fonts
```

| Folder | Holds | Must not |
|---|---|---|
| `app/**` | the route; renders one module page | hold state, fetch data or layout |
| `modules/X/pages` | a whole screen | be imported by another module |
| `modules/X/ui` | presentational parts, data via props | call APIs |
| `modules/X/hooks` | `useQuery` / `useMutation`, keys in `keys.ts` | render anything |
| `modules/X/schema`, `types` | zod schemas, API types | have side effects |
| `components/`, `lib/` | code used by 2+ modules | hold one module's screens |

## Adding a feature (e.g. `transactions`)

1. `src/modules/transactions/types/index.ts`: API data types.
2. `src/modules/transactions/hooks/keys.ts` + one hook per endpoint (`useGetTransactions.ts`), using `api` from `@/lib/http-client`.
3. `src/modules/transactions/ui/`: parts only this module shows.
4. `src/modules/transactions/pages/transactions-page.tsx`: the screen.
5. `src/app/(tabs)/transactions.tsx`: one line, `return <TransactionsPage />`.
6. If a second module needs a `ui` part, move it to `src/components/`.

Text: import `Text` / `TextInput` from `@/components/text` and set only `fontWeight` (Poppins is applied there).

Naming: files kebab-case (`login-page.tsx`, `pin-input.tsx`), hooks `useGetX` / `useVerbX`.
