# Connecting GitHub to Vero

You can let Vero read a small, fixed set of files from your GitHub repositories, instead of uploading them one at a time. This page says exactly what we read, what we never read, and how to stop.

## How it works

1. An owner or admin of your Vero organisation chooses **Connect GitHub**.
2. GitHub opens its own page. There you choose your account or organisation, and which repositories the Vero app may see. You can pick "Only select repositories". We never see your GitHub password, and we never ask for a personal access token.
3. Back in Vero, you choose which of those repositories to include, and which of your companies each one belongs to. **Nothing is included until you choose it.**
4. Vero then reads the files listed below from the repositories you included.

The Vero app asks GitHub for two permissions only, both read-only: **Metadata** and **Contents**. It cannot change anything in your repositories.

## What we read

From each repository you include:

- **About the repository:** its name, whether it is private or public, whether it is archived, when it was last pushed to, and the licence GitHub itself detects.
- **Contributors:** the public GitHub usernames GitHub lists as contributors (up to 100 per repository), so a person can compare them with your IP assignment records.
- **These files, and only these, from your main branch:**
  - at the top of the repository: `LICENSE`, `LICENSE.md`, `LICENSE.txt`, `COPYING`, `NOTICE`, `PRIVACY.md`, `TERMS.md`, `CLA.md`, `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`, `Gemfile`, `composer.json`
  - at the top, in `.github/` and in `docs/`: `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`

A file larger than 256 KB is skipped, and we say so.

From `package.json` we note only the licence it declares. From the other manifest files we note only that the file is there.

## What we never read

- Your source code, or any file not named above.
- Your commit history, branches other than the main one, issues, pull requests or comments.
- Secrets, environment files, settings or workflow files.

GitHub's "Contents" permission cannot be limited to certain files, so this limit is enforced in Vero's own code: a request for any other file is refused before anything is sent to GitHub.

## What happens to what we read

- **Your licence, notice and security policy files** can appear in your document vault, marked as coming from GitHub (which repository, which file, which commit, and when). Like any document you upload, each one waits for you to confirm it before it counts.
- **The rest becomes notes about your repositories**, such as "these repositories have a licence file" or "these are the contributors GitHub lists". Each note says it came from GitHub and when.

What we read from GitHub is evidence for a person to confirm. It is not a legal check, it never says a licence is right or compliant, and it never earns a verified badge. If a repository could not be read, it shows as "not checked yet", never as a pass or a fail.

We do not keep any GitHub password or token. The short-lived key GitHub gives the Vero app is held in memory for under an hour and never stored.

## How to disconnect

Either of these works, and you can do both:

- **In Vero:** an owner or admin chooses **Disconnect GitHub**. We delete our record of the connection and the list of repositories, and ask GitHub to remove the Vero app from your account.
- **On GitHub:** go to your account or organisation's **Settings**, then **GitHub Apps** (under Integrations), find the Vero app and choose **Uninstall**. Vero is told, and stops reading straight away.

After disconnecting, notes already made stay in your record, marked as from a disconnected GitHub account, and documents already in your vault stay there until you delete them. Nothing more is read.

To change which repositories the Vero app can see without disconnecting, use **Configure** next to the Vero app on GitHub, or change which repositories you include in Vero.
