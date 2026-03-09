# Court Zone Development Checklist

## MVP Flow

This repository is now structured around one primary MVP flow:

`register/login -> complete profile -> discover scheduled games -> create or join a game`

The first real end-to-end domain is `games`.

## Build Order

1. Authentication and profile completeness
2. Games list, detail, create, join, leave, complete
3. Teams discovery and team creation/join flows
4. Courts discovery, booking, and reviews
5. Automated checks and deployment hardening

## Definition Of Done

A feature is not done until:

- the page works without mock mode
- the API writes real Prisma-backed data
- the signed-in flow works with cookies and persisted client auth
- loading and error states are visible in the UI
- there is a smoke test or repeatable manual verification path

## Environment Rules

- Use real API routes locally by default.
- Only enable mock mode intentionally with `NEXT_PUBLIC_USE_MOCK_DATA=true`.
- Keep websocket features optional during development unless actively working on realtime behavior.

## Priority Domains

### Games

- [x] Authenticated create flow
- [x] Authenticated join/leave flow on the API layer
- [x] Public scheduled game listing via real API
- [ ] Fully real game detail page
- [ ] Completion flow verified in UI and tests

### Teams

- [x] Team list uses real API when available
- [x] Team creation uses real API mutation
- [x] Team join uses real API mutation
- [ ] Team detail page uses real API

### Courts

- [x] Court list uses real API when available
- [x] Court API returns parsed amenities/photos data
- [ ] Court detail page uses real API
- [ ] Court booking flow verified in UI

## Release Smoke Test

1. Register a new user.
2. Complete profile with position, skill level, city, and max distance.
3. Create a game.
4. Open the game detail page and verify participants load.
5. Join and leave a public team.
6. Browse courts and verify availability/review endpoints respond.
