# My Weight Loss Journal

The companion website and web app for the book *Weight Loss Journal*.
People log food, drink and exercise, and see calories in and out for each day.

- **Homepage** (`/`): about the book and the app.
- **Journal** (`/journal`): daily log, progress and profile. Needs an account.

## How it is built

| Part | Choice |
| --- | --- |
| Site and app | Next.js (App Router), TypeScript, Tailwind CSS |
| Accounts and data | Firebase Authentication (email and Google) and Cloud Firestore |
| Food search | USDA FoodData Central, through `/api/foods` |
| Photo estimates | Claude, through `/api/estimate`. Photos are not stored. |
| Hosting | Hostinger Business (Node.js web app, deployed from GitHub) |

Journal data lives under `users/{uid}` in Firestore: the profile document,
an `entries` collection (food and exercise) and a `weights` collection.
`firestore.rules` restricts each person to their own data.

The calorie target uses the Mifflin-St Jeor equation, an activity factor and
the chosen weekly pace, and never goes below 1,200 kcal (women) or 1,500 kcal
(men). Exercise uses MET x weight x time. See `lib/calc.ts`.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev
```

With no Firebase settings the app runs in **preview mode**: no sign-in, and
the journal is kept in the browser. This is handy for trying changes.

## Set up for production

1. **Firebase console**
   - The web app settings are already in `.env.production`.
   - Authentication > Sign-in method: enable Email/Password and Google.
   - Authentication > Settings > Authorised domains: add `myweightlossjournal.com`.
   - Firestore Database: create it in production mode, then paste `firestore.rules` into the Rules tab and publish.
2. **Anthropic**: create an API key at https://console.anthropic.com and set `ANTHROPIC_API_KEY`.
3. **USDA**: get a free key at https://fdc.nal.usda.gov/api-key-signup and set `USDA_API_KEY`.
4. **Hostinger**: create a Node.js web app from this GitHub repository with
   build command `npm run build` and start command `npm start`, and add the secret
   variables from `.env.example`. The `NEXT_PUBLIC_*` values are read at build
   time, so rebuild after changing them.

## Checks

```bash
npm run lint
npm run build
```
