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

export default function BlogIndex() {
  return (
    <main className="container">
      <header style={{ padding: '2rem 0' }}>
        <h1>Blog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Latest updates on AI optimization, safety, and security.</p>
      </header>

      <section>
        {blogPosts.map((post) => (
          <div key={post.slug} className="card">
            <span className="badge">{post.category}</span>
            <h3 style={{ marginTop: '0.5rem' }}>{post.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{post.date}</p>
            <p>{post.excerpt}</p>
            <a href={`/blog/${post.slug}`} className="btn" style={{ padding: '0.5rem 1rem' }}>Read Full Article</a>
          </div>
        ))}
      </section>
    </main>
  );
}
