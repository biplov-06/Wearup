import React, { useState, useEffect } from 'react';
import '../product.css';
import { API_BASE } from '../config';

export default function CommentModal({ productId, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Debug logging
  console.log('CommentModal props:', { productId, isOpen, onClose });

  useEffect(() => {
    if (isOpen && productId) {
      fetchComments();
    }
  }, [isOpen, productId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}/product-comments/?product=${productId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Sort comments by newest first
        setComments(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert('Please login to comment');
        return;
      }

      const response = await fetch(`${API_BASE}/product-comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product: productId,
          content: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(); // Refresh comments
      } else {
        alert('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>Comments ({comments.length})</h3>
          <button className="comment-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comment-modal-body">
          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="comment-input-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              rows="3"
              disabled={submitting}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {loading ? (
              <div className="comment-loading">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="no-comments">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    <img
                      src={`https://ui-avatars.com/api/?name=${comment.user.first_name || comment.user.username}&size=32&background=667eea&color=fff`}
                      alt={comment.user.username}
                    />
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.user.first_name && comment.user.last_name
                          ? `${comment.user.first_name} ${comment.user.last_name}`
                          : comment.user.username}
                      </span>
                      <span className="comment-time">
                        {formatTimestamp(comment.created_at)}
                      </span>
                    </div>
                    <div className="comment-text">{comment.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
