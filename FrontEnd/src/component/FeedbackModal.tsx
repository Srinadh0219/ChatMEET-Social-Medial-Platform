import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { X, Send, Bug, Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'bug' | 'feedback';
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, defaultType = 'feedback' }) => {
  const [type, setType] = useState<'bug' | 'feedback'>(defaultType);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setMessage('');
      setEmail('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast.error('Please fill in all fields', { position: 'top-center' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, message }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit feedback');

      toast.success(type === 'bug' ? 'Bug report sent! Thank you.' : 'Feedback sent! Thank you.', {
        position: 'top-center',
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        color: '#000',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '420px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          border: '1px solid #e0f2fe',
          zIndex: 1,
          color: '#000',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #f0f9ff',
          backgroundColor: '#f8fafc',
          flexShrink: 0,
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 900, margin: 0, color: '#000' }}>
            {type === 'bug' ? <Bug style={{ width: 20, height: 20, color: '#ef4444' }} /> : <Lightbulb style={{ width: 20, height: 20, color: '#0ea5e9' }} />}
            {type === 'bug' ? 'Report a Bug' : 'Share Feedback'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Type Toggle */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => setType('feedback')}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: type === 'feedback' ? '#fff' : 'transparent',
                color: type === 'feedback' ? '#0284c7' : '#6b7280',
                boxShadow: type === 'feedback' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Feedback
            </button>
            <button
              type="button"
              onClick={() => setType('bug')}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: type === 'bug' ? '#fff' : 'transparent',
                color: type === 'bug' ? '#ef4444' : '#6b7280',
                boxShadow: type === 'bug' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Bug Report
            </button>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#000' }}>Your Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 500,
                border: '1px solid #e0f2fe',
                borderRadius: '12px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                boxSizing: 'border-box',
                color: '#111827',
                WebkitTextFillColor: '#111827',
              }}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#000' }}>
              {type === 'bug' ? 'Describe the issue' : 'What is your feedback?'}
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={type === 'bug' ? 'Steps to reproduce the bug...' : 'I would love to see...'}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 500,
                border: '1px solid #e0f2fe',
                borderRadius: '12px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                resize: 'none',
                boxSizing: 'border-box',
                color: '#111827',
                WebkitTextFillColor: '#111827',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(to right, #0ea5e9, #4f46e5)',
              color: '#fff',
              WebkitTextFillColor: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(14,165,233,0.25)',
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Sending...
              </>
            ) : (
              <>
                <Send style={{ width: 16, height: 16 }} /> Send {type === 'bug' ? 'Report' : 'Feedback'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default FeedbackModal;
