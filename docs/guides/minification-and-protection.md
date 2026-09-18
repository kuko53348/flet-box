# Minify and protect a FletBox build

> **Level: Advanced.** This page is for shipping — skip it on a first read. It follows [the FletBox CLI](../cli/README.md) in the book's reading path.

FletBox can produce a smaller production build by bundling only the code used by the application, removing development whitespace, and applying tree shaking.

This guide explains two different goals:

- **Minification** reduces file size and load time.
- **Code protection** makes the generated JavaScript harder to read, but cannot make browser code truly secret.

## What `createBundle` does

The FletBox bundle process uses esbuild with production-oriented options:

```bash
flet-box createBundle
```

Aliases:

```bash
flet-box build
flet-box bundle
npm run build
```

The build process bundles `src/app.js` and writes the result to `dist/src/app.js` with options equivalent to:

```text
--bundle
--format=esm
--minify
--tree-shaking=true
--target=es2020
```

It also copies the HTML file, assets, fonts, service worker, and `run.sh` when they exist.

## Basic production workflow

```bash
# Install dependencies
npm install

# Create the optimized web build
npm run build

# Inspect the generated output
find dist -maxdepth 3 -type f

# Preview the production build
cd dist
./run.sh
```

Always test the `dist` directory, not only the development server. A development build and a production build can behave differently.

## What minification changes

Minification normally:

- Removes unnecessary whitespace.
- Removes comments that are not required at runtime.
- Shortens local variable names when safe.
- Compresses expressions.
- Removes unreachable code.
- Combines imported modules into the application bundle.
- Removes unused exports through tree shaking.

Minification does not change the intended public behavior of the application.

## Reduce bundle size

### Import only what you use

Prefer focused imports:

```javascript
import { Button, Container, Text } from "flet-box";
```

Avoid importing a large internal surface when a focused import is enough. The bundler can remove unused code more effectively when imports are statically analyzable.

### Avoid unnecessary dependencies

Every dependency can add code, assets, initialization time, and security maintenance. Add a package only when it solves a real problem.

### Keep assets outside JavaScript

Images, fonts, videos, and large data files should usually remain assets instead of being embedded into JavaScript strings. Copy only the assets required by the application.

### Use lazy loading for large features

For large optional screens, load code only when the user needs it:

```javascript
const openReports = async () => {
  const module = await import("./screens/ReportsScreen.js");
  return module.ReportsScreen();
};
```

The exact loading strategy depends on your application and server. Test lazy routes in the final `dist` directory.

### Remove development-only code

Keep debug panels, test data, verbose logs, and development-only routes out of the production entry point.

```javascript
if (import.meta.env?.DEV) {
  console.log("Development information");
}
```

Use a build setup that actually replaces environment flags before relying on them. Do not assume every bundler provides `import.meta.env` automatically.

## Protecting browser code: the honest rule

JavaScript shipped to a browser can be downloaded, inspected, and debugged by the user. Minification and obfuscation can slow down casual inspection, but they cannot provide real secrecy.

Never put these values in frontend code:

- Passwords.
- Private API keys.
- JWT signing secrets.
- Database credentials.
- SMTP passwords.
- Cloud service private keys.
- Internal security rules that must remain secret.

Keep sensitive operations in FletBox Server or another backend and expose only the minimum API needed by the frontend.

## Minification versus obfuscation

### Minification

Recommended for every production build:

```bash
flet-box build
```

It reduces size and removes readable formatting. It is usually fast and has low runtime risk.

### Obfuscation

Obfuscation changes code structure and names to make manual reading more difficult. It can increase bundle size, reduce performance, make debugging harder, and break code that depends on function names or dynamic property access.

Use obfuscation only after measuring its impact. It is not a replacement for authentication, authorization, or server-side protection.

If an obfuscator is introduced, run it only on the final browser bundle and test:

- Application startup.
- Router navigation.
- Event handlers.
- Dynamic imports.
- PWA installation.
- Capacitor Android builds.
- Capacitor iOS builds.

## Source maps

Source maps make production debugging easier but also make original source code easier to recover. Decide intentionally whether to publish them.

For a private staging build, source maps can be useful. For a public production build, do not publish source maps unless you understand the exposure and have access controls.

The current FletBox shell build does not enable source maps by default. If you add them, keep them out of public hosting when the source is private.

## Protect API calls

The frontend is not a safe place for secrets. Protect backend routes instead:

```javascript
import { authenticate, hasRole } from "flet-box-server";

const routes = Api({
  "/admin/report": {
    GET: {
      handler: createReport,
      middleware: [authenticate, hasRole("admin")],
    },
  },
});
```

The browser may know that this endpoint exists, but it should not be able to use it without a valid token and role.

## Protect the production build pipeline

Use a repeatable build process:

```bash
rm -rf dist
npm ci
npm run build
```

Then verify:

```bash
# Check that the bundle exists
 test -s dist/src/app.js

# Check that development secrets are not present
 grep -R "JWT_SECRET\|password\|apiKey" dist || true
```

Do not print or commit secret values while checking files. The example searches names only; inspect matches carefully.

## Capacitor builds

Build the web code before synchronizing native projects:

```bash
npm run build
npx cap sync android
npx cap sync ios
```

Then create a debug Android APK:

```bash
cd android
./gradlew assembleDebug
```

For a production APK or an Android App Bundle, use the release tasks:

```bash
./gradlew assembleRelease
./gradlew bundleRelease
```

The AAB is the usual format for Google Play. Release artifacts must be signed with a production key.

Minification reduces the web payload inside the native application. It does not replace Android or iOS signing, secure storage, transport security, or native permission review.

## Production checklist

- Run `npm run build` from a clean state.
- Confirm tree shaking is active.
- Inspect the size of `dist/src/app.js`.
- Remove development routes and debug data.
- Do not ship secrets in frontend code.
- Decide whether source maps should be private.
- Test the actual `dist` output.
- Test direct navigation to SPA routes.
- Test PWA and Capacitor builds when used.
- Use HTTPS for API calls.
- Protect backend routes with authentication and authorization.
- Keep signing keys and deployment credentials outside Git.

---

## Continue reading

- **Previous:** [The FletBox CLI](../cli/README.md)
- **Next:** [Build FletBox for mobile and other platforms](mobile-and-platforms.md) — Appendix B
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
