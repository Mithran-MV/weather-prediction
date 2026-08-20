# Contributing

Thanks for taking the time to contribute.

## Getting set up

```bash
npm install
cp .env.example .env.local   # add a free WeatherAPI key
npm run dev
```

## Before opening a pull request

Run the same checks CI runs:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Conventions

- **TypeScript strict.** `any` needs a comment explaining why nothing better fits.
- **Validate at the boundary.** Anything crossing the network is parsed through a Zod schema
  in `src/lib/schemas.ts` before a component sees it.
- **Secrets stay server-side.** A variable prefixed `NEXT_PUBLIC_` is compiled into the browser
  bundle — never put a credential behind that prefix.
- **Comments explain *why*.** The what is already in the code.
- **Accessibility is not optional.** Interactive components need keyboard support and the right
  ARIA roles. New animation respects `prefers-reduced-motion`.
- **Tests for logic.** Pure functions in `lib/` and `hooks/` should come with Vitest coverage.

## Commit messages

Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`) — it keeps the
history skimmable.

## Reporting security issues

Open an issue describing the problem, but **never paste a working API key** into it.
