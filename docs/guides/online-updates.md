# Ship updates without the store (OTA / online updates)

> **Level: Advanced.** This page is for shipping — skip it on a first read. It follows [Add FletBox to an existing page](embedding.md) in the book's reading path.

FletBox apps are 100% web at their core: the Android/iOS build is a thin native shell (Capacitor) around a web bundle. That means the **web layer can update itself over the air**: you publish the app to the store **once**, and every later change to your UI/logic reaches installed apps the next time they open — no new store submission, no user download of the whole app.

This page explains the whole pipeline: what `flet-box release` does, what the `config.json` manifest contains, what the running app does with it, and — critically — **what OTA can and cannot change**.

## The pipeline at a glance

```text
you edit source code
        |
        | flet-box release          (bumps version, rebuilds www/, git tag v1.0.1)
        v
git tag v1.0.1 pushed to GitHub
        |
        | GitHub Actions — the web job deploys www/ on every push to main,
        | and keeps www/config.json only when that commit carries a v* tag.
        | A run started BY THE TAG cannot deploy (the github-pages environment
        | accepts the default branch only), so publish the feed with one
        | manual run on main: Actions → Deploy → Run workflow.
        v
www/ deployed to GitHub Pages      <- the ONLY place an update is published
        |
        | app opens (web or installed mobile app)
        v
loader.js fetches <update.url>/config.json
        |
        | hash differs from the running bundle?
        +-- no  -> run the bundle already on the device
        +-- yes -> show "Update available" dialog
                     |  Accept
                     v
                   download bundle, verify sha256, store it, run it
```

Three invariants make this safe:

1. **Only a release tag can be offered as an update.** The web workflow publishes your site on every push to main, so the preview is never stale — but it deletes `www/config.json` from any build whose commit carries no `v*` tag. With no manifest to read, an installed app logs `no remote config (offline or not deployed yet)` and keeps running the release it already has. So the site is live for reading while the update feed stays on tags, and a half-finished test build can never reach your users.
2. **The app verifies integrity.** A downloaded bundle is executed only if its sha256 matches the hash in `config.json`.
3. **The app always launches.** Offline, a wrong URL, a hash mismatch, or a declined dialog all fall back to the bundle already on the device. OTA can never brick the app.

## Cutting a release

Work on your code freely and build preview bundles as often as you like — **the version number does not move** on a normal build. When the code is stable and you want it to reach users:

```bash
flet-box release            # bump PATCH  (1.0.0 -> 1.0.1), rebuild, commit, tag v1.0.1
flet-box release --minor    # bump MINOR  (1.0.0 -> 1.1.0)
flet-box release --major    # bump MAJOR  (1.0.0 -> 2.0.0)
flet-box release --push     # also push the commit and the tag to origin
```

`flet-box release` does, in order:

1. Refuses to run if the working tree has uncommitted changes (the tag must capture exactly what you release).
2. Bumps the version in `package.json` using the odometer scheme below.
3. Rebuilds the production bundle (`www/`), which regenerates `www/config.json` with the new version and the sha256 of the new bundle.
4. Commits the version bump and creates the annotated tag `vX.Y.Z`.
5. Optionally pushes (`--push`), which deploys the site. The tag is what turns the update feed on, and a tag run cannot deploy by itself — after pushing, start the workflow once more from Actions (Run workflow, on main) and that build keeps `www/config.json`.

If the build fails, the version bump is rolled back so a failed release leaves no trace.

### Odometer versioning

Versions are `MAJOR.MINOR.PATCH` where **MAJOR grows without bound** and **MINOR/PATCH are single digits (0–9)** that carry like an odometer:

```text
1.0.8 -> 1.0.9 -> 1.1.0 -> ... -> 1.9.9 -> 2.0.0 -> ... -> 9.9.9 -> 10.0.0
```

When a position passes 9 it resets to 0 and carries into the position on its left. MAJOR never caps, so you can never run out of versions.

## The `config.json` manifest

Every bundle ships a small manifest at `www/config.json`. This is what a running app fetches (a ~200-byte check, not the whole bundle):

