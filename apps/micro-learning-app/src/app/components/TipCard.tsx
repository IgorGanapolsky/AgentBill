'use client';

import React, { useState } from 'react';
import { CodingTip } from '../types';

interface TipCardProps {
  tip: CodingTip;
}

export default function TipCard({ tip }: TipCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tip.likes);

  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tip.title,
        text: tip.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Share link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="tip-card">
      <div className="video-placeholder">
        {/* Placeholder for video content */}
        <div style={{ color: '#333', fontSize: '4rem', fontWeight: 'bold', opacity: 0.2 }}>
          {tip.id}
        </div>
      </div>

      <div className="tip-content">
        <div className="tip-author">@{tip.author}</div>
        <h2 className="tip-title">{tip.title}</h2>
        <p className="tip-description">{tip.description}</p>
      </div>

      <div className="actions-container">
        <button className="action-button" onClick={handleLike}>
          <div className="action-icon" style={{ color: liked ? '#ff0050' : 'white' }}>
            {liked ? '❤️' : '🤍'}
          </div>
          <span className="action-label">{likesCount}</span>
        </button>

        <button className="action-button" onClick={handleShare}>
          <div className="action-icon">
            ↗️
          </div>
          <span className="action-label">Share</span>
        </button>
      </div>
    </div>
  );
}
