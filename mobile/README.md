# Phone apps (iPhone and Android)

The apps are a thin shell made with [Capacitor](https://capacitorjs.com). They open the live
journal at `https://myweightlossjournal.com/journal`, so every change to the website reaches
the apps straight away without a store update. The shell adds:

- **Automatic steps** from Apple Health (HealthKit) on iPhone and Health Connect on Android,
  through `@capgo/capacitor-health`. The app only asks to read the daily step total.
  The website side is `lib/phone-steps.ts`, the Today card in `components/steps-card.tsx`,
  and `PhoneStepsSync`, which copies the last 7 days into the journal when the app opens,
  comes back to the front, and every 5 minutes while open. Typing steps still works on
  the website and for anyone who doesn't connect.
- The Android back button (`@capacitor/app`).
- A "No connection" page (`www/offline.html`).

The website knows it is inside the app through `lib/native.ts` (`useNativeApp()`), and the
apps add `WeightLossJournalApp` to the browser user agent.

## No selling inside the apps

Membership is sold only on the website through Stripe, so Apple and Google take no
commission. Inside the apps:

- The locked screen says the account has no active membership and that memberships can't
  be bought in the app. No prices, plans, trial offers or links to buy.
- The Membership page shows the state only (active, trial until, open until). No prices,
  no "change plan or cancel" button.
- The login page offers sign in only: no "Create an account" and no Google button
  (Google blocks its sign-in inside apps like this). People who signed up with Google
  can use "Reset password" to make a password for the app.
- The homepage, which shows the prices, redirects to `/journal`.

This follows Apple's rule 3.1.3(b) for "multiplatform services" and Google Play's
equivalent: people can use in the app what they bought elsewhere, as long as the app does
not point them to buy outside it. Please keep it that way when adding features: anything
that mentions prices or links to the checkout must check `useNativeApp()`.

## Building

No Mac is needed. Two cloud services are set up:

- **GitHub Actions** (`.github/workflows/phone-app-check.yml`) builds the Android app on every
  pull request that touches `mobile/`. The Android run produces a test `.apk` that can be
  installed straight on an Android phone (download `android-test-app` from the run).
- **Codemagic** (`codemagic.yaml`) makes the store builds: the iPhone app goes to
  TestFlight and the Android app to Google Play internal testing.

On a computer with the tools installed:

```sh
cd mobile
npm ci
npx cap sync        # after changing capacitor.config.json or plugins
npx cap open ios    # Xcode, on a Mac
npx cap open android
```

## One-time setup in the stores

- **Apple**: App ID `com.myweightlossjournal.app` with the **HealthKit** capability ticked.
  App Store Connect API key (App Manager role) added to Codemagic as an integration named
  `Weight Loss Journal`.
- **Google Play**: app `com.myweightlossjournal.app`. Upload key added to Codemagic as
  `wlj_upload_ke`, and a Google Cloud service account JSON in a Codemagic variable group
  `google_play` as `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`. The first `.aab` is uploaded by
  hand in Play Console. Fill in the Health Connect permissions declaration (steps only, for
  showing daily steps against a walking goal).
- App review needs a demo account with an active membership (add its email to
  `FREE_ACCESS_EMAILS` on Hostinger).

## Icons and splash

Made from `assets/` with `npx @capacitor/assets generate`.