```json
{
  "version": "1.0.1",
  "hash": "494ca992aecf2de1e32680eae56405ec42baaa9b455248a4999df2edb76ad0b9",
  "builtAt": "2026-10-11T19:53:24.524Z",
  "bundle": "src/app.js",
  "size": 36132,
  "assets": [
    { "path": "docs/widget/Maps.md", "hash": "b0f2…", "size": 4213 },
    { "path": "data/catalog.json", "hash": "7ac9…", "size": 980 }
  ],
  "minNativeVersion": "0.0.0",
  "update": {
    "url": "https://kuko53348.github.io/my-app/",
    "mode": "prompt",
    "channel": "stable",
    "mandatory": false,
    "notes": "Fixed the login timeout."
  }
}
```

| Field | Meaning |
| --- | --- |
| `version` | Human-readable label from `package.json` (shown in the dialog). |
| `hash` | sha256 of the bundle. **This is what drives the update decision**, not the version. |
| `bundle` | Path of the bundle relative to the update URL. |
| `size` | Bundle size in bytes (shown in the dialog as KB). |
| `assets` | Extra files this release publishes (see [Shipping extra files](#shipping-extra-files-release-assets)). Each entry is verified by its own `hash`; the bundle `hash` never covers them. |
| `minNativeVersion` | Oldest native shell this bundle supports. Older shells are told to update from the store instead. |
| `update.url` | Where `config.json` and the bundle are published (your GitHub Pages site). |
| `update.mode` | `prompt` (ask the user, default) or `auto` (download silently). |
| `update.mandatory` | `true` hides the "Later" button so the update cannot be skipped. |
| `update.notes` | Release notes shown in the dialog. |
| `update.channel` | Label for rollout channels (e.g. `stable`, `beta`). |

### Where the update URL comes from

`update.url` is resolved automatically, in this order:

1. `update.url` in `fletbox.config.json` at your project root (explicit wins) — unless it is still the scaffold placeholder, which is not a choice. See [The Pages address of a generated app](#the-pages-address-of-a-generated-app).
2. Derived from the `repository` field of `package.json`, mapped to GitHub Pages: `https://<user>.github.io/<repo>/`.
3. Derived from the **current project's** git remote `origin` (when it is a GitHub URL). This means `flet-box createBundle` always points at the project it is built in, never at the flet-box framework installed as a dependency.
4. If none of these exist, OTA is **disabled** and the bundle simply runs what shipped in it.

To configure it by hand, create `fletbox.config.json`:

```json
{
  "update": {
    "url": "https://kuko53348.github.io/my-app/",
    "mode": "prompt",
    "mandatory": false,
    "notes": "",
    "minNativeVersion": "0.0.0",
    "channel": "stable"
  }
}
```

## The Pages address of a generated app

The URL you paste into `update.url` is not a guess: `flet-box create` knows the
address the app will be published to and prints it when it finishes.

```bash
flet-box create my-app --repo kuko53348/my-app
```

That `--repo` (or the same value typed at the interactive prompt) does three
things at once:

- sets `update.url` in `fletbox.config.json` to `https://kuko53348.github.io/my-app/`;
- writes that address into the header of the generated `.github/workflows/build.yml`;
- prints it in the closing summary, with the one-time setting Pages needs.

Without `--repo` nothing is invented at scaffold time. `fletbox.config.json` keeps
the generic placeholder `https://TU-USUARIO.github.io/TU-REPO/`, the workflow
header names a guess built from the folder name, and the workflow says in its own
comment which part of that address still has to be checked by hand.

The build does not trust that placeholder. `TU-USUARIO` and `TU-REPO` mean "not
configured yet", so `flet-box createBundle` falls through to rules 2 and 3 and
writes the address it derived — and prints that it derived, because a manifest
pointing at a real site next to a file that still says `TU-REPO` is a half-filled
config you should either finish or leave alone. A project with no GitHub remote
yet gets `update.url: null`: OTA is off, the bundle runs what shipped in it, and
nothing polls a host that does not exist.

That matters because the failure used to be silent. The app compares bundle
**hashes**, and OTA is built never to break the app, so a placeholder URL that
reached a bundle produced no error, no dialog and no update — ever.

**The workflow log is the authority.** The header names the address you typed at
scaffold time; the `Where this lives` step prints the address the run *actually*
belongs to, read from GitHub itself:

```text
site:    https://kuko53348.github.io/my-app/     <- from the running repo
header:  https://TU-USUARIO.github.io/my-app/    <- from the file
version: 1.0.3
```

When those two disagree, trust `site:`. They disagree when the repository was
created with a different name than the folder, or when the app was never pushed.
Note the owner is lower-cased: GitHub Pages serves the site under the
lower-cased login, so `Kuko53348` in your remote is `kuko53348` in the URL.

**A green run that 404s has one cause.** The deploy job can only write to Pages
after you enable the destination once: **Settings → Pages → Build and deployment
→ Source: GitHub Actions**. Until you do, every run succeeds and no site exists —
which is exactly what the `Where this lives` step prints in the log, so a failed
release is never mistaken for a broken bundle.

The address is a **sub-path** (`/<repo>/`), and that is why the bundle uses
relative asset paths: the same `www/` a phone polls for updates is the one served
under any path, with no rebuild for a custom domain or a rename. If you do move to
a custom domain, change `update.url` in `fletbox.config.json` and rebuild — the
native shell keeps the old bundle until the manifest tells it otherwise.

## Shipping extra files (release assets)

OTA swaps **one file**: `src/app.js`. Anything your app reads from disk at runtime — markdown pages, JSON data, per-tenant config — keeps the copy baked into the build the device installed. So an app installed three releases ago can run a bundle that was updated over the air and still be missing files the current catalog refers to. The symptom is not a crash, it is a "this page does not exist" for content that clearly exists online.

Declare those files in `fletbox.config.json` and they become part of every release:

```json
{
  "update": {
    "assets": ["docs/**/*.md", "data/catalog.json"]
  }
}
```

Globs are relative to the project root and support `**`, `*` and `?`. At build time `flet-box createBundle` copies each match into `www/` at the same path, hashes it, and lists it in the manifest's `assets` array — which is also what your CI publishes to GitHub Pages.

The app then reads them through the loader instead of `fetch`:

```js
const asset = await globalThis.__FLETBOX_OTA_ASSET__?.("docs/widget/Maps.md");
const markdown = asset && asset.ok ? await asset.text() : await (await fetch("./docs/widget/Maps.md")).text();
```

It returns a `Response`, or `null` when the file exists in neither place. For each path it tries, in order:

1. **The OTA cache** — the published copy already downloaded on a previous launch, so repeat reads and offline reads are free.
2. **The published release** at `update.url`. The bytes are verified against the manifest hash; a mismatch is logged and ignored rather than trusted.
3. **The copy inside this build**, exactly as `fetch` would return it.

Because step 3 is always available, the helper can never leave you with less than you had before: an unpublished file, an offline device, or a tampered download all serve the shipped copy.

Two rules keep this honest:

- **A file only updates OTA if it is listed.** An empty or missing `assets` list means the manifest publishes nothing but the bundle.
- **Bundle and assets are verified separately.** `hash` is the bundle; each asset entry carries its own hash, so one corrupted file cannot serve unverified content — and a bad asset never blocks a good bundle update.

**Old shells have no helper.** `loader.js` is baked into the native build and OTA replaces the bundle, never the loader — so a store build made before this feature cannot fetch published assets, however many updates it accepts. That is what the `fetch` fallback in the snippet is for, and it closes only when you ship a new store build.

## What the app does on launch

`www/loader.js` (wired in automatically as the module entry of every production bundle) runs **before** your app:

1. Reads the shipped `config.json` to learn the update URL and the hash of the bundle on the device.
2. Fetches the remote `config.json` with `cache: no-store` and a short timeout.
3. If the remote hash equals the running hash, it logs "up to date" and starts the app immediately.
4. If they differ, it either downloads silently (`mode: "auto"` or `mandatory`) or shows the **Update available** dialog with the version change, your release notes, and the download size, offering **Later** / **Update now**.
5. On accept it downloads the bundle, recomputes its sha256, and only runs it if the hash matches. The bundle is then kept in Cache Storage so the next launch uses it even offline.

The dialog is plain HTML/CSS rendered by the loader itself, so it appears before the framework (and your UI) loads.

## What OTA can and cannot change

OTA replaces the **web layer only**: the `src/app.js` bundle plus whatever you list in `update.assets`. Everything else on the device is what the store build shipped.

| Updates over the air | Needs a new store submission |
| --- | --- |
| UI, screens, widgets, styles | New native plugins / Capacitor version |
| App logic and routing | New Android/iOS permissions |
| Release assets declared in `update.assets` (markdown, JSON, images) | Changes to `AndroidManifest.xml` / `Info.plist` |
| Bug fixes and new JS features | Native code or signing changes |
| Anything inside the bundle | Anything that changes the app's identity or purpose |

Rule of thumb: if the change lives in `src/` (your FletBox code) it ships OTA; if it lives in the native shell it goes through the store. A data or content file ships OTA only when it is listed in `update.assets` — otherwise the device keeps the copy its store build baked in. The `minNativeVersion` field exists for the boundary case where a new web bundle needs a newer shell: older shells skip the OTA and you direct users to the store update.

## Store policy (read this before relying on OTA)

Both stores permit over-the-air updates of **interpreted code** (JavaScript in a WebView counts), with conditions. This is a summary, not legal advice — check the current policy text before shipping.

- **Google Play** (Device and Network Abuse policy): apps may not download and execute code that changes the app's behavior outside a virtual machine/interpreter. Code running in an interpreter (your JS in the Capacitor WebView) **is** allowed. You may add features and fix bugs OTA; you may not push new APKs or escalate permissions OTA.
- **Apple (App Review Guideline 2.5.2)**: interpreted code may be updated OTA only if it does not change the **primary purpose** of the app. Patches, minor features, and assets are fine; turning a catalog app into a payment app (or anything that changes what the app fundamentally is) requires review.

Because of these rules, keep OTA updates within the app's existing purpose, and never use OTA to request new permissions or swap the native shell.

## Offline behaviour and the service worker

The generated service worker uses a hybrid strategy so OTA and offline coexist:

- **Updatable shell** (`index.html`, `loader.js`, `config.json`, `src/app.js`): network-first. Online users always get fresh bytes, so a new release is picked up immediately and the worker never serves a stale `app.js`. Offline, the last cached copy is used.
- **Static assets** (fonts, icons, images, css): cache-first, since they are immutable per release.
- **Cross-origin requests** (your remote `config.json` and bundle) are left to the network and are never cached by the worker.

Downloaded OTA bundles **and** release assets live in a **separate** cache (`fletbox-ota`) owned by the loader, so a service-worker update never wipes an installed OTA bundle. The loader fetches published assets with `cache: no-store`, so a stale service-worker copy of a file in `www/` cannot shadow the published one.

## Requirements and troubleshooting

Requirements: a **public** GitHub repository, GitHub Pages enabled (Settings → Pages → Source = "GitHub Actions"), and the workflow from `flet-box create` (`.github/workflows/build.yml` publishes `www/` on every push, and publishes the OTA manifest only for a `v*` tag; Android and iOS live in `build-native.yml`, which starts by hand). GitHub Pages and Actions are free for public repos.

| Symptom | Likely cause |
| --- | --- |
| Build prints "THIS APP DOES NOT SUPPORT OTA UPDATES" | No public GitHub repo is reachable from the project (no `origin` remote, a non-GitHub remote, or nothing configured). The app still works — it runs the bundle it shipped with. Create the repo, push it, and rebuild. |
| No dialog, app runs old code | `update.url` wrong — a real address that is not where the bundle is (the scaffold placeholder is not one of those: the build derives the address and prints it). Or no `v*` tag was published — a normal push updates the site but deliberately leaves the manifest out, so there is nothing to compare against. |
| `hash mismatch` in console | The published `config.json` and bundle are from different builds. Re-run `flet-box release` so both are published together. |
| Dialog appears but download fails | The Pages site is not reachable/CORS-blocked from the app origin. Pages serves with permissive headers; check you are not behind a proxy that strips them. |
| Update applies but reverts on next launch | Cache Storage unavailable (private browsing). The bundle runs once but cannot persist. |
| A data/content file is missing on the device but published online | It is not listed in `update.assets`, so OTA only ever replaced the bundle — or the installed shell predates release assets, in which case the app must fall back to its own copy. |
| Want to force a clean state | Clear site data for the app origin (this removes the OTA cache and localStorage entry). |

Because the decision is hash-based, two builds of identical source produce the same hash and no spurious update is offered; only a real content change triggers the dialog.

---

## Continue reading

- **Previous:** [Add FletBox to an existing page](embedding.md)
- **Next:** none — you reached the end of the book.
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
