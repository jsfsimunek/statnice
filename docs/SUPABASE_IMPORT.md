# Supabase import

## 1. Build one import file

```bash
npm run build:content-import
```

This creates `content-import.generated.json` from `public/data/okruh1.json` through `public/data/okruh19.json`.

The script intentionally ignores files such as `okruh1B_converted.json`, because they do not match the primary topic naming pattern and may duplicate content.

## 2. Configure environment

Create `.env` from `.env.example` and fill:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CONTENT_IMPORT_FILE=content-import.generated.json
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or in Vercel public variables.

## 3. Run migration

Apply `supabase/migrations/20260428183000_initial_schema.sql` in the Supabase SQL editor or through the Supabase CLI.

## 4. Import content

```bash
npm run import:content
```

The importer upserts subjects and topics, then replaces all subquestions, study sections, flashcards, and quiz questions under each imported topic.

## Current data note

The tracked source JSON files are UTF-8 and contain Czech text correctly. If terminal output shows mojibake, verify the file contents through the browser/app or with a UTF-8 aware reader before changing the data.
