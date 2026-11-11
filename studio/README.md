# Skip Studio

Standalone Sanity Studio for the Skip content model. The Next.js app lives one level up and reads this dataset through a server-only client.

```bash
npm install       # install Studio dependencies
npm run dev       # http://localhost:3333
npm run typegen   # regenerate ../sanity.types.ts
npm run seed      # import seed.json (idempotent with --replace)
npm run deploy    # deploy the Studio app to Sanity hosting
```

Content model: `course` → embedded `module` objects → `lesson` references, plus `instructor` and `category` documents. Module and lesson numbers are derived from array order, never stored.
