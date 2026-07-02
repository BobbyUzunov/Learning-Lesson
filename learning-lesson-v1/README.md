# Learning Lesson v1

Legacy version of Learning Lesson — an Express server with HTML/JS lessons in the browser.

The active product is **[v2](../learning-lesson-v2/)**. This folder is kept for reference and the original learning environment.

## Start locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project layout

| Path | Purpose |
|------|---------|
| `server.js` | Express backend |
| `index.html` | Main learning page |
| `admin.html` | Admin panel |
| `public/` | Lesson scripts and client code |
| `supabase-schema.sql` | Supabase schema for v1 |

## Notes

- Default admin credentials are configured in `server.js` (change via environment variables for production).
- Configure Supabase via `public/supabase-config.js` (see `public/supabase-config.example.js`).
