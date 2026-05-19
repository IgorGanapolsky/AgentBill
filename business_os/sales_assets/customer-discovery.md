# Customer Discovery Script — for any 15-min Skill user call

**When to use:** any conversation with someone who has actually invoked one of the Skills. Goal is signal, not pitch. The pitch lives in the Skill's CTA, not the call.

**Time box:** 15 minutes hard. No demos. No slides.

---

## 1. Context (60 seconds)

> "Thanks for the time. I'm running an experiment — I shipped 5 Grok Skills last week as lead magnets and I'm trying to figure out what actually lands. You're one of the people who invoked one. I want to ask 4 questions, total 15 min. Sound good?"

## 2. Pain mapping (4 min)

- What were you doing in the 30 min before you opened the Skill?
- What's the actual pain — in their words, not yours? (Write down their exact phrasing.)
- How are you currently solving it? (Even "I tolerate it" is a real answer.)
- What's the cost of NOT solving it? (Time, money, sanity, missed deadlines?)

## 3. Value test (4 min)

- What did the Skill output that was actually useful?
- What did it get wrong or miss?
- Did you click the CTA? If yes, what got you to click. If no, what stopped you.
- Would you pay $19/mo for the related tool (ThumbGate / OpenClaw / AnswerGuard) if it solved the pain end-to-end? Why or why not?

## 4. Word-of-mouth test (3 min)

- Who else has this pain? Name 1–2 specific people.
- Would you intro me? If yes, what's the line they'd respond to?
- If you saw this Skill on Reddit / X / LinkedIn — which would you trust more, and why?

## 5. Close (90 seconds)

- Anything you wish I'd asked but didn't?
- Anything you want from me in the next week? (Even "send me a link to X.")
- Confirm permission to ping again in 30 days for a follow-up.

---

## Logging

After every call, in 5 minutes max, append a row to `business_os/discovery_calls.csv`:

| Date | Person | Skill they invoked | Top pain phrase (verbatim) | Would pay? | Intro to | Action |
|---|---|---|---|---|---|---|

If you can't fill the "Top pain phrase (verbatim)" column with a real quote, the call wasn't a discovery call — it was a pitch you accidentally gave. Don't do that.

---

## Hard rules

- Never demo on a discovery call. They asked to talk; they didn't ask to be sold.
- Never promise a feature on the call. "I'll think about it" is a complete answer.
- Never end a call without naming the next thing you'll send them (link, fix, intro, follow-up).
