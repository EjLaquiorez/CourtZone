# Manual test scripts

This folder contains ad-hoc/manual Node.js test scripts used for local verification.

Run scripts from the project root using npm:

- `npm run test:manual:auth-flow`
- `npm run test:manual:complete-flow`
- `npm run test:manual:connection-simple`
- `npm run test:manual:dashboard`
- `npm run test:manual:db-connection`
- `npm run test:manual:mvp-smoke`
- `npm run test:manual:profile-simple`
- `npm run test:manual:profile-update`
- `npm run test:manual:socket`
- `npm run test:manual:final-verification`

## Recommended Smoke Test Order

Use this order when verifying the current MVP:

1. `npm run test:manual:db-connection`
2. `npm run test:manual:auth-flow`
3. `npm run test:manual:dashboard`
4. `npm run test:manual:complete-flow`
5. `npm run test:manual:final-verification`

## Notes

- Real API mode is now the default target for development.
- Only enable mock mode intentionally with `NEXT_PUBLIC_USE_MOCK_DATA=true`.
- The highest-priority verification path is: auth -> profile completion -> scheduled games -> create/join flow.