# Sveltekit todo auth

An experimental starter template for production ready sveltekit web apps.

- [Drizzle orm](https://github.com/drizzle-team/drizzle-orm) for type-safe database manipulation
- [Lucia](https://lucia-auth.com/) for authentication
- [Superform](https://superforms.vercel.app/) for forms validation
- Ready to deploy on [Clouflare Pages](https://pages.cloudflare.com/) with D1 distributed database
- [pico.css](https://picocss.com/) for nice base styles
- [unocss](https://unocss.dev/) for icons and additional styles

## Migrating away from Firebase

Missing features:

- Tags
- Import course and routechoices from 2D rerun
- Import splits from Winsplits
- Time offset editor
- Autoanalysis
- Recap pannel

Bugs:

- Routechoice select 500 (relative to statistics)

Improvements:

- No full page reload when changing routechoice or drawing a new one
- loading indicator when navigating directly to an event
