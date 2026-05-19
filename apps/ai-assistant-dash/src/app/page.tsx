import React from 'react';

const blogPosts = [
  {
    title: 'The AI Repeat Tax: How to find and fix token waste in Cursor/Claude Code',
    excerpt: 'Stop leaking money on repeated AI mistakes. Learn how to identify and block token waste with Pre-Action Gates.',
    slug: 'ai-repeat-tax',
    category: 'Optimization',
    date: 'Oct 24, 2023',
  },
  {
    title: 'Agent Safety 101: Why you need a pre-action gate for autonomous coding',
    excerpt: 'Move from "YOLO" to "Verified". Discover how ThumbGate protects your codebase from autonomous agent errors.',
    slug: 'agent-safety-101',
    category: 'Safety',
    date: 'Oct 25, 2023',
  },
  {
    title: 'Is that a scam? Using AI to decode fraudulent voicemails',
    excerpt: 'In the age of deepfakes, intent is everything. Learn how AnswerGuard uses AI to shield you from sophisticated fraud.',
    slug: 'is-that-a-scam',
    category: 'Security',
    date: 'Oct 26, 2023',
  },
];

export default function Home() {
  return (
    <main className="container">
      <header style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>AI Assistant Dashboard</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
          Optimize, Secure, and Scale your AI-powered workflows.
        </p>
      </header>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Latest Insights</h2>
          <a href="/blog">View all posts &rarr;</a>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <div key={post.slug} className="card">
              <span className="badge">{post.category}</span>
              <h3 style={{ marginTop: '0.5rem' }}>{post.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{post.date}</p>
              <p>{post.excerpt}</p>
              <a href={`/blog/${post.slug}`} className="btn" style={{ padding: '0.5rem 1rem' }}>Read Article</a>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '4rem' }}>
        <h2>Core Products</h2>
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3>ThumbGate</h3>
            <p>The industry standard for Pre-Action Gates. Block repeat AI mistakes and secure your autonomous agents.</p>
            <a href="https://thumbgate.ai">Visit thumbgate.ai &rarr;</a>
          </div>
          <div className="card">
            <h3>AnswerGuard</h3>
            <p>Privacy-first AI protection for your communications. Real-time scam detection and call screening.</p>
            <a href="https://answerguard.ai">Visit answerguard.ai &rarr;</a>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
      `}</style>
    </main>
  );
}
