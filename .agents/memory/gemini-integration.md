---
name: Groq integration
description: Notes on the project’s current Groq API integration and provider fallback behavior.
---

The API server now calls Groq through the official JavaScript SDK using the `llama-3.3-70b-versatile` model; generation keeps a local template fallback for provider failures.

**Why:** Gemini quota was exhausted, so Groq was selected as the replacement provider.

**How to apply:** Keep `GROQ_API_KEY` in Replit Secrets only, use `groq-sdk` in the API server, and preserve the local template fallback for quota or provider failures.