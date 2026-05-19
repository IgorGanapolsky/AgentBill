# Reddit r/ClaudeAI — Skills Launch Post

**Status:** drafted, NOT sent. Posting needs your explicit go-ahead.

**Subreddit:** r/ClaudeAI (primary), r/ChatGPTCoding (secondary, 48h later), r/cursor (tertiary).
**Flair:** "Resource" or "Tool" (subreddit-dependent — check).
**Goal:** community engagement → skill installs → ThumbGate funnel.

**Important rule per existing ThumbGate distribution runbook:** Reddit hates self-promo. Lead with the problem, give the tool for free, the upgrade is one line at the bottom. Reply to every comment within 4h.

---

## Title (pick one — test in mod-friendly order)

A. "I built a Grok Skill that audits your AI coding bill for repeat-offender patterns (free, OSS)"

B. "PSA: your Claude bill is billing you twice for the same lesson — here's a free auditor"

C. "Free Grok Skill: /ai-bill-auditor — finds the patterns your agent keeps repeating"

---

## Body

> I've been running 4 agents (Claude Code, Cursor, Codex, Gemini CLI) for ~6 months and my monthly bill kept creeping up even though my output didn't. Turned out a lot of it was the same mistake on repeat — force-pushes the agent kept retrying after correction, hallucinated imports it re-imported every session, "let me try a different approach" loops that re-loaded full context.
>
> I built a Grok Skill that quantifies the waste:
>
> **`/ai-bill-auditor`** — paste your last week of agent transcripts or your provider invoice. It returns:
>
> - The top repeat-offender patterns with occurrence count and estimated $/month each
> - The one-line prevention rule that would have skipped the repeat
> - Total monthly $ if you enforced all of them
>
> Runs inside Grok (web, iOS, Android — all three from the same skill bundle, that's the nice thing about Skills). Zero install.
>
> **Skill bundle:** github.com/IgorGanapolsky/grok-apps (5 skills in total — also one for triaging pending agent actions, one for scam-call decoding, one for GTM bottleneck diagnosis, one for HIIT coaching, pick what you need)
>
> **If you want the prevention layer:** I also maintain ThumbGate — open-source MCP server that blocks the patterns at the tool-call level. Free tier covers most solo use; Pro at $19/mo adds auto-rule promotion + multi-repo sync. `npx thumbgate init`. Not required for the Skill — the Skill stands alone.
>
> Happy to walk through specific patterns it finds in your transcripts if you share. (Don't share secrets.)

---

## Reply playbook

When someone replies with "what about X?":
- Give a real answer first. Compare to thumbgate honestly only if directly relevant.
- If they share a transcript snippet: actually run the analysis and post the result. Highest-value comment in any thread is the operator showing their work.
- If someone says it's just a custom GPT clone: agree, then note the difference (Skill ships across web/iOS/Android Grok from one bundle; custom GPTs are ChatGPT-only).

## Approval queue

- [ ] Confirm title A.
- [ ] Confirm Igor's reddit username for the post.
- [ ] Confirm we have karma in r/ClaudeAI to post a tool (subreddit rule check).
- [ ] Confirm timing — Mon morning ET is the existing ThumbGate Reddit slot.
