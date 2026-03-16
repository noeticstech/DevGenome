# DevGenome Backend Engineering Guide

## Product Context
DevGenome is a developer analytics platform that connects to coding platforms and generates a structured Developer Genome profile.

The product analyzes:
- repositories
- commit activity
- language usage
- coding consistency
- learning velocity
- skill gaps
- growth timeline

The backend exists to:
- authenticate users
- connect GitHub
- fetch developer metadata
- normalize and store data
- compute analysis outputs
- expose frontend-ready API responses

## MVP Scope
For MVP, only GitHub integration is supported.

Do not build support yet for:
- LeetCode
- Codeforces
- GeeksforGeeks
- Python analysis engine
- advanced AI model pipelines
- background job systems unless explicitly requested later

Use metadata-based analysis only.
Do not imply source code is stored.
Do not persist raw source code content.

## Tech Stack
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM

## Architecture Principles
- Keep route handlers thin
- Put business logic in services
- Put persistence logic in service/repository-like helpers where useful
- Keep external provider logic isolated from product logic
- Normalize external API responses before storing or returning them
- Prefer modular files over giant multi-purpose files
- Use strict TypeScript where practical
- Keep response shapes frontend-friendly and predictable

## Folder Conventions
Prefer this structure unless the repo already has a stronger existing pattern:

src/
  app/
  config/
  routes/
  controllers/
  services/
    auth/
    github/
    analysis/
    sync/
    settings/
  middleware/
  utils/
  types/
  lib/
  presenters/
  validators/

prisma/

## Validation and Error Handling
- Add request validation when routes accept input
- Use consistent error handling
- Avoid throwing raw provider errors directly to clients
- Return safe and understandable API errors

## Auth Rules
- GitHub OAuth only for MVP
- Keep auth logic simple and secure
- Use environment variables for secrets
- Store provider tokens securely
- Create or update user records during OAuth callback flow

## Data Rules
Store:
- users
- connected accounts
- repository metadata
- commit summaries
- language statistics
- generated analysis outputs
- user preferences

Do not store:
- raw source code blobs
- unnecessary provider response payloads
- vague unstructured JSON when a typed model is more appropriate

## Analysis Rules
For MVP, all analysis should be rule-based and explainable.
Do not use black-box AI scoring.
Do not add Python-based ML yet.

The backend should produce data for:
- dashboard
- genome profile
- activity page
- skill gap page
- timeline page
- settings page

## Working Rules for Codex
Whenever implementing a phase:
1. Read this AGENTS.md first
2. Inspect the repo before editing
3. Explain a short plan
4. Implement only the requested scope
5. Do not build beyond the requested phase
6. Summarize files changed and next steps after implementation

## Code Quality Rules
- Prefer readable code over clever code
- Keep naming consistent
- Avoid duplication
- Avoid overengineering
- Make future frontend integration easy
- Make future background jobs possible, but do not implement them early unless requested

## Product Communication Rules
- Never imply source code storage is enabled
- Use wording like:
  - "Metadata-only analysis"
  - "Source code storage: disabled"
  - "Repository metadata synced"