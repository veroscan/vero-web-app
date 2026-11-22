# Vero mobile app

The Vero phone app for iOS and Android: Expo SDK 58, React Native 0.88, Expo Router and
Reanimated, built from the mobile boards in `vero-build/product-design-v2` (light and dark) and
talking to the same API as the web app. It reads the API contract straight from `packages/shared`.

This folder is its own project, not an npm workspace, because React Native pins its own React.

## Run it

You need the local database and API running (from the repo root):

```
npm run db:start
npm run dev:api
```

Then, in `apps/mobile`:

```
npm install
npx expo start
```

- **On your phone:** install the Expo Go app, then scan the QR code. The phone talks to the API on
  your computer, so the API must listen on your network: put `API_HOST=0.0.0.0` in the repo's `.env`
  and restart `npm run dev:api`. Phone and computer must be on the same Wi-Fi.
- **In a browser (for a quick look):** press `w`, or run `npm run web`. The web preview runs on
  `http://localhost:8081`, which the dev API already allows.

## Signing in

The app uses the same email sign-in link as the web app. It asks for the link with `app: true`, so
the email's link opens the Vero app (`vero://sign-in?token=...`). The app keeps its session in the
phone's secure store and sends it as a Bearer token with the header `x-vero-client: mobile`; the API
accepts a Bearer token only on requests carrying that header (see `apps/api/src/modules/auth/session.ts`).

In development no email is sent: the link is written to the `outbox` table. You can paste the whole
link into the app's "Paste the link" field.

## Point it at a real API

Set `EXPO_PUBLIC_API_URL` (for example `https://api.vero.example`) before starting or building.
Without it the app uses port 4000 on the computer running the Expo dev server.

## Check it

```
npx tsc --noEmit
npx expo lint
node tools/shot.mjs home out.png light     # from the repo root: node apps/mobile/tools/shot.mjs ...
```

`tools/shot.mjs` screenshots any screen of the web preview at 390 x 844, signed in as the fictional
demo user (`amara@kestrelpay.example`), in light or dark.

## Build for the stores

Use EAS (`npx eas-cli@latest build`). The bundle id is `com.vero.app` (set in `app.json`); change it to
the real one before the first store build. Apple and Google developer accounts are needed for this.

## Before launch

- The score font (Lowres Pixel) is licensed for personal use only. It needs a commercial licence or a replacement.
- Universal links (opening `https://` sign-in links straight into the app) need the app's domain
  set up with apple-app-site-association and assetlinks; until then the web page hands over to `vero://`.
