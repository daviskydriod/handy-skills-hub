// File: frontend/src/pages/ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import axios from 'axios';

const NAVY  = '#0b1f3a';
const NAVY2 = '#0f2d56';
const GOLD  = '#EAB308';
const GOLD2 = '#CA8A04';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }

    setLoading(true);
    try {
      await axios.post('/api/forgot-password.php', { email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        .hg-page {
          min-height: 100vh;
          background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 50%, #0a1628 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .hg-page::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(234,179,8,0.06) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none;
        }
        .hg-page::after {
          content: ''; position: absolute;
          top: -120px; right: -120px; width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,179,8,0.12), transparent 70%);
          pointer-events: none;
        }
        .hg-card {
          width: 100%; max-width: 400px; background: #fff;
          border-radius: 24px; padding: 36px 32px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);
          position: relative; z-index: 1;
          animation: cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .hg-logo-wrap {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          text-decoration: none; margin-bottom: 28px;
        }
        .hg-logo-img {
          width: 44px; height: 44px; border-radius: 12px; object-fit: contain;
          border: 2px solid ${GOLD}40; box-shadow: 0 2px 12px ${GOLD}30;
        }
        .hg-logo-text { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 18px; color: ${NAVY}; }
        .hg-title { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 22px; color: ${NAVY}; text-align: center; margin-bottom: 4px; }
        .hg-subtitle { text-align: center; font-size: 13.5px; color: #64748b; margin-bottom: 28px; line-height: 1.6; }
        .hg-label { display: block; font-size: 12px; font-weight: 700; color: ${NAVY}; margin-bottom: 6px; }
        .hg-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: ${NAVY}; background: #f8fafc;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .hg-input:focus { border-color: ${NAVY}; background: #fff; box-shadow: 0 0 0 3px ${NAVY}15; }
        .hg-input::placeholder { color: #94a3b8; }
        .hg-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, ${GOLD}, ${GOLD2});
          color: ${NAVY}; font-size: 14px; font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.2s; margin-top: 16px;
        }
        .hg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px ${GOLD}60; }
        .hg-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .hg-back { text-align: center; font-size: 13px; color: #64748b; margin-top: 20px; }
        .hg-back a { color: ${NAVY2}; font-weight: 700; text-decoration: none; }
        .hg-back a:hover { text-decoration: underline; }
        .hg-success {
          text-align: center; padding: 20px 0;
          animation: cardIn 0.4s ease;
        }
        .hg-success-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, ${GOLD}25, ${GOLD}10);
          border: 2px solid ${GOLD}40;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin: 0 auto 18px;
        }
        .hg-success-title { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 20px; color: ${NAVY}; margin-bottom: 10px; }
        .hg-success-text { font-size: 13.5px; color: #64748b; line-height: 1.7; margin-bottom: 24px; }
        .hg-success-note {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 12px 16px; font-size: 12px; color: #64748b; text-align: left;
          margin-bottom: 20px;
        }
        .hg-success-note strong { color: ${NAVY}; }
      `}</style>

      <div className="hg-page">
        <div className="hg-card">

          <Link to="/" className="hg-logo-wrap">
            <img src={logo} alt="HandyGidi" className="hg-logo-img" />
            <span className="hg-logo-text">HandyGidi</span>
          </Link>

          {sent ? (
            /* ── Success state ── */
            <div className="hg-success">
              <div className="hg-success-icon">📬</div>
              <h2 className="hg-success-title">Check Your Inbox</h2>
              <p className="hg-success-text">
                We've sent a password reset link to <strong style={{ color: NAVY }}>{email}</strong>.
                The link expires in <strong style={{ color: NAVY }}>30 minutes</strong>.
              </p>
              <div className="hg-success-note">
                <strong>Didn't receive it?</strong> Check your spam or junk folder.
                If it's still not there, please contact us at{' '}
                <a href="mailto:info@handygiditrainingcentre.com" style={{ color: GOLD2 }}>
                  info@handygiditrainingcentre.com
                </a>
              </div>
              <div className="hg-back">
                <Link to="/login">← Back to Login</Link>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1 className="hg-title">Forgot Password?</h1>
              <p className="hg-subtitle">
                Enter your registered email and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="hg-label">Email Address</label>
                <input
                  className="hg-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
                <button type="submit" className="hg-btn" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>

              <p className="hg-back">
                Remembered it? <Link to="/login">Back to Login</Link>
              </p>
            </>
          )}

        </div>
      </div>
    </>
  );
}
