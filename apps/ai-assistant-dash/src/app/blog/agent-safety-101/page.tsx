import React from 'react';

export default function BlogPost() {
  return (
    <article className="container">
      <header>
        <span className="badge">Safety</span>
        <h1>Agent Safety 101: Why you need a pre-action gate for autonomous coding</h1>
        <p style={{ color: 'var(--text-muted)' }}>Posted on October 25, 2023</p>
      </header>

      <section>
        <p>
          As we move from "AI-assisted" to "AI-autonomous" coding, the risk profile of our development environments changes. 
          When an agent has the power to run <code>rm -rf</code>, commit to production, or expose API keys, "trust but verify" is no longer enough. 
          You need a <strong>Pre-Action Gate</strong>.
        </p>

        <h2>The "YOLO" Problem in Autonomous Agents</h2>
        <p>
          Most AI agents operate in what we call "YOLO mode"—they receive a command and execute it immediately. 
          While this is fast, it lacks the guardrails required for enterprise or even high-stakes personal projects. 
          A single hallucinated flag in a shell command can lead to catastrophic data loss.
        </p>

        <div className="card">
          <h3>Critical Safety Risks</h3>
          <ul>
            <li><strong>Command Injection:</strong> Agents misinterpreting user input as executable code.</li>
            <li><strong>Recursive Deletion:</strong> Accidentally wiping out the wrong directory.</li>
            <li><strong>Secret Exposure:</strong> Committing <code>.env</code> files to public repositories.</li>
          </ul>
        </div>

        <h2>Enter Pre-Action Gates</h2>
        <p>
          A Pre-Action Gate is a middleman that sits between the AI's intent and the system's execution. 
          It evaluates every proposed tool call against a set of safety policies.
        </p>

        <h3>How ThumbGate Protects Your Codebase</h3>
        <p>
          <strong>ThumbGate</strong> is the industry standard for pre-action enforcement. 
          It allows you to define "Protected Paths" and "Blocked Commands" that require explicit human approval, 
          even if the agent is running autonomously.
        </p>

        <ul>
          <li><strong>Local-First:</strong> Runs entirely on your machine, ensuring your code never leaves your network.</li>
          <li><strong>Audit Trail:</strong> Every blocked action is logged with the reason why, creating a "rejection ledger" you can review.</li>
          <li><strong>Biometric Approval:</strong> Use TouchID or FaceID to approve high-risk actions in a split second.</li>
        </ul>

        <a href="https://thumbgate.ai/?utm_source=blog&utm_medium=article&utm_campaign=agent-safety-101" className="btn">
          Secure Your Agent with ThumbGate
        </a>
      </section>

      <hr style={{ margin: '4rem 0', border: '0', borderTop: '1px solid var(--card-border)' }} />

      <aside>
        <h3>Related Skills</h3>
        <p>Explore the Approval Inbox skill to manage your agent's pending requests efficiently.</p>
        <a href="/skills/approval-inbox">View Skill &rarr;</a>
      </aside>
    </article>
  );
}
