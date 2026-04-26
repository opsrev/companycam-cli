# @opsrev/companycam-cli

[![CI](https://github.com/opsrev/companycam-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/opsrev/companycam-cli/actions/workflows/ci.yml)

A minimal CLI for the [CompanyCam](https://companycam.com) REST API. Designed for AI agents — JSON output, no interactive prompts, predictable flags.

## Install

```bash
npm install -g @opsrev/companycam-cli
```

## Configure

Generate a Personal Access Token in the CompanyCam developer dashboard, then either:

- Set the env var: `export COMPANYCAM_API_KEY=<token>`
- Or pass on every call: `--api-key <token>`

## Commands

### `projects list`

Search/list projects, sorted by most recent activity.

```bash
companycam projects list
companycam projects list --query "123 Main St"
companycam projects list --modified-since 2026-01-01T00:00:00Z
companycam projects list --limit 100
```

Flags:
- `--query <text>` — filter by project name or address line 1
- `--modified-since <iso8601>` — only projects modified at or after this timestamp
- `--limit <n>` — max total results (default: 25)

### `projects get <projectId>`

Fetch a single project by ID.

```bash
companycam projects get 123456
```

### `projects photos <projectId>`

List photos for a project.

```bash
companycam projects photos 123456
companycam projects photos 123456 --limit 200
companycam projects photos 123456 --all
```

Flags:
- `--limit <n>` — max total photos (default: 25)
- `--all` — fetch every photo for the project

## Output

All successful output is a single line of JSON to stdout. Errors go to stderr as `{"error":"<message>"}` and the process exits with code 1.

```bash
companycam projects list --query Smith | jq '.[].id'
```

## Development

```bash
git clone https://github.com/opsrev/companycam-cli.git
cd companycam-cli
npm install
cp .env.example .env  # add your COMPANYCAM_API_KEY
npm run dev -- projects list --limit 5
npm test
```

## License

MIT
