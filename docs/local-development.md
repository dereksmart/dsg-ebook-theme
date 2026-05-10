# Local Development

This theme uses `@wordpress/env` to run a local WordPress site for visual iteration before pushing to staging.

## Where This Lives

The local environment config belongs in `dsg-ebook-theme/`, not the parent project root.

Reasons:

- The parent directory is only a container for independent deployable repos.
- There is no parent git repo, so root-level setup could not be committed with the theme.
- This environment is currently for theme work: it mounts this theme as the active WordPress theme.
- If a future site-core plugin needs to be developed alongside the theme, add a separate coordination environment at that point.

## What Should Be Committed

Commit the reproducible local tooling:

- `.wp-env.json`
- `package.json`
- `package-lock.json`
- `scripts/sync-staging-content.sh`
- this documentation

Do not commit local secrets or generated dependency folders:

- `.secrets/`
- `node_modules/`

The staging sync script reads credentials from the untracked parent-level file:

```bash
/Users/dsmart/Desktop/ai/dereksmartgordon-site/.secrets/wp-staging.env
```

Expected variable names:

```bash
WP_BASE_URL=
WP_USERNAME=
WP_APP_PASSWORD=
```

## Setup

From the theme repo:

```bash
cd /Users/dsmart/Desktop/ai/dereksmartgordon-site/dsg-ebook-theme
npm install
npm run env:start
npm run env:seed
```

Open:

```text
http://localhost:8890
```

WordPress admin is available at:

```text
http://localhost:8890/wp-admin
```

The default `wp-env` login is:

```text
admin / password
```

## Daily Workflow

Start the site:

```bash
npm run env:start
```

Sync the current staging pages and posts into the local database:

```bash
npm run env:seed
```

Stop the containers:

```bash
npm run env:stop
```

Destroy and rebuild a clean local database:

```bash
npm run env:reset
```

Theme file edits are mounted into the container, so CSS, template, and PHP changes should be visible after a browser refresh.

