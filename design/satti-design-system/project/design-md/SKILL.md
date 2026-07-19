---
name: design-md
description: Extract Google DESIGN.md design-system specs from public website URLs using the bundled static HTML/CSS Node.js pipeline. Use when Codex is asked to create DESIGN.md, tokens.json, preview.html, style fingerprints, or drift reports from a live URL, especially for phrases like "extract design from this site", "get a DESIGN.md from this URL", "rip the design system", "generate tokens from this page", or "compare my DESIGN.md to the live site".
---

# Design MD

Use this skill to run and maintain the bundled `design-md` extractor. The extractor fetches public HTML/CSS, performs static design-token analysis, asks an LLM provider to write a Google-spec `DESIGN.md`, then emits supporting artifacts such as `tokens.json`, `preview.html`, `style-fingerprint.json`, lint results, confidence summaries, and optional drift reports.

## Workflow

1. Confirm the user provided a public `http` or `https` URL. If they want to compare drift, also identify the local `DESIGN.md` path.
2. Check whether dependencies are installed in this skill folder. If `node_modules/` is missing, run `npm install` from the skill directory before extraction.
3. Choose the provider:
   - Use the default provider when the Claude CLI is available on `PATH`.
   - Use `--provider openrouter` only when `OPENROUTER_API_KEY` is set.
   - If no provider is available, explain the missing dependency and ask the user how they want to proceed.
4. Run `run.cjs` from the skill folder, preferably from the user's project root so outputs land near the project.
5. Inspect stdout and the generated output folder. Surface the `DESIGN.md`, `tokens.json`, `preview.html`, quality score, lint status, and drift verdict when relevant.
6. If extraction fails because of bot detection, paywalls, thin SPA shells, or inaccessible content, report the concrete failure. Use `--no-content-gate` only when the user accepts the risk of lower-quality extraction.

## Commands

Run a standard extraction:

```bash
node path/to/design-md/run.cjs --url https://example.com/
```

Write outputs to a specific directory:

```bash
node path/to/design-md/run.cjs --url https://example.com/ --out outputs/design-md/example
```

Compare a live URL against a local `DESIGN.md`:

```bash
node path/to/design-md/run.cjs --url https://example.com/ --compare apps/web/DESIGN.md
```

Force OpenRouter:

```bash
node path/to/design-md/run.cjs --url https://example.com/ --provider openrouter
```

Run the test suite after editing the implementation:

```bash
npm test
```

## Outputs

Expect the extractor to write a slugged folder under `outputs/design-md/` unless `--out` or `DESIGN_MD_OUTPUTS_DIR` overrides it. Important artifacts include:

- `DESIGN.md`: Google-spec design-system document with provenance comments.
- `tokens.json`: Parsed design tokens from `DESIGN.md` frontmatter.
- `preview.html`: Standalone visual preview with typography, colors, spacing, and audit details.
- `style-fingerprint.json`: Static classification of the site's visual stack and style archetype.
- `extraction-log.yaml`: Confidence summary and provenance details.
- `lint-report.json`: `@google/design.md` lint output.
- `quality-score.json`: Letter score across extraction quality dimensions.
- `drift-report.json`: Only present when `--compare` is used.

## Flags

- `--url <url>`: Required public URL.
- `--out <dir>`: Override the output directory.
- `--compare <file>`: Compare the live extraction against a local `DESIGN.md`.
- `--no-content-gate`: Skip bot/paywall/thin-content validation when explicitly warranted.
- `--no-llm-retry`: Fail after the first LLM error.
- `--no-reuse`: Disable phase reuse from prior fresh runs.
- `--provider <id>`: Select `claude-cli` or `openrouter`.
- `--model <id>`: Override the provider default model when supported.
- `--max-tokens <n>`: OpenRouter max token budget.

## Implementation Notes

- Keep extraction static. Do not add Playwright, Puppeteer, Hyperbrowser, or browser automation unless the user explicitly changes the constraint.
- Keep provider policy in `lib/llm.cjs`.
- Keep the default prompt in `data/url-extract-prompt.txt`.
- Use `scripts/organize.cjs` to consolidate legacy `{slug}-{timestamp}` output folders.
- Use `scripts/enrich-existing.cjs` and related scripts only for maintaining existing extracted themes.
- Test changed scripts or library modules before reporting completion.

## Failure Handling

- Exit code `1`: Usage error, usually missing `--url`.
- Exit code `2`: LLM ran but did not write `DESIGN.md`; inspect `inputs/prompt.txt`.
- Exit code `4`: Content gate failed because the page looked blocked, thin, or unsuitable.
- Exit code `5`: LLM budget or required-section retry failed.
- Exit code `6`: OpenRouter was selected without `OPENROUTER_API_KEY`.
- Exit code `7`: OpenRouter HTTP error after retry.
