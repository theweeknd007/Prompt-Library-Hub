---
name: Gemini integration
description: Notes on the project’s Gemini API integration and quota behavior.
---

The API server calls Gemini through the v1 REST endpoint with `node-fetch`; the installed key was accepted by Google, but generation can return HTTP 429 when the Google AI Studio quota is exhausted.

**Why:** The available Gemini models and SDK API version did not match the initial `gemini-1.5-flash` configuration, while the v1 REST endpoint exposed the current models directly.

**How to apply:** Keep `GEMINI_API_KEY` in Replit Secrets only, use a current v1 model, and preserve the local template fallback for quota or provider failures.