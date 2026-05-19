# Make.com Scenario — Grok-Skills Engagement Watcher

**Status:** blueprint only. Will activate after you give the go-ahead via `mcp__claude_ai_Make__scenarios_create`.

**Goal:** alert Igor when meaningful engagement happens on the `grok-apps` GitHub repo or in the ThumbGate funnel — so the operator playbook gets reactive, not just scheduled.

---

## Trigger

**Module:** GitHub > Watch Repository Events
**Repo:** `IgorGanapolsky/grok-apps`
**Events:** `star`, `fork`, `issue.opened`, `pull_request.opened`, `release.published`
**Polling:** every 15 minutes (Make free tier compatible)

## Router

Three branches.

### Branch A — high-signal (star or fork)

**Condition:** event ∈ {star, fork}

**Path:**
1. **Filter:** ignore if actor login is in `["IgorGanapolsky"]` (self-events).
2. **HTTP GET:** GitHub API user profile of the actor (`/users/{login}`). Capture: name, bio, twitter_username, company, blog.
3. **Email** via Gmail (later — Gmail MCP is connecting): subject `[grok-apps] new <event> from <login> — <name>`, body includes user profile + link to repo.

**Why:** every star/fork is a soft lead. Igor wants to know who, not just the count.

### Branch B — issue or PR

**Condition:** event ∈ {issue.opened, pull_request.opened}

**Path:**
1. **Filter:** body length > 50 (skip empty/spam).
2. **Slack/email:** alert with title + body + author + link.
3. **Auto-reply on issue:** a polite "thanks, will look within 24h" with a triage label.

**Why:** issues + PRs are highest-trust signals. Response speed within 24h doubles conversion to actual community.

### Branch C — release

**Condition:** event = release.published

**Path:**
1. **Twitter post** (later — needs X API): tweet the release notes one-liner.
2. **LinkedIn post** (later — needs LinkedIn API): same content, longer form.

**Why:** every release is free distribution; manual posting is the current bottleneck.

---

## Manual setup steps (until activated programmatically)

1. Log in to Make.com (existing account).
2. Create new scenario → "Grok-Skills Engagement Watcher".
3. Add modules per the blueprint above.
4. Wire GitHub connection (existing Make.com connector → IgorGanapolsky org).
5. Wire Gmail connection (existing).
6. Test with a manual trigger before activating.
7. Set scenario to active.

## Why this isn't activated programmatically yet

The Make.com MCP server in this session is connected; the Igor-side authorization for "create + activate a scenario that automatically emails me + posts on socials" should be explicit. Confirm and the activation is one tool call: `mcp__claude_ai_Make__scenarios_create`.

## Approval queue

- [ ] Confirm we should auto-email on stars/forks (could be noisy if grok-apps catches fire).
- [ ] Confirm we should auto-reply on issues (some maintainers prefer manual touch).
- [ ] Confirm whether to wire Twitter/LinkedIn at release time, or hold those until you've shipped a first release.
