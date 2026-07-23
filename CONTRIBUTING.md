# Contributing

All commits must follow the **Conventional Commits** specification, enforced by `@commitlint/config-conventional` through the `commit-msg` hook.

## Commit message format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

A `scope` is optional and MUST be a noun in parentheses, e.g. `fix(parser):`.

## Allowed types

| Type | When to use |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) |
| `ci` | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

## Rules

The `commit-msg` hook rejects a commit when:

- `type` is empty, not lower-case, or not one of the types above
- `description` is empty, ends with `.`, or is written in Sentence case, Start Case, PascalCase, or UPPER CASE
- the header (first line) is longer than 100 characters
- any body or footer line is longer than 100 characters

A missing blank line before the body or a footer is a warning, not a rejection.

## Examples

```text
docs: correct spelling of CHANGELOG
feat(lang): add Polish language
```

## Breaking changes

A breaking change MUST be indicated in the type/scope prefix **or** as a footer entry — either alone is enough. `BREAKING CHANGE` MUST be uppercase, followed by a colon and a space; `BREAKING-CHANGE` is synonymous.

As a footer:

```text
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

As a `!` after the type/scope — the footer MAY then be omitted, and the description describes the breaking change:

```text
feat!: send an email to the customer when a product is shipped
feat(api)!: send an email to the customer when a product is shipped
```

Both:

```text
feat!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```
